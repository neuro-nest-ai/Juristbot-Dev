const { getPool } = require('../database/db');
const db = getPool();
const bcrypt = require('bcrypt');
require('dotenv').config();
const axios = require('axios');
const jwt = require('jsonwebtoken')
const { S3Client, GetObjectCommand, PutObjectCommand,HeadObjectCommand } = require('@aws-sdk/client-s3');
const { getAwsSecrets } = require('../utils/razorpayvalut');
const crypto = require('crypto');
const { sendEmail } = require("../middleware/sentmail");
const sendWhatsAppTemplatereg = require('../watemplate/regtemplate');
const sendWhatsAppTemplatotp = require("../watemplate/otpverify");


function generateOtp() {
  const otp = crypto.randomInt(100000, 1000000);
  return otp.toString();
}

async function sendOtpSms(mobile_no, otp, username) {
  const smsUrl = `http://app.mydreamstechnology.in/vb/apikey.php?apikey=COjI30bE6jtsHh6W&senderid=JURBOT&number=${mobile_no}&message=Dear ${username}, Welcome to JuristBot. Enter OTP ${otp} to register and start your legal journey with us. Please Don't Share With Anyone. OTP valid only for 30min.`;
  try {
    const response = await axios.get(smsUrl);
    console.log('SMS sent:', response.data);
  } catch (error) {
    console.error('Error sending SMS:', error);
  }
}

exports.signup = async (req, res) => {
  const { username, email, mobile_no, pass_word, role, state, town, source ,referral_code } = req.body;

  try {
    const emailCheckSql = 'SELECT * FROM chatsignup WHERE email = ?';
    db.query(emailCheckSql, [email], async (err, emailResults) => {
      if (err) return res.status(500).json({ error: true, message: 'Database query failed' });

      if (emailResults.length > 0) {
        return res.status(400).json({ error: true, message: 'Email already exists. Please use another email.' });
      }

      const mobileCheckSql = 'SELECT * FROM chatsignup WHERE mobile_no = ?';
      db.query(mobileCheckSql, [mobile_no], async (err, mobileResults) => {
        if (err) return res.status(500).json({ error: true, message: 'Database query failed' });

        if (mobileResults.length > 0) {
          return res.status(400).json({ error: true, message: 'Mobile number already exists. Please use another number.' });
        }

        const hashedPassword = await bcrypt.hash(pass_word, 10);
        const otp = generateOtp();

        const insertSql = `
          INSERT INTO chatsignup 
          (username, email, mobile_no, pass_word, otp, state, source, plan_id ,referral_code ,free_credits , free_tier)
          VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)
        `;

        db.query(insertSql, [username, email, mobile_no, hashedPassword, otp, state, source, null,referral_code,20, 1], async (err, result) => {
          if (err) return res.status(500).json({ error: true, message: 'Database insert failed' });

          try {
            await sendEmail(email, {
              template: "otp_template",
              otp: otp,
              username: username,
            });

            await sendOtpSms(mobile_no, otp, username);
            await sendWhatsAppTemplatereg({
              username: username,
              mobile_no: mobile_no
            });
            return res.json({ message: 'User created successfully. OTP sent to email and mobile.' });
          } catch (notifyErr) {
            console.error('OTP notification failed:', notifyErr);
            return res.status(500).json({ error: true, message: 'User created, but OTP notification failed' });
          }
        });
      });
    });
  } catch (error) {
    console.error('Error during signup:', error);
    return res.status(500).json({ error: true, message: 'Internal server error' });
  }
};



