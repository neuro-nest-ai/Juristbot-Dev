const express = require('express');
const crypto = require('crypto');
const router = express.Router();
const { getPool } = require('../database/db');
const db = getPool();
require('dotenv').config();
const jwt = require('jsonwebtoken');
const sendInvoice = require('../invoice/send_invoice');
const sendEmailupdate = require('../routes/updateprofile');
const sendWhatsAppTemplate = require('../watemplate/subtemplate');
const sendEmaildemo = require('../routes/Demoemail');
const  { getRazorpay, getRazorpaySecretKey }  = require('../utils/razorpayvalut');



const credit = {
    standard: {
      monthly: {credits:750},
      yearly: { credits:7500 },
    },
    premium: {
        monthly: {credits:2500},
      yearly: { credits:25000},
    },
    pro: {
       monthly: {credits:10000},
      yearly: { credits:100000 },
    },
  };
  

const initialactivecredit = {
  setup: { credits:750}
}

function addIntervalToEpoch(epochSeconds, interval) {
  let date = new Date(epochSeconds * 1000);
  let match = interval.match(/(?:(\d+)\s*years?)?\s*(?:(\d+)\s*months?)?/i);

  if (!match) {
    throw new Error("Invalid interval format. Use formats like '1 year', '6 months', '1 year 6 months', or '1 month'.");
  }
  let years = parseInt(match[1]) || 0;
  let months = parseInt(match[2]) || 0;
  date.setFullYear(date.getFullYear() + years);
  date.setMonth(date.getMonth() + months);
  return Math.floor(date.getTime() / 1000);
}

function getCreditLimits(planName, billingCycle) {
  if (!planName || !billingCycle) return null;
  const plan = credit[String(planName).toLowerCase()];
  if (!plan) return null;
  const cycle = plan[String(billingCycle).toLowerCase()];
  if (!cycle) return null;
  return { credits: cycle.credits };
}


router.post('/create-order-wallet', async (req, res) => {
  const razorpay = await getRazorpay();
  const { purchaser, planName,amount } = req.body;
  const customer_id = purchaser?.userid;
  const plan_Name = planName || "Wallet";
  const base_amount = Math.round(amount );
  try {
    const gst_rate = 18; 
    const gst_amount = (gst_rate * base_amount) / 100;
    const total_amount_with_gst = Math.round(base_amount + gst_amount); 
    const taxed_amount_paise = total_amount_with_gst * 100
    const order = await razorpay.orders.create({
      amount:  taxed_amount_paise ,
      currency: "INR",
      receipt: `order_rcptid_${customer_id}`,
      payment_capture: 1
    });

    // Insert order into database
    await db.promise().query(
      `INSERT INTO subscriptions (razorpay_sub_id,sub_plan_id, user_id,total_count,paid_count,remaining_count, taxed_amount_in_paise, features, status,plan_Name) VALUES (?, ?, ?, ?, ? , ?, ?, ?, ? ,?)`,
      [order.id, 5, customer_id, 1, 0, 0, taxed_amount_paise, JSON.stringify([1, 2, 3, 4]), "created",plan_Name]
    );

    return res.status(200).json({ success: true, subscription: { id: order.id, } });
  } catch (error) {
    console.error('Error creating order:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to create order',
      error: error.message
    });
  }
});

router.post('/create-order', async (req, res) => {
  const razorpay = await getRazorpay();
  const { plan, purchaser, planName } = req.body;
  console.log('📦 Create Order Request:', { plan, purchaser, planName });
  const rp_plan_id = plan;
  const customer_id = purchaser?.userid;



  try {
    if (!rp_plan_id || !customer_id) {
      return res.status(400).json({
        success: false,
        message: 'Missing required fields: plan_id, customer_id, selected features'
      });
    }

    const [planResult] = await db.promise().query(
      `SELECT *, ROUND(plan_amount / 100 + ((gst_percent * plan_amount) / 10000)) AS taxed_amount 
             FROM subscription_plans WHERE razorpay_plan_id = ?`,
      [rp_plan_id]
    );

    if (!planResult.length) {
      return res.status(404).json({ success: false, message: 'Plan not found' });
    }

    let plan_details = planResult[0];
    let taxed_amount_round = Math.round(plan_details.taxed_amount);
    let plan_id = plan_details.id;
    let taxed_am = taxed_amount_round  * 100;
    // Create Razorpay Order
    const order = await razorpay.orders.create({
      amount:  taxed_am ,
      currency: "INR",
      receipt: `order_rcptid_${customer_id}`,
      payment_capture: 1
    });

    // Insert order into database
    await db.promise().query(
      `INSERT INTO subscriptions (razorpay_sub_id,sub_plan_id, user_id,total_count,paid_count,remaining_count, taxed_amount_in_paise, features, status, plan_Name) VALUES (?, ?, ?, ?, ? , ?, ?, ?, ?, ?)`,
      [order.id, plan_id, customer_id, 1, 0, 0,  taxed_am, JSON.stringify([1, 2, 3, 4]), "created",planName]
    );

    return res.status(200).json({ success: true, subscription: { id: order.id, plan_id: plan_details.id } });
  } catch (error) {
    console.error('Error creating order:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to create order',
      error: error.message
    });
  }
});

