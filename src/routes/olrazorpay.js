const express = require('express');
const crypto = require('crypto');
const router = express.Router();
const { getPool } = require('../database/db');
const db = getPool();
require('dotenv').config();
const jwt = require('jsonwebtoken');
const sendInvoice = require('../invoice/send_invoice');
const sendEmailtemplate  = require('../routes/sentmailtemplatclass');
const sendEmailupdate = require('../routes/updateprofile');
const  { getRazorpay, getRazorpaySecretKey }  = require('../utils/razorpayvalut');


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
// const razorpay = new Razorpay({
//   key_id: process.env.RAZORPAY_KEY_ID,
//   key_secret: process.env.RAZORPAY_KEY_SECRET,
// });
router.post('/create-order', async (req, res) => {
  const razorpay = await getRazorpay();

  const { plan, purchaser, months } = req.body;
  const rp_plan_id = plan?.razorpay_plan_id;
  const customer_id = purchaser?.userid;
  const total_count = months;
  const Remaining_count = months;
  try {
    if (!rp_plan_id || !customer_id) {
      return res.status(400).json({
        success: false,
        message: 'Missing required fields: plan_id, customer_id, selected features'
      });
    }

    const [planResult] = await db.promise().query(
      `SELECT *, (plan_amount + (gst_percent * plan_amount / 100)) AS taxed_amount 
             FROM subscription_plans WHERE razorpay_plan_id = ?`,
      [rp_plan_id]
    );

    if (!planResult.length) {
      return res.status(404).json({ success: false, message: 'Plan not found' });
    }

    let plan_details = planResult[0];
    let taxed_amount = parseInt(plan_details.taxed_amount) ; 
    let plan_id = plan_details.id;
    // Create Razorpay Order
    const order = await razorpay.orders.create({
      amount: taxed_amount,
      currency: "INR",
      receipt: `order_rcptid_${customer_id}`,
      payment_capture: 1
    });

    // Insert order into database
    await db.promise().query(
      `INSERT INTO subscriptions (razorpay_sub_id,sub_plan_id, user_id,total_count,paid_count,remaining_count, taxed_amount_in_paise, features, status) VALUES (?, ?, ?, ?, ? , ?, ?, ?, ?)`,
      [order.id, plan_id, customer_id, total_count, 0, Remaining_count, taxed_amount, JSON.stringify([1, 2, 3, 4]), "created"]
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
  const { plan, purchaser, months } = req.body;
  const rp_plan_id = plan?.razorpay_plan_id;
  const customer_id = purchaser?.userid;
  const razorpay = await getRazorpay();

  try {
    if (!rp_plan_id || !customer_id ) {
      return res.status(400).json({
        success: false,
        message: 'Missing required fields: plan_id, customer_id, selected features'
      });
    }

    // Fetch plan details
    const [planResult] = await db.promise().query(
      `SELECT *, (plan_amount + (gst_percent * plan_amount / 100)) AS taxed_amount 
             FROM subscription_plans WHERE razorpay_plan_id = ?`,
      [rp_plan_id]
    );

    if (!planResult.length) {
      return res.status(404).json({ success: false, message: 'Plan not found' });
    }

    let plan_details = planResult[0];
    let all_features_taxed_amount = parseInt(plan_details.taxed_amount);

    let subscription = {};

    // Check if an active subscription already exists
    const [existingSubscription] = await db.promise().query(
      `SELECT * FROM subscriptions WHERE status = ? AND sub_plan_id = ? AND total_count = ? AND user_id = ?`,
      ["created", plan_details.id, months, customer_id]
    );

    if (existingSubscription?.length) {
      subscription = existingSubscription[0];
      return res.status(200).json({
        success: true,
        subscription: { id: subscription.razorpay_sub_id, plan_id: plan_details.id }
      });
    } else {
      // Create new subscription in Razorpay
      const subscriptionData = {
        plan_id: rp_plan_id,
        customer_notify: 1,
        total_count: months,
      };

      subscription = await razorpay.subscriptions.create(subscriptionData);

      // Insert subscription into the database
      const insert_sub_query = `INSERT INTO subscriptions 
            (razorpay_sub_id, short_url, sub_plan_id, taxed_amount_in_paise, quantity, features, status, user_id, 
            total_count, paid_count, remaining_count)
            VALUES (?,?,?,?,?,?,?,?,?,?,?)`;

      const sub_values = [
        subscription.id,
        subscription.short_url || "",
        plan_details.id,
        all_features_taxed_amount,
        1, 
        JSON.stringify([1, 2, 3, 4]),
        subscription.status,
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
    }
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
 
  const { razorpay_subscription_id, razorpay_order_id, razorpay_payment_id, razorpay_signature, userid, plan_id, isSubscription } = req.body;
  if (!razorpay_payment_id || !(razorpay_subscription_id || razorpay_order_id) || !razorpay_signature) {
    return res.status(400).json({ status: 'failure', error: 'Missing required fields' });
  }

  try {
    const keySecret = await getRazorpaySecretKey();
    const hmac = crypto.createHmac('sha256', keySecret);
    const pair = isSubscription ? `${razorpay_payment_id}|${razorpay_subscription_id}` : `${razorpay_order_id}|${razorpay_payment_id}`
    hmac.update(pair);
    const generatedSignature = hmac.digest('hex');

    if (generatedSignature !== razorpay_signature) {
      return res.status(400).json({ status: 'failure', error: 'Invalid signature' });
    }
    
    const sub_start = Math.floor(Date.now() / 1000); // Convert milliseconds to seconds
    const sub_end = addIntervalToEpoch(sub_start,'1 year');
    const current_cycle_end = addIntervalToEpoch(sub_start, '1 month');


     const razorpay_id = isSubscription ? razorpay_subscription_id : razorpay_order_id;
    const [subResults] = await db.promise().query(`SELECT * FROM subscriptions WHERE razorpay_sub_id = ?`,
          [razorpay_id ]);
    if (!subResults || subResults.length === 0) {
      return res.status(404).json({ status: 'failure', error: 'Subscription not found', subResults });
    }

    const subResult = subResults[0];
    const status = isSubscription ? 'active' : 'completed';

    await db.promise().query(`START TRANSACTION;`)
    // Update the subscription
    await db.promise().query(
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


    // Update the user
    await db.promise().query(
      `UPDATE chatsignup SET plan_id = ?, sub_id = ?  WHERE id = ?`,
      [plan_id, subResult.id, userid]
    );
    
    await db.promise().query(`COMMIT;`)

    // Retrieve the user and their subscription data
    const [usrResults] = await db.promise().query(
      `SELECT usr.*, sub.status, sub.sub_end, sub.id AS sub_id, sub.short_url, usr.plan_id, 
              sub.features, sub.razorpay_sub_id AS rp_sub_id
       FROM chatsignup usr
       LEFT JOIN subscriptions sub ON usr.sub_id = sub.id
       WHERE usr.id = ?`,
      [userid]
    );

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
    };

    const token = jwt.sign(payload, process.env.JWT_SECRET_KEY, { expiresIn: '1h' });
    res.status(200).json({ status: 'success', token });
  } catch (error) {
    await db.promise().query(`ROLLBACK;`)
    console.error('Error verifying subscription:', error);
    res.status(500).json({ error: 'Failed to verify subscription' });
  }
});



router.post("/cancel-subscription", async (req, res) => {
  const razorpay = await getRazorpay();
  const { sub_id, user_id, razorpay_sub_id, status } = req.body;

  if (!sub_id || !user_id || !razorpay_sub_id) {
    return res.status(400).json({ error: "Missing Parameters" });
  }

  const updateChatsignup = async () => {
    try {
      const [usrResults] = await db.promise().query(
        `SELECT usr.*, sub.status, sub.sub_end, sub.id AS sub_id, sub.short_url, usr.plan_id, 
                sub.features, sub.razorpay_sub_id AS rp_sub_id
         FROM chatsignup usr
         LEFT JOIN subscriptions sub ON usr.sub_id = sub.id
         WHERE usr.id = ?`,
        [user_id]
      );

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
      };

      const token = jwt.sign(payload, process.env.JWT_SECRET_KEY, { expiresIn: '1h' });
      res.status(200).json({ message: "success", token: token });

    } catch (err) {
      res.status(500).json({ message: "failure", error: err.message });
    }
  };

  if (status !== "completed") {
    try {
      // Cancel Razorpay subscription
      const subscription = await razorpay.subscriptions.cancel(razorpay_sub_id, false);
      console.log("Razorpay cancel response:", subscription);

      // Fetch updated subscription details
      const updatedSub = await razorpay.subscriptions.fetch(razorpay_sub_id);
      console.log("Updated subscription status:", updatedSub.status);

      // Update local subscriptions table
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

      // Proceed to update user info
      await updateChatsignup();

    } catch (error) {
      res.status(500).json({ message: "failure", error: error.message });
    }

  } else {
    // If already completed, just update user info
    await updateChatsignup();
  }
});

router.post("/juristbot-webhook-subscription-charge", async (req, res) => {

  let payload = req.body.payload;
  let subscription = payload["subscription"] || payload["order"];
  subscription = subscription["entity"];
  await db.promise().query(`START TRANSACTION;`);

  db.promise().query(`SELECT * FROM subscriptions WHERE razorpay_sub_id = ?`, [subscription.id])
    .then(async (Sub_dbRes) => {
      if (Sub_dbRes[0].length) {
        Sub_dbRes = Sub_dbRes[0][0];
        let payment = null;
        if (req.body["contains"]?.includes("payment")) {
          payment = payload["payment"]["entity"];
        }

        if (subscription.id.includes("order")) {
          subscription["status"] = "completed";
          subscription["total_count"] = 1;
          subscription["paid_count"] = 1;
          subscription["remaining_count"] = 0;
        }

        subscription["current_start"] = subscription.current_start || Math.floor(Date.now() / 1000);
        subscription["current_end"] = addIntervalToEpoch(subscription["current_start"], '1 month');

        await db.promise().query(`UPDATE subscriptions SET
          status = ?, total_count = ?, paid_count = ?, remaining_count = ?,
          current_start = FROM_UNIXTIME(?), current_end = FROM_UNIXTIME(?)
          WHERE razorpay_sub_id = ?`, [
          subscription.status,
          subscription.total_count,
          subscription.paid_count,
          subscription.remaining_count,
          subscription.current_start,
          subscription.current_end,
          subscription.id
        ]);

        if ((req.body["event"] === "subscription.charged" || req.body["event"] === "order.paid" || req.body["event"] === "subscription.cancelled") && payment) {

          const now = new Date();
          let startYearFull, endYearFull;
          if (now.getMonth() + 1 >= 4) {
            startYearFull = now.getFullYear();
            endYearFull = now.getFullYear() + 1;
          } else {
            startYearFull = now.getFullYear() - 1;
            endYearFull = now.getFullYear();    
          }

          const [txCountRes] = await db.promise().query(
            `SELECT COUNT(*) AS total_rows 
             FROM transactions 
             WHERE created_at BETWEEN ? AND ?`,
            [`${startYearFull}-04-01 00:00:00`, `${endYearFull}-03-31 23:59:59`]
          );

          const invoiceRowNo = txCountRes[0].total_rows + 1;
          const shortStart = String(startYearFull).slice(2);
          const shortEnd = String(endYearFull).slice(2);
          const invoiceNoFormatted = `#NNJB/${String(invoiceRowNo).padStart(3, '0')}/${shortStart}-${shortEnd}`;

          await db.promise().query(`INSERT INTO transactions 
            (amount_in_paise, razorpay_pay_id, sub_id, order_id, invoice_id, payment_method, status, created_at, invoice_number)
            VALUES (?, ?, ?, ?, ?, ?, ?, NOW(), ?)`,
            [
              payment["amount"],
              payment["id"],
              Sub_dbRes["id"],
              payment["order_id"],
              payment["invoice_id"] || "order has no invoice",
              payment["method"],
              payment["status"],
              invoiceNoFormatted
            ]);

          const [paymentDBResArr] = await db.promise().query(
            `SELECT * FROM transactions WHERE razorpay_pay_id = ?`,
            [payment["id"]]
          );

          if (paymentDBResArr.length) {
            const paymentDBRes = paymentDBResArr[0];

            let [userResults = []] = await db.promise().query(`SELECT * FROM chatsignup WHERE id = ?`, [Sub_dbRes["user_id"]]);
            const buyerDetails = userResults[0];

            let [planResults = []] = await db.promise().query(`SELECT * FROM subscription_plans WHERE id = ?`, [Sub_dbRes.sub_plan_id]);
            planResults = planResults[0];

            const planAmount = planResults.plan_amount / 100;

            let billPeriod = "1 month";
            let description = "JuristBot monthly Subscription";

            if (subscription.id.includes("order")) {
              billPeriod = "1 year";
              description = "JuristBot yearly Subscription";
            }

            const invoiceDetails = {
              invoiceNo: invoiceRowNo,
              invoiceDate: new Date().toDateString(),
              orderNo: payment["order_id"],
              payRef: payment["method"] + " " + payment["id"],
              billPeriod: billPeriod
            };

            const lineItems = [
              [description, "998314", billPeriod, planAmount, planAmount]
            ];

            const invObject = {
              buyerDetails,
              invoiceDetails,
              lineItems,
              taxPercent: planResults.gst_percent
            };

            sendInvoice(invObject);
            await sendEmailtemplate(buyerDetails);
            await sendEmailupdate(buyerDetails);
            await db.promise().query(`COMMIT;`);

            return res.status(200).send({
              status: "success subscription and payment",
              invoice_number: invoiceNoFormatted,
              subscription,
              payment: paymentDBRes
            });
          }
        } else {
          await db.promise().query(`COMMIT;`);
          return res.status(200).send({ status: "success subscription only", subscription });
        }
      } else {
        await db.promise().query(`ROLLBACK;`);
        return res.status(200).json({
          status: 'success',
          message: "webhook received but subscription not in juristbot system"
        });
      }
    });
});


module.exports = router;