exports.login = (req, res) => {
  const { email, pass_word } = req.body;
  const query = `SELECT usr.*,sub.status,sub.sub_end ,sub.id AS sub_id,
                  sub.short_url,usr.plan_id,sub.features,
                  sub.razorpay_sub_id AS rp_sub_id
                  FROM chatsignup usr
                  LEFT JOIN subscriptions sub ON usr.sub_id = sub.id
                  WHERE usr.email = ?`;

  db.query(query, [email], async (err, results) => {
    if (err) {
      console.error('Error executing MySQL query: ' + err.stack);
      return res.status(500).json({ message: 'Internal server error' });
    }
    if (results.length === 0) {
      return res.status(404).json({ message: 'User not found or invalid email' });
    }

    const user = results[0];

    try {
      // 1. Password munnadi check pannu
      const match = await bcrypt.compare(pass_word, user.pass_word);
      if (!match) {
        return res.status(401).json({ message: 'Please enter the correct password' });
      }

      // 2. OTP verify aagala na -> pudhu OTP generate + send
      if (user.verify_otp === 0) {
        const otp = generateOtp();
        const updateOtpSql = 'UPDATE chatsignup SET otp = ? WHERE id = ?';

        db.query(updateOtpSql, [otp, user.id], async (updErr) => {
          if (updErr) {
            console.error('OTP update error:', updErr);
            return res.status(500).json({ message: 'Failed to generate OTP' });
          }
          try {
            await sendEmail(user.email, {
              template: "otp_template",
              otp: otp,
              username: user.username,
            });
            await sendOtpSms(user.mobile_no, otp, user.username);
          } catch (notifyErr) {
            console.error('OTP resend failed:', notifyErr);
          }
          // frontend indha exact message-a check pannuthu, so maathaadha
          return res.status(403).json({ message: 'OTP is not verified. Please sign up again.' });
        });
        return; // mukkiyam: inga stop pannu
      }

      // 3. Ellam OK na -> active update + token
      const updateQuery = 'UPDATE chatsignup SET active = 1 WHERE id = ?';
      db.query(updateQuery, [user.id], (updateErr) => {
        if (updateErr) {
          console.error('Error updating user active status:', updateErr);
          return res.status(500).json({ message: 'Error updating user status' });
        }
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
          trial: Number(user.trial) === 1 ? 1 : 0,
          activeplan: user.activeplan,
          oldchat: user.oldchat,
           free_tier: user.free_tier
        };
        const token = jwt.sign(payload, process.env.JWT_SECRET_KEY, { expiresIn: '7h' });
        res.status(200).json(token);
      });
    } catch (error) {
      console.error('Login error:', error);
      res.status(500).json({ message: 'Internal server error' });
    }
  });
};




exports.verifyOtp = (req, res) => {
  const { otp } = req.body;

  if (!otp) {
    return res.status(400).json({ error: 'OTP is required' });
  }

  // same JOIN as login so payload has sub details
  const query = `SELECT usr.*, sub.status, sub.sub_end, sub.id AS sub_id,
                        sub.short_url, sub.features,
                        sub.razorpay_sub_id AS rp_sub_id
                 FROM chatsignup usr
                 LEFT JOIN subscriptions sub ON usr.sub_id = sub.id
                 WHERE usr.otp = ? AND usr.verify_otp = 0`;

  db.query(query, [otp], (err, results) => {
    if (err) {
      console.error('Database query error:', err);
      return res.status(500).json({ error: 'Database query error' });
    }
    if (results.length === 0) {
      return res.status(400).json({ error: 'Invalid or already verified OTP' });
    }

    const user = results[0];

    // verify pannradhoda active=1 um set pannu
    const updateQuery = 'UPDATE chatsignup SET verify_otp = 1, active = 1 WHERE id = ?';
    db.query(updateQuery, [user.id], (updErr) => {
      if (updErr) {
        console.error('Database update error:', updErr);
        return res.status(500).json({ error: 'Database update error' });
      }

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
        trial: Number(user.trial) === 1 ? 1 : 0,
        activeplan: user.activeplan,
        oldchat: user.oldchat,
        free_tier: user.free_tier
      };

      const token = jwt.sign(payload, process.env.JWT_SECRET_KEY, { expiresIn: '7h' });

      return res.status(200).json({
        message: 'OTP verified successfully',
        token
      });
    });
  });
};


exports.logout = (req, res) => {
  const { id } = req.body;
  if (!id) {
    return res.status(400).json({ message: 'User ID is required' });
  }
  const query = 'UPDATE chatsignup SET active = 0 WHERE id = ?';
  db.query(query, [id], (err, result) => {
    if (err) {
      console.error('Error updating user logout status:', err);
      return res.status(500).json({ message: 'Internal server error' });
    }
    if (result.affectedRows === 0) {
      return res.status(404).json({ message: 'User not found or already logged out' });
    }
    res.status(200).json({ message: 'User successfully logged out' });
  });
};