router.post('/create-subscription', async (req, res) => {
  const { plan, purchaser, months ,planName} = req.body;
  console.log('📦 Create Subscription Request:', { plan, purchaser, months, planName});
  const rp_plan_id = plan;
  const customer_id = purchaser?.userid;
  const razorpay = await getRazorpay();


  try {
    if (!rp_plan_id || !customer_id ) {
      return res.status(400).json({
        success: false,
        message: 'Missing required fields: plan_id, customer_id, selected features'
      });
    }
    const [planResult] = await db.promise().query(
      `SELECT *, ROUND(plan_amount + (gst_percent * plan_amount / 100)) AS taxed_amount 
             FROM subscription_plans WHERE razorpay_plan_id = ?`,
      [rp_plan_id]
    );

    let plan_details = planResult[0];
    let all_features_taxed_amount = Math.round(plan_details.taxed_amount);
    let taxed_am = all_features_taxed_amount ;

    const subscriptionData = {
      plan_id: rp_plan_id,
      customer_notify: 1,
      total_count: months,
      quantity: 1,
    };


     const subscription = await razorpay.subscriptions.create(subscriptionData);
      const insert_sub_query = `INSERT INTO subscriptions 
            (razorpay_sub_id, short_url, sub_plan_id, taxed_amount_in_paise, quantity, features, status,plan_Name, user_id, 
            total_count, paid_count, remaining_count)
            VALUES (?,?,?,?,?,?,?,?,?,?,?,?)`;

      const sub_values = [
        subscription.id,
        subscription.short_url || "",
        plan_details.id,
        taxed_am,
        1, 
        JSON.stringify([1, 2, 3, 4]),
        subscription.status,
        planName,
        customer_id,
        subscription.total_count,
        subscription.paid_count || 0,
        subscription.remaining_count || months
      ];

      await db.promise().query(insert_sub_query, sub_values);
     
      return res.status(200).json({
        success: true,
        subscription: { id: subscription.id, plan_id: plan_details.id }
      });
  } catch (error) {
    console.error('Error creating subscription:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to create subscription',
      error: error.message
    });
  }
});