exports.reportUser = (req, res) => {
  const { user_id, username, report_details } = req.body;

  const sql = 'INSERT INTO user_report (user_id, username, report_details) VALUES (?, ?, ?)';

  db.query(sql, [user_id, username, report_details], (err, result) => {
    if (err) {
      console.error('Database Query Error:', err);
      return res.status(500).send({ error: true, message: 'Database query failed' });
    }
    res.send({ error: false, message: 'Report sent successfully.' });
  });
};





exports.sendotpsmail = (req, res) => {
  const { email } = req.body;

  db.query('SELECT * FROM chatsignup WHERE email = ?', [email], (err, result) => {
    if (err) {
      console.error('Database query error:', err);
      return res.status(500).json({ error: true, message: 'Database query failed' });
    }

    if (result.length === 0) {
      return res.status(400).json({ error: true, message: 'Email not found. Please enter a correct email.' });
    }

    const otp = generateOtp();

    db.query('UPDATE chatsignup SET otp = ? WHERE email = ?', [otp, email], async (err) => {
      if (err) {
        console.error('Database update error:', err);
        return res.status(500).json({ error: true, message: 'Failed to update OTP' });
      }

      try {
        await sendEmail(email, {
          template: "forget_otp_template",
          otp: otp,
          username: result[0].username || "User"
        });

        return res.json({ error: false, message: 'OTP sent to email.' });
      } catch (emailErr) {
        console.error('Failed to send OTP email:', emailErr);
        return res.status(500).json({ error: true, message: 'OTP updated but failed to send email.' });
      }
    });
  });
};


async function sendOtpSmsforget(mobile_no, otp) {
  const smsUrl = `http://app.mydreamstechnology.in/vb/apikey.php?apikey=COjI30bE6jtsHh6W&senderid=JURBOT&number=${mobile_no}&message=Dear User, Password Reset: Use Code ${otp} to verify your identity and reset your password. Please Dont Share With Anyone. Team JuristBot`;
  try {
    const response = await axios.get(smsUrl);
    console.log('SMS sent:', response.data);
  } catch (error) {
    console.error('Error sending SMS:', error);
  }
}

exports.sendotpforgetpass = (req, res) => {
  const { mobile_no } = req.body;
  console.log('Received mobile number for OTP:', mobile_no);
  db.query('SELECT * FROM chatsignup WHERE mobile_no = ?', [mobile_no], (err, result) => {
    if (err) {
      console.error('Database query error:', err);
      return res.status(500).json({ error: true, message: 'Database query failed' });
    }
    if (result.length === 0) {
      return res.status(400).json({ error: true, message: 'Mobile  not found  please correct Mobile No' });
    }
    const otp = generateOtp();
    db.query('UPDATE chatsignup SET otp = ? WHERE mobile_no = ?', [otp, mobile_no], (err) => {
      if (err) {
        console.error('Database update error:', err);
        return res.status(500).json({ error: true, message: 'Failed to update OTP' });
      }
      sendOtpSmsforget(mobile_no, otp);
      return res.json({ error: false, message: 'OTP sent to mobile.' });
    });
  });
};




exports.verifypassword = (req, res) => {
  const { otp, password } = req.body;
  console.log('Received OTP and password for verification:', otp, password);
  if (!otp || !password) {
    return res.status(400).json({ error: true, message: 'OTP and password are required.' });
  }
  db.query('SELECT * FROM chatsignup WHERE otp = ?', [otp], (error, results) => {
    if (error) {
      console.error('Database query failed:', error);
      return res.status(500).json({ error: true, message: 'Database query failed during OTP check' });
    }
    if (results.length === 0) {
      return res.status(400).json({ error: true, message: 'Invalid OTP.' });
    }
    bcrypt.hash(password, 10, (err, hashedPassword) => {
      if (err) {
        console.error('Error hashing the password:', err);
        return res.status(500).json({ error: true, message: 'Failed to hash the password' });
      }
      db.query('UPDATE chatsignup SET pass_word = ? WHERE otp = ?', [hashedPassword, otp], (updateError) => {
        if (updateError) {
          console.error('Failed to update the password:', updateError);
          return res.status(500).json({ error: true, message: 'Failed to update the password' });
        }
        return res.json({ error: false, message: 'Password updated successfully.' });
      });

    });
  });
};

exports.getPaymentHistory = (req, res) => {
  const { userid } = req.params;

  if (!userid) {
    return res.status(400).json({ error: "User ID is required" });
  }

  const query = `
    SELECT 
        s.user_id,
        s.plan_Name AS plan_name,
        DATE_FORMAT(t.created_at, '%Y-%m-%d %H:%i:%s') AS created_at,
        IFNULL(t.status, 'N/A') AS status,
        IFNULL(s.features, 'N/A') AS features,
        IFNULL(t.amount_in_paise, 0) AS amount_in_paise,
        IFNULL(t.razorpay_pay_id, 'N/A') AS razorpay_pay_id,
        IFNULL(t.invoice_number, 'No Invoice') AS invoice_number
    FROM transactions t
    INNER JOIN subscriptions s ON t.sub_id = s.id
    WHERE s.user_id = ?
    ORDER BY t.created_at DESC
  `;

  db.query(query, [userid], (err, results) => {
    if (err) {
      console.error("Database query error:", err);
      return res.status(500).json({ error: "Failed to retrieve payment history" });
    }
    return res.status(200).json(results);
  });
};
const invoiceKey = (invoiceNumber) =>
  `invoicepdf/${String(invoiceNumber).trim().replace(/^#/, '').replace(/\//g, '_')}.pdf`;

// "#NNJB/016/25-26" -> "invoicepdf/NNJB_016_25-26.pdf"
exports.getInvoicePdf = async (req, res) => {
  const { userid } = req.params;
  const { invoice_number, download } = req.query;

  if (!userid || !invoice_number) {
    return res.status(400).json({ message: 'userid and invoice_number are required' });
  }
  if (!s3Client || !awsSecrets) {
    return res.status(503).json({ message: 'Storage not ready, try again shortly' });
  }

  try {
    // Indha invoice indha user-oda dhaana-nu check pannu
    const [rows] = await db.promise().query(
      `SELECT t.invoice_number
         FROM transactions t
         INNER JOIN subscriptions s ON t.sub_id = s.id
        WHERE s.user_id = ? AND t.invoice_number = ?
        LIMIT 1`,
      [userid, invoice_number]
    );

    if (!rows.length) {
      return res.status(404).json({ message: 'Invoice not found' });
    }

    const Key = invoiceKey(rows[0].invoice_number);
    const fileName = Key.split('/').pop();

    let obj;
    try {
      obj = await s3Client.send(new GetObjectCommand({ Bucket: awsSecrets.bucket, Key }));
    } catch (e) {
      if (e.name === 'NoSuchKey' || e.$metadata?.httpStatusCode === 404) {
        return res.status(404).json({ message: 'Invoice PDF not available yet' });
      }
      throw e;
    }

    // S3 URL veliya pogaadhu — PDF-a nammale stream pannrom
    res.setHeader('Content-Type', 'application/pdf');
    res.setHeader(
      'Content-Disposition',
      `${download === '1' ? 'attachment' : 'inline'}; filename="${fileName}"`
    );
    res.setHeader('Cache-Control', 'private, no-store');
    if (obj.ContentLength) res.setHeader('Content-Length', obj.ContentLength);

    obj.Body.on('error', (streamErr) => {
      console.error('Invoice stream error:', streamErr);
      if (!res.headersSent) res.status(500).end();
      else res.destroy(streamErr);
    });
    obj.Body.pipe(res);
  } catch (err) {
    console.error('getInvoicePdf error:', err);
    if (!res.headersSent) {
      return res.status(500).json({ message: 'Failed to get invoice' });
    }
  }
};


let awsSecrets;
let s3Client;

(async () => {
  try {
    awsSecrets = await getAwsSecrets();

    s3Client = new S3Client({
      region: awsSecrets.region,
      credentials: {
        accessKeyId: awsSecrets.accessKeyId,
        secretAccessKey: awsSecrets.secretAccessKey,
      },
    });

    console.log('✅ AWS S3 Client (v3) initialized');
  } catch (error) {
    console.error('❌ Error initializing AWS S3:', error);
  }
})();