router.post('/verify-subscription', async (req, res) => {
  const {
    razorpay_subscription_id,
    razorpay_order_id,
    razorpay_payment_id,
    razorpay_signature,
    userid,
    plan_id,
    isSubscription,
    planName,
    activeplan
  } = req.body;

  console.log('🔍 Verify Subscription Request:', {
    razorpay_subscription_id,
    razorpay_order_id,
    razorpay_payment_id,
    razorpay_signature,
    userid,
    plan_id,
    isSubscription,
    planName,
    activeplan
  });

  if (!razorpay_payment_id || !(razorpay_subscription_id || razorpay_order_id) || !razorpay_signature) {
    return res.status(400).json({ status: 'failure', error: 'Missing required fields' });
  }

  const connection = await db.promise().getConnection();

  try {
    // Verify signature
    const keySecret = await getRazorpaySecretKey();
    const hmac = crypto.createHmac('sha256', keySecret);
    const pair = isSubscription ? `${razorpay_payment_id}|${razorpay_subscription_id}` : `${razorpay_order_id}|${razorpay_payment_id}`;
    hmac.update(pair);
    const generatedSignature = hmac.digest('hex');

    if (generatedSignature !== razorpay_signature) {
      connection.release();
      return res.status(400).json({ status: 'failure', error: 'Invalid signature' });
    }

    await connection.beginTransaction();

    const sub_start = Math.floor(Date.now() / 1000);
    const sub_end = addIntervalToEpoch(sub_start, '1 year');
    const current_cycle_end = addIntervalToEpoch(sub_start, '1 month');

    const razorpay_id = isSubscription ? razorpay_subscription_id : razorpay_order_id;

    const [subResults] = await connection.query(
      `SELECT * FROM subscriptions WHERE razorpay_sub_id = ?`,
      [razorpay_id]
    );

    if (!subResults || subResults.length === 0) {
      await connection.rollback();
      connection.release();
      return res.status(404).json({
        status: 'failure',
        error: 'Subscription not found',
        subResults,
      });
    }

    const subResult = subResults[0];
    const status = isSubscription ? 'active' : 'completed';

    await connection.query(
      `UPDATE subscriptions SET 
        status = ?, 
        current_start = FROM_UNIXTIME(?), 
        current_end = FROM_UNIXTIME(?), 
        sub_start = FROM_UNIXTIME(?), 
        sub_end = FROM_UNIXTIME(?),
        user_id = ? 
      WHERE razorpay_sub_id = ?`,
      [status, sub_start, current_cycle_end, sub_start, sub_end, userid, razorpay_id]
    );

    const [userRows] = await connection.query(
      `SELECT role FROM chatsignup WHERE id = ? LIMIT 1`,
      [userid]
    );

  
    if (planName && planName.toLowerCase() !== 'wallet') {
      const activeplans = Number(activeplan) === 0 ? 1 : 1;

      if (planName.toLowerCase() === 'setup') {
        await connection.query(
          `UPDATE chatsignup 
            SET activeplan = ?, trial = 1, membership = ? 
          WHERE id = ?`,
          [activeplans, 1, userid]
        );
        console.log(`📝 Setup plan - activeplan/trial/membership updated for user: ${userid} (plan_id/sub_id skipped)`);
      } else {
        await connection.query(
          `UPDATE chatsignup 
            SET plan_id = ?, sub_id = ?, activeplan = ?, trial = 1, membership = ?, trial_pack = 1,trail_pack_date = NOW()
          WHERE id = ?`,
          [plan_id, subResult.id, activeplans, 1, userid]
        );
        console.log(`📝 ${planName} plan updated for user: ${userid}`);
      }
    } else {
      console.log('💳 Wallet plan - No plan_id/sub_id update');
    }

    if (planName && planName.toLowerCase() !== 'wallet' && planName.toLowerCase() !== 'setup') {
      const billingCycle = isSubscription ? 'monthly' : 'yearly';
      const creditLimits = getCreditLimits(planName, billingCycle);

      if (creditLimits) {
        await connection.query(
          `INSERT INTO Credits (user_id, sub_id, credits) VALUES (?, ?, ?)`,
          [userid, subResult.id, creditLimits.credits]
        );
        console.log(`✅ Credits assigned - ${planName} (${billingCycle}):`, creditLimits);
      } else {
        console.warn(`⚠️ No credit matched for plan: ${planName}, cycle: ${billingCycle}`);
      }
    } else if (planName && planName.toLowerCase() === 'setup') {
      console.log('ℹ️ Setup plan - no credits added');
    }

    await connection.query(
      `INSERT INTO user_courses (user_id, course_id, is_active)
       VALUES (?, ?, ?)
       ON DUPLICATE KEY UPDATE is_active = 1`,
      [userid, 1, 1]
    );
    console.log(`✅ Course enrolled for user ${userid}`);

    await connection.commit();

    // Get user data
    const [usrResults] = await connection.query(
      `SELECT usr.*, sub.status, sub.sub_end, sub.id AS sub_id, sub.short_url, usr.plan_id, 
              sub.features, sub.razorpay_sub_id AS rp_sub_id
       FROM chatsignup usr
       LEFT JOIN subscriptions sub ON usr.sub_id = sub.id
       WHERE usr.id = ?`,
      [userid]
    );

    connection.release();

    if (!usrResults || usrResults.length === 0) {
      return res.status(404).json({ status: 'failure', error: 'User not found' });
    }

    const user = usrResults[0];
    const payload = {
      id: user.id,
      username: user.username,
      mobile_no: user.mobile_no,
      role: user.role,
      email: user.email,
      state: user.state,
      town: user.town,
      sub_status: user.status,
      sub_end: user.sub_end,
      sub_id: user.sub_id,
      short_url: user.short_url,
      plan_id: user.plan_id,
      features: user.features,
      rp_sub_id: user.rp_sub_id,
      trail: user.trail,
      activeplan: user.activeplan,
      oldchat: user.oldchat,
      free_tier: user.free_tier
    };

    const token = jwt.sign(payload, process.env.JWT_SECRET_KEY, { expiresIn: '1h' });

    if (user.activeplan === 0) {
      sendEmaildemo(user).catch(err => console.error('Demo email error:', err));
    }
    sendWhatsAppTemplate(user).catch(err => console.error('WhatsApp error:', err));

    res.status(200).json({ status: 'success', token });

  } catch (error) {
    await connection.rollback();
    connection.release();
    console.error('Error verifying subscription:', error);
    res.status(500).json({ error: 'Failed to verify subscription' });
  }
});