// ✅ Check if a file exists in S3
const checkS3File = async (filePath) => {
  if (!filePath) return null;

  const params = {
    Bucket: awsSecrets.bucket,
    Key: filePath.trim(),
  };

  try {
    await s3Client.send(new GetObjectCommand(params));
    return `https://${awsSecrets.bucket}.s3.${awsSecrets.region}.amazonaws.com/${filePath}`;
  } catch (error) {
    console.error(`S3 Check Error: ${error.name} - ${error.message}`);
    return null;
  }
};

exports.getProfile = async (req, res) => {
  try {
    const { userid } = req.query;
    let query = `SELECT id, username, mobile_no,about,templatepath,years_active,year_ex,success_rate,happy_clients,cases_won,jurisdiction, email, state, law_specialists, town, gst_number, bar_code, role, address, profile_img, company_name ,verified_whatsapp FROM chatsignup`;
    let values = [];

    if (userid) {
      query += ` WHERE id = ?`;
      values.push(userid);
    }

    const [rows] = await db.promise().query(query, values);

    if (rows.length === 0) {
      return res.status(404).json({ message: "No profiles found" });
    }

    for (const profile of rows) {
      if (profile.profile_img) {
        profile.profile_img = await checkS3File(profile.profile_img);
      }
    }

    res.status(200).json(rows);
  } catch (error) {
    console.error("Database Query Error:", error);
    res.status(500).json({ error: "Internal Server Error" });
  }
};

exports.updateProfile = async (req, res) => {
  try {
    const { id, username,mobile_no, gst_number, bar_code, law_category, law_specialists, address, company_name, profile_img } = req.body;
    let newProfileImgUrl = profile_img;

    // If profile_img is a full URL, extract only the S3 key
    if (profile_img && profile_img.includes("https://")) {
      const urlParts = profile_img.split("/");
      const index = urlParts.findIndex(part => part === "profile_images");
      newProfileImgUrl = urlParts.slice(index).join("/");
    }

    // If a new file is uploaded, upload to S3
    if (req.file) {
      const fileContent = req.file.buffer;
      const fileKey = `profile_images/${Date.now()}_${req.file.originalname}`;
      const params = {
        Bucket: awsSecrets.bucket,
        Key: fileKey,
        Body: fileContent,
        ContentType: req.file.mimetype,
      };

      await s3Client.send(new PutObjectCommand(params));
      newProfileImgUrl = fileKey;
    }

    // If no image, use existing from DB
    if (!newProfileImgUrl) {
      const [rows] = await db.promise().query(
        `SELECT profile_img FROM chatsignup WHERE id = ?`,
        [id]
      );
      newProfileImgUrl = rows[0]?.profile_img || "";
    }

    const query = `
      UPDATE chatsignup
      SET username = ?, mobile_no = ?, gst_number = ?, bar_code = ?, law_category = ?, law_specialists = ?, address = ?, profile_img = ?, company_name = ?
      WHERE id = ?`;

    const values = [username,mobile_no, gst_number, bar_code, law_category, law_specialists, address, newProfileImgUrl, company_name, id];

    const [result] = await db.promise().query(query, values);

    if (result.affectedRows === 0) {
      return res.status(404).json({ message: "User not found or no changes made" });
    }

    return res.status(200).json({
      message: "Profile updated successfully",
      profile_img: newProfileImgUrl
    });

  } catch (error) {
    console.error("Database Query Error:", error);
    return res.status(500).json({ error: "Internal Server Error" });
  }
};

exports.calsprofile = (req, res) => {
  db.query(
    `SELECT  username, town, bar_code, law_category, law_specialists, role, profile_img FROM chatsignup WHERE cals = 1`,
    null,
    (err, result) => {
      if (err) {
        console.error("Database error:", err);
        return res.status(500).send("Internal Server Error");
      }

      const updatedResult = result.map((profile) => ({
        ...profile,
        profile_img: profile.profile_img
          ? `https://${awsSecrets.bucket}.s3.${awsSecrets.region}.amazonaws.com/${profile.profile_img}`
          : null,
      }));

      res.status(200).send(updatedResult);
    }
  );
};



  exports.activeplan = async (req, res) => {
  const user_id = req.params.user_id;
  try {
    const [userRes] = await db.promise().query(
      `SELECT * FROM chatsignup WHERE id = ?`,
      [user_id]
    );

    if (!userRes.length) {
      return res.status(404).json({ status: "not_found", message: "User not found" });
    }

    const { sub_id, plan_id, paid_user,activeplan ,membership} = userRes[0];
    const [walletRes] = await db.promise().query(
  `SELECT wallet_amount FROM wallet WHERE user_id = ?`,
  [user_id]
    );

  const walletAmount = walletRes.length ? parseFloat(walletRes[0].wallet_amount) : 0;

 const [courseRes] = await db.promise().query(
      `SELECT is_active FROM user_courses WHERE user_id = ? LIMIT 1`,
      [user_id]
    );
  const is_course_active = courseRes.length ? Number(courseRes[0].is_active) : 0;

  if (!sub_id) {
  return res.status(200).json({
     status: "active",
    message: "No active subscription",
    user_active: {
      sub_id: null,
      plan_id,
      paid_user,
      activeplan,
      is_course_active,
      membership,
      free_tier: userRes[0].free_tier
    },
    plan: {
      planName: null,
      walletBalance: walletAmount,
      credits: {
        credits: 0,       
      },
      sub_Details: null
    }
  });
}


  const [subRes] = await db.promise().query(
    `SELECT id, razorpay_sub_id, status, user_id, plan_Name,
            sub_start, sub_end, current_start, current_end, created_at
    FROM subscriptions WHERE id = ?`,
    [sub_id]
  );


    if (!subRes.length) {
      return res.status(404).json({ status: "not_found", message: "Subscription not found" });
    }

    const subscription = subRes[0];
    const planType = subscription.plan_Name?.toLowerCase();
    const billingCycle = subscription.razorpay_sub_id.includes("order") ? "yearly" : "monthly";


    // Step 4: Get Credits info
    const [creditRes] = await db.promise().query(
      `SELECT * FROM Credits WHERE user_id = ? AND sub_id = ? ORDER BY created_date DESC LIMIT 1`,
      [user_id, sub_id]
    );

      const creditDetails = creditRes.length ? creditRes[0] : {
        credits: 0,
      };


    // ✅ Final response with full details
    return res.json({
      status: "active",
      user_active: {
        sub_id,
        plan_id,
        paid_user,
        activeplan,
        is_course_active,
        membership,
        free_tier: userRes[0].free_tier
      },
      plan: {
        planName: planType,
        billingCycle,
        walletBalance: walletAmount,
        credits: creditDetails,
        sub_Details: subscription 
      }
    });

  } catch (err) {
    console.error("❌ Error in /active-plan:", err);
    res.status(500).json({ status: "error", message: "Internal Server Error" });
  }
};


exports.sourceupdate = async (req, res) => {
  const user_id = req.params.user_id;
  const { source, ref_code } = req.body;

  try {
    if (!user_id || !source) {
      return res.status(400).json({ 
        success: false, 
        message: 'user_id and source are required' 
      });
    }

    const query = 'UPDATE chatsignup SET source = ?, referral_code = ? WHERE id = ?';
    
    // ✅ CORRECT: Use db.promise().query() for promise-based async/await
    const [result] = await db.promise().query(query, [source, ref_code, user_id]);

    if (result.affectedRows === 0) {
      return res.status(404).json({ 
        success: false, 
        message: 'User not found' 
      });
    }

    res.status(200).json({ 
      success: true, 
      message: 'Source and referral code updated successfully',
      data: {
        source,
        referral_code: ref_code
      }
    });
  } catch (error) {
    console.error('Error updating source:', error);
    res.status(500).json({ 
      success: false, 
      message: 'Server error', 
      error: error.message 
    });
  }
};

exports.verifywhatsapp = async (req, res) => {
  const { userid, whatsapp_number } = req.body;
  console.log('Received verifywhatsapp request:', { userid, whatsapp_number });

  if (!userid || !whatsapp_number) {
    return res.status(400).json({ error: 'userid and whatsapp_number are required' });
  }

  const otp = generateOtp();
  const mobile_no = whatsapp_number;

  try {
    // Check user exists
    const [results] = await db.promise().query(
      `SELECT * FROM chatsignup WHERE id = ?`, 
      [userid]
    );

    if (!results.length) {
      return res.status(404).json({ error: 'User not found' });
    }

    // Insert OTP into database
    await db.promise().query(
      `UPDATE chatsignup 
       SET otp = ?, updated_at = CURRENT_TIMESTAMP 
       WHERE id = ?`,
      [otp,  userid]
    );

    // Send OTP via WhatsApp
    await sendWhatsAppTemplatotp({ mobile_no, otp });

    return res.status(200).json({ 
      success: true, 
      message: 'OTP sent successfully to WhatsApp' 
    });

  } catch (err) {
    console.error('verifywhatsapp error:', err);
    return res.status(500).json({ error: 'Failed to send OTP' });
  }
};