// ==========================================
// WEBHOOK ENDPOINT - FIXED VERSION
// ==========================================
router.post("/juristbot-webhook-subscription-charge", async (req, res) => {
  const connection = await db.promise().getConnection();
  
  try {
    await connection.beginTransaction();
    let payload = req.body.payload;
    console.log('📬 Webhook received:', req.body.event);
    let subscription = payload["subscription"] || payload["order"];
    subscription = subscription["entity"];
   console.log('📬 Webhook received:', req.body.event, 'Subscription/Order ID:', subscription.id);
    // Check if subscription exists
    const [Sub_dbRes] = await connection.query(
      `SELECT * FROM subscriptions WHERE razorpay_sub_id = ?`, 
      [subscription.id]
    );

    if (!Sub_dbRes.length) {
      await connection.rollback();
      return res.status(200).json({
        status: 'success',
        message: "webhook received but subscription not in juristbot system"
      });
    }

    const subData = Sub_dbRes[0];
    let payment = null;
    if (req.body["contains"]?.includes("payment")) {
      payment = payload["payment"]["entity"];
    }

    // Update subscription status
    if (subscription.id.includes("order")) {
      subscription["status"] = "completed";
      subscription["total_count"] = 1;
      subscription["paid_count"] = 1;
      subscription["remaining_count"] = 0;
      subscription["refearn"] = 1;
    }

    subscription["current_start"] = subscription.current_start || Math.floor(Date.now() / 1000);
    subscription["current_end"] = addIntervalToEpoch(subscription["current_start"], '1 month');

    await connection.query(
      `UPDATE subscriptions SET
        status = ?, total_count = ?, paid_count = ?, remaining_count = ?,
        current_start = FROM_UNIXTIME(?), current_end = FROM_UNIXTIME(?) ,refearn = 0
        WHERE razorpay_sub_id = ?`, 
      [
        subscription.status,
        subscription.total_count,
        subscription.paid_count,
        subscription.remaining_count,
        subscription.current_start,
        subscription.current_end,
        subscription.id
      ]
    );

    // Handle payment-related logic
    if ((req.body["event"] === "subscription.charged" || 
         req.body["event"] === "order.paid" || 
         req.body["event"] === "subscription.cancelled") && payment) {

      // Generate invoice number
      const now = new Date();
      let startYearFull, endYearFull;
      if (now.getMonth() + 1 >= 4) {
        startYearFull = now.getFullYear();
        endYearFull = now.getFullYear() + 1;
      } else {
        startYearFull = now.getFullYear() - 1;
        endYearFull = now.getFullYear();
      }

      const [txCountRes] = await connection.query(
        `SELECT COUNT(*) AS total_rows 
         FROM transactions 
         WHERE created_at BETWEEN ? AND ?`,
        [`${startYearFull}-04-01 00:00:00`, `${endYearFull}-03-31 23:59:59`]
      );

      const invoiceRowNo = txCountRes[0].total_rows + 1;
      const shortStart = String(startYearFull).slice(2);
      const shortEnd = String(endYearFull).slice(2);
      const invoiceNoFormatted = `#NNJB/${String(invoiceRowNo).padStart(3, '0')}/${shortStart}-${shortEnd}`;

      // Insert transaction
      await connection.query(
        `INSERT INTO transactions 
          (amount_in_paise, razorpay_pay_id, sub_id, order_id, invoice_id, payment_method, status, created_at, invoice_number)
          VALUES (?, ?, ?, ?, ?, ?, ?, NOW(), ?)`,
        [
          payment["amount"],
          payment["id"],
          subData["id"],
          payment["order_id"],
          payment["invoice_id"] || "order has no invoice",
          payment["method"],
          payment["status"],
          invoiceNoFormatted
        ]
      );

      const [paymentDBResArr] = await connection.query(
        `SELECT * FROM transactions WHERE razorpay_pay_id = ?`,
        [payment["id"]]
      );

      if (paymentDBResArr.length) {
        const paymentDBRes = paymentDBResArr[0];

        // Get user and plan details
        const [userResults] = await connection.query(
          `SELECT * FROM chatsignup WHERE id = ?`, 
          [subData["user_id"]]
        );
        const buyerDetails = userResults[0];

        const [planResults] = await connection.query(
          `SELECT * FROM subscription_plans WHERE id = ?`, 
          [subData.sub_plan_id]
        );
        const planData = planResults[0];

        // Handle credits for recurring payments
        const planName = subData.plan_Name?.toLowerCase();
        const billingCycle = subscription.id.includes("order") ? "yearly" : "monthly";
        const isRecurring = subscription.paid_count > 0;
        
        // Get user role for credit lookup
        const [buyerRows] = await connection.query(
          `SELECT role FROM chatsignup WHERE id = ?`,
          [subData.user_id]
        );
        const userRole = (buyerRows?.[0]?.role || 'advocate').toLowerCase();

        console.log(`📊 Webhook - Processing ${planName}  | Recurring: ${isRecurring}`);

          if (planName !== 'wallet' && planName !== 'setup' && subscription.paid_count > 1) {
            const creditLimits = getCreditLimits(subData.plan_Name, billingCycle, false);
            
            if (creditLimits) {
              await connection.query(
                `INSERT INTO Credits (user_id, sub_id, credits)
                VALUES (?, ?, ?)`,
                [
                  subData.user_id,
                  subData.id,
                  creditLimits.credits
                ]
              );
              console.log(`✅ ${billingCycle} credits re-added for - ${planName} (renewal #${subscription.paid_count})`);
            } else {
              console.warn(`⚠️ No credits found for ${userRole} - ${billingCycle}`);
            }
          } else if (planName !== 'wallet' && planName !== 'setup' && subscription.paid_count === 1) {
            console.log(`ℹ️ First payment (paid_count=1) for ${planName} — credits already added via /verify-subscription, skipping webhook credit insert`);
          }
        // Auto-enroll student in course if needed
          const coursesToEnroll = ['advocate', 'lawyer', 'judge', 'student', 'company'];
        
        if (coursesToEnroll.includes(userRole)) {
          try {
            await connection.query(
              `INSERT INTO user_courses (user_id, course_id, is_active)
              VALUES (?, ?, ?)
              ON DUPLICATE KEY UPDATE is_active = 1`,
              [subData.user_id, 1, 1]
            );
            console.log(`✅ Course enrolled for ${userRole} - user ${subData.user_id}`);
          } catch (enrollmentError) {
            console.warn(`⚠️ Course enrollment error for ${userRole}:`, enrollmentError.message);
          }
        }

          console.log(`📚 Enrollment Summary - User: ${subData.user_id}, Plan: ${planName}, Course: 1`);


        if (planName === "setup") {
          const setupCredits = initialactivecredit.setup.credits;

          const [walletRes] = await connection.query(
            `SELECT wallet_amount FROM wallet WHERE user_id = ?`,
            [subData.user_id]
          );

          if (walletRes.length) {
            const prevWalletAmount = parseFloat(walletRes[0].wallet_amount) || 0;
            const updatedWalletAmount = prevWalletAmount + setupCredits;
            await connection.query(
              `UPDATE wallet SET wallet_amount = ? WHERE user_id = ?`,
              [updatedWalletAmount.toFixed(2), subData.user_id]
            );
          } else {
            await connection.query(
              `INSERT INTO wallet (user_id, wallet_amount) VALUES (?, ?)`,
              [subData.user_id, setupCredits.toFixed(2)]
            );
          }
          console.log(`💳 Setup plan credits (${setupCredits}) added to wallet for user ${subData.user_id}`);
        }

        // Handle wallet plan
        if (planName === "wallet") {
          const baseAmount = (subData.taxed_amount_in_paise / 100) / 1.18;
          const newCredit = parseFloat(baseAmount.toFixed(2));

          const [walletRes] = await connection.query(
            `SELECT wallet_amount FROM wallet WHERE user_id = ?`,
            [subData.user_id]
          );

          if (walletRes.length) {
            const prevWalletAmount = parseFloat(walletRes[0].wallet_amount) || 0;
            const updatedWalletAmount = prevWalletAmount + newCredit;

            await connection.query(
              `UPDATE wallet SET wallet_amount = ? WHERE user_id = ?`,
              [updatedWalletAmount.toFixed(2), subData.user_id]
            );
          } else {
            await connection.query(
              `INSERT INTO wallet (user_id, wallet_amount) VALUES (?, ?)`,
              [subData.user_id, newCredit.toFixed(2)]
            );
          }
          console.log(`💳 Wallet updated with ${newCredit} for user ${subData.user_id}`);
        }
        // Generate and send invoice
        const isOrder = subscription.id.includes("order");
        const gstPercent = Number.isFinite(planData?.gst_percent) ? planData.gst_percent : 18;

        let billPeriod, description, baseAmountRupees;

        if ((subData.plan_Name || "").toLowerCase() === "wallet") {
          const preGst = (subData.taxed_amount_in_paise / 100) / (1 + gstPercent / 100);
          billPeriod = "top up";
          description = "JuristBot Wallet Top-up";
          baseAmountRupees = Number(preGst.toFixed(2));
        } else if ((subData.plan_Name || "").toLowerCase() === "setup") {
          billPeriod = "Ai activation";
          description = "JuristBot Ai activation";
          baseAmountRupees = (planData?.plan_amount || 0) / 100;
        }else {
          billPeriod = isOrder ? "1 year" : "1 month";
          description = isOrder ? "JuristBot yearly Subscription" : "JuristBot monthly Subscription";
          baseAmountRupees = (planData?.plan_amount || 0) / 100;
        }

        const invoiceDetails = {
          invoiceNo: invoiceNoFormatted,
          invoiceDate: new Date().toDateString(),
          orderNo: payment["order_id"],
          payRef: payment["method"] + " " + payment["id"],
          billPeriod: billPeriod
        };

        const lineItems = [
          [description, "998314", billPeriod, baseAmountRupees, baseAmountRupees]
        ];

        const invObject = {
          buyerDetails,
          invoiceDetails,
          lineItems,
          taxPercent: gstPercent
        };

        // Commit transaction BEFORE sending emails
        await connection.commit();
        connection.release();

        // Send emails AFTER committing (non-blocking)
        sendInvoice(invObject).catch(err => console.error('Invoice email error:', err));
        sendEmailupdate(buyerDetails).catch(err => console.error('Update email error:', err));

        return res.status(200).send({
          status: "success subscription and payment",
          invoice_number: invoiceNoFormatted,
          subscription,
          payment: paymentDBRes
        });
      }
    }

    // Commit and respond (no payment case)
    await connection.commit();
    connection.release();
    
    return res.status(200).send({ 
      status: "success subscription only", 
      subscription 
    });

  } catch (error) {
    await connection.rollback();
    connection.release();
    console.error('Error in webhook:', error);
    return res.status(500).json({ 
      status: 'error', 
      message: 'Webhook processing failed' 
    });
  }
});



router.post("/cancel-subscription", async (req, res) => {
  const razorpay = await getRazorpay();
  const { razorpay_sub_id } = req.body;

  if (!razorpay_sub_id) {
    return res.status(400).json({ error: "Missing Parameters" });
  }
  try {
    const subscription = await razorpay.subscriptions.cancel(razorpay_sub_id, false);
    console.log("Razorpay cancel response:", subscription);
    const updatedSub = await razorpay.subscriptions.fetch(razorpay_sub_id);
    console.log("Updated subscription status:", updatedSub.status);

    await db.promise().query(
      `UPDATE subscriptions SET 
        status = ?, 
        sub_end = FROM_UNIXTIME(?), 
        total_count = ?, 
        paid_count = ?,
        remaining_count = ?, 
        short_url = ?
       WHERE razorpay_sub_id = ?`,
      [
        updatedSub.status,
        updatedSub.current_end,
        updatedSub.total_count,
        updatedSub.paid_count,
        updatedSub.remaining_count,
        updatedSub.short_url,
        razorpay_sub_id
      ]
    );
    res.status(200).json({ message: "success", status: updatedSub.status });
  } catch (error) {
    res.status(500).json({ message: "failure", error: error.message });
  }
});



module.exports = router;