exports.confirmOtp = async (req, res) => {
  const { userid, whatsapp_number, otp } = req.body;
  console.log('Received confirmOtp request:', { userid, whatsapp_number, otp });

  if (!userid || !whatsapp_number || !otp) {
    return res.status(400).json({ error: 'userid, whatsapp_number and otp are required' });
  }

  try {
    const [results] = await db.promise().query(
      `SELECT otp FROM chatsignup WHERE id = ?`,
      [userid]
    );

    if (!results.length) {
      return res.status(404).json({ error: 'User not found' });
    }

    if (String(results[0].otp) !== String(otp)) {
      return res.status(400).json({ error: 'Invalid OTP' });
    }

    // OTP matched — update verified_whatsapp = 1 and store number
    await db.promise().query(
      `UPDATE chatsignup 
       SET verified_whatsapp = 1, whatsapp_no = ?, otp = NULL, updated_at = CURRENT_TIMESTAMP 
       WHERE id = ?`,
      [whatsapp_number, userid]
    );

    return res.status(200).json({ success: true, message: 'WhatsApp verified successfully' });

  } catch (err) {
    console.error('confirmOtp error:', err);
    return res.status(500).json({ error: 'Failed to verify OTP' });
  }
};

exports.listingupdateprofile = async (req, res) => {
  try {
    const { id, username,mobile_no, gst_number, bar_code,  law_specialists, address, profile_img,about,templatepath,years_active,year_ex,success_rate,happy_clients,jurisdiction,cases_won } = req.body;
    let newProfileImgUrl = profile_img;

    // If profile_img is a full URL, extract only the S3 key
    if (profile_img && profile_img.includes("https://")) {
      const urlParts = profile_img.split("/");
      const index = urlParts.findIndex(part => part === "profile_images");
      newProfileImgUrl = urlParts.slice(index).join("/");
    }

    // If a new file is uploaded, upload to S3
    if (req.file) {
      const fileContent = req.file.buffer;
      const fileKey = `profile_images/${Date.now()}_${req.file.originalname}`;
      const params = {
        Bucket: awsSecrets.bucket,
        Key: fileKey,
        Body: fileContent,
        ContentType: req.file.mimetype,
      };

      await s3Client.send(new PutObjectCommand(params));
      newProfileImgUrl = fileKey;
    }

    // If no image, use existing from DB
    if (!newProfileImgUrl) {
      const [rows] = await db.promise().query(
        `SELECT profile_img FROM chatsignup WHERE id = ?`,
        [id]
      );
      newProfileImgUrl = rows[0]?.profile_img || "";
    }

    const query = `
      UPDATE chatsignup
      SET username = ?, mobile_no = ?, gst_number = ?, bar_code = ?,  law_specialists = ?, address = ?, profile_img = ?,  about = ?, templatepath = ?, years_active = ?, year_ex = ?, success_rate = ?, happy_clients = ?,jurisdiction = ?, cases_won = ?
      WHERE id = ?`;

    const values = [username,mobile_no, gst_number, bar_code,  law_specialists, address, newProfileImgUrl,  about, templatepath, years_active, year_ex, success_rate, happy_clients,jurisdiction, cases_won, id];

    const [result] = await db.promise().query(query, values);

    if (result.affectedRows === 0) {
      return res.status(404).json({ message: "User not found or no changes made" });
    }

    return res.status(200).json({
      message: "Profile updated successfully",
      profile_img: newProfileImgUrl
    });

  } catch (error) {
    console.error("Database Query Error:", error);
    return res.status(500).json({ error: "Internal Server Error" });
  }
};

exports.getProfileweb = async (req, res) => {
  try {
    const { userid } = req.query;
    let query = `SELECT  username, about, templatepath, years_active, year_ex,whatsapp_no, success_rate, happy_clients,jurisdiction, cases_won, email, state, law_specialists,  role, address, profile_img
                 FROM chatsignup 
                 WHERE list_verify = 1`;
    let values = [];

    if (userid) {
      query += ` AND id = ?`;
      values.push(userid);
    }

    const [rows] = await db.promise().query(query, values);

    if (rows.length === 0) {
      return res.status(404).json({ message: "No profiles found" });
    }

    for (const profile of rows) {
      if (profile.profile_img) {
        profile.profile_img = await checkS3File(profile.profile_img);
      }
    }

    res.status(200).json(rows);
  } catch (error) {
    console.error("Database Query Error:", error);
    res.status(500).json({ error: "Internal Server Error" });
  }
};

exports.getmemberlisting = async (req, res) => {
  try {
    const { town, state } = req.query;   // both optional

    let query = `SELECT id, username, about, templatepath, town,
                   years_active, year_ex, whatsapp_no, success_rate,
                   happy_clients, cases_won, email, state,
                   law_specialists, role, address, jurisdiction, profile_img
                 FROM chatsignup
                 WHERE membership = 1`;
    let values = [];

    if (town) {
      query += ` AND town LIKE ?`;
      values.push(`%${town}%`);   // LIKE handles minor spelling differences
    }
    if (state) {
      query += ` AND state LIKE ?`;
      values.push(`%${state}%`);
    }

    const [rows] = await db.promise().query(query, values);

    if (rows.length === 0) {
      return res.status(404).json({ message: "No profiles found" });
    }

    for (const profile of rows) {
      if (profile.profile_img) {
        profile.profile_img = await checkS3File(profile.profile_img);
      }
    }

    res.status(200).json(rows);
  } catch (error) {
    console.error("Database Query Error:", error);
    res.status(500).json({ error: "Internal Server Error" });
  }
};


exports.submitReview = async (req, res) => {
  const { lawyer_id, reviewer_name, review_text, rating } = req.body;

  if (!lawyer_id || !reviewer_name || !review_text || !rating) {
    return res.status(400).json({ error: 'All fields required' });
  }

  try {
    await db.promise().query(
      `INSERT INTO lawyer_reviews (lawyer_id, reviewer_name, review_text, rating) 
       VALUES (?, ?, ?, ?)`,
      [lawyer_id, reviewer_name, review_text, rating]
    );
    return res.status(200).json({ message: 'Review submitted successfully' });
  } catch (err) {
    console.error('submitReview error:', err);
    return res.status(500).json({ error: 'Failed to submit review' });
  }
};

exports.getReviews = async (req, res) => {
  const { lawyer_id } = req.query;
  try {
    const [rows] = await db.promise().query(
      `SELECT reviewer_name, review_text, rating, created_at 
       FROM lawyer_reviews WHERE lawyer_id = ? ORDER BY created_at DESC`,
      [lawyer_id]
    );
    res.status(200).json(rows);
  } catch (err) {
    res.status(500).json({ error: 'Failed to fetch reviews' });
  }
};

exports.getmemberlistingem = async (req, res) => {
  try {
    const { userid } = req.query;

    let query = `SELECT id, username, about, templatepath, town, years_active, year_ex,
                        whatsapp_no, success_rate, happy_clients,jurisdiction, cases_won, email, state,
                        law_specialists, role, address, profile_img
                 FROM chatsignup
                 WHERE membership = 1`;
    let values = [];

    if (userid) {
      query += ` AND id = ?`;
      values.push(userid);
    }

    const [rows] = await db.promise().query(query, values);

    if (rows.length === 0) {
      return res.status(404).json({ message: "No profiles found" });
    }

    for (const profile of rows) {
      if (profile.profile_img) {
        profile.profile_img = await checkS3File(profile.profile_img);
      }
      // Parse JSON columns
      if (typeof profile.law_specialists === 'string') {
        profile.law_specialists = JSON.parse(profile.law_specialists);
      }
      if (typeof profile.selected_jurisdictions === 'string') {
        profile.selected_jurisdictions = JSON.parse(profile.selected_jurisdictions);
      }
    }

    res.status(200).json(rows);
  } catch (error) {
    console.error("Database Query Error:", error);
    res.status(500).json({ error: "Internal Server Error" });
  }
};