const { getPool } = require('../database/db');
const db = getPool();
const bcrypt = require('bcrypt');
const { S3Client, PutObjectCommand,GetObjectCommand } = require('@aws-sdk/client-s3');
const fs = require('fs');
const path = require('path');
const { PDFDocument, rgb, StandardFonts } = require("pdf-lib");
const { getAwsSecrets } = require('../utils/razorpayvalut'); 
require('dotenv').config();
const nodemailer = require("nodemailer");
const ExcelJS = require('exceljs');
const crypto = require('crypto');
const { getIO } = require('../../test');
const { console } = require('inspector');


exports.createAdmin = async (req, res) => {
  const { username, email, mobile_no, address, pass_word } = req.body;

  try {
    const hashedPassword = await bcrypt.hash(pass_word, 10);
    const sql = 'INSERT INTO Admins (username, email, mobile_no, address, pass_word) VALUES (?, ?, ?, ?, ?)';
    db.query(sql, [username, email, mobile_no, address, hashedPassword], (err, result) => {
      if (err) {
        console.error('Database Query Error:', err);
        return res.status(500).send({ error: true, message: 'Database query failed' });
      }
      console.log('User registered successfully:', result);
      res.send({  message: 'User created successfully.' });
    });
  } catch (error) {
    console.error('Error:', error);
    res.status(500).send({ error: true, message: 'Internal server error' });
  }
};

exports.getAdmin = (req, res) => {
  db.query('SELECT * FROM Admins WHERE id = 2', (err, results) => {
    if (err) {
      console.error('Error fetching admin data:', err);
      return res.status(500).json({ error: 'Failed to fetch admin data' });
    }
    res.json({ data: results });
  });
};

exports.adminLogin = (req, res) => {
  const { email, pass_word } = req.body;

  const query = 'SELECT * FROM Admins WHERE email = ?';
  const values = [email];

  db.query(query, values, async (err, results) => {

    if (err) {
      console.error('Error executing MySQL query:', err.stack);
      return res.status(500).json({ message: 'Internal server error' });
    }

    if (results.length === 0) {
      return res.status(404).json({ message: 'User not found or invalid credentials' });
    }

    const user = results[0];

    try {
      const match = await bcrypt.compare(pass_word, user.pass_word);

      if (!match) {
        return res.status(401).json({ message: 'Invalid credentials' });
      }

      // ✅ OTP verification check
      if (user.verify_otp === 0) {
        return res.status(403).json({
          message: 'OTP not verified. Please verify your account before login.'
        });
      }

      // Safely parse screens
      let parsedScreens = user.screens;
      try {
        if (typeof user.screens === 'string') {
          parsedScreens = JSON.parse(user.screens);
        }
      } catch (parseErr) {
        console.error('Error parsing screens JSON:', parseErr);
      }

      return res.status(200).json({
        message: 'Login successful',
        id: user.id,
        username: user.username,
        role: user.role,
        screens: parsedScreens,
        referral_code: user.referral_code
      });

    } catch (error) {
      console.error('Error during login:', error);
      return res.status(500).json({ message: 'Internal server error' });
    }

  });
};


exports.updateAdmin = (req, res) => {
  const { username, email, mobile_no, address } = req.body;
  db.query(
    'UPDATE Admins SET username = ?, email = ?, mobile_no = ?, address = ? WHERE id = 1',
    [username, email, mobile_no, address],
    (err, results) => {
      if (err) {
        console.error('Error updating admin data:', err);
        return res.status(500).json({ error: 'Failed to update profile' });
      }
      if (results.affectedRows === 0) {
        return res.status(404).json({ error: 'Admin not found' });
      }
      res.json({ message: 'Profile updated successfully!' });
    }
  );
};

exports.getUserCount = (req, res) => {
  db.query('SELECT COUNT(*) AS userCount FROM chatsignup', (err, results) => {
    if (err) {
      console.error('Error fetching user data:', err);
      return res.status(500).json({ error: 'Failed to fetch user data' });
    }
    const userCount = results[0].userCount;
    res.json({ userCount });
  });
};

exports.getNewUsers = (req, res) => {
  const query = `
    SELECT COUNT(*) AS userCount
    FROM chatsignup
    WHERE created_at >= NOW() - INTERVAL 1 DAY
  `;
  db.query(query, (err, results) => {
    if (err) {
      console.error('Error fetching user data:', err);
      return res.status(500).json({ error: 'Failed to fetch user data' });
    }
    const userCount = results[0].userCount;
    res.json({ userCount });
  });
};

exports.getUserList = (req, res) => {
  const query = 'SELECT id, username, mobile_no,source, email,role, created_at FROM chatsignup ORDER BY id DESC';
  db.query(query, (err, results) => {
    if (err) {
      res.status(500).json({ error: 'Internal Server Error' });
      return;
    }
    res.json(results);
  });
};

exports.getUserReports = (req, res) => {
  const sql = `
    SELECT 
    u.report_id, 
    u.report_details, 
    DATE_FORMAT(u.report_date, "%Y-%m-%d") AS report_date,
    c.username,
    c.mobile_no
FROM 
    user_report u
JOIN 
    chatsignup c
ON 
    u.user_id = c.id; -- Assuming 'user_id' is the linking field

  `;
  db.query(sql, (err, results) => {
    if (err) {
      console.error('Database Query Error:', err);
      return res.status(500).send({ error: true, message: 'Database query failed' });
    }
    res.send({ reports: results });
  });
};

exports.deleteUserReport = (req, res) => {
  const reportId = req.params.id;
  const sql = 'DELETE FROM user_report WHERE report_id = ?';
  db.query(sql, [reportId], (err, result) => {
    if (err) {
      console.error('Database Query Error:', err);
      return res.status(500).send({ error: true, message: 'Database query failed' });
    }
    if (result.affectedRows === 0) {
      return res.status(404).send({ error: true, message: 'Report not found' });
    }
    res.send({ error: false, message: 'Report deleted successfully' });
  });
};


exports.getUsersByStatus = (req, res) => {
  const query = `
    SELECT 
      COUNT(CASE WHEN active = 1 THEN 1 END) AS activeUsers,
      COUNT(CASE WHEN active = 0 THEN 1 END) AS inactiveUsers
    FROM chatsignup
  `;

  db.query(query, (err, result) => {
    if (err) {
      console.error('Error fetching user statuses:', err);
      return res.status(500).json({ message: 'Internal server error' });
    }

    res.status(200).json({
      activeUsers: result[0].activeUsers,
      inactiveUsers: result[0].inactiveUsers,
    });
  });
};

exports.getPaymenttransaction = (req, res) => {
  const query = `
  SELECT 
    cs.username AS username,
    cs.mobile_no AS mobile_no,
    cs.cals AS cals,
    s.user_id, 
    IFNULL(t.status, 'N/A') AS transaction_status, 
    IFNULL(s.features, 'N/A') AS features,
    IFNULL(s.plan_Name, 'N/A') AS plan_Name,
    IFNULL(DATE(t.created_at), '0000-00-00') AS created_at,
    IFNULL(t.amount_in_paise, 0) AS amount_in_paise,
    IFNULL(t.invoice_id, 'N/A') AS invoice_id
FROM 
    transactions t
INNER JOIN 
    subscriptions s ON t.sub_id = s.id
INNER JOIN 
    chatsignup cs ON s.user_id = cs.id
ORDER BY t.created_at DESC;

  `;

  db.query(query, (err, results) => {
    if (err) {
      console.error("Database query error:", err);
      return res.status(500).json({ error: "Failed to retrieve payment history" });
    }

    if (results.length === 0) {
      return res.status(404).json({ message: "No payment history found" });
    }

    return res.status(200).json(results);
  });
};

exports.getPaymenttrail = (req, res) => {
  const query = `
    SELECT 
      cs.id, 
      cs.username, 
      cs.mobile_no, 
      cs.role, 
      cs.trail_pack_date,
      s.plan_name
    FROM chatsignup cs
    LEFT JOIN subscriptions s ON cs.sub_id = s.id
    WHERE cs.trial_pack = 1
    ORDER BY cs.trail_pack_date DESC;
  `;

  db.query(query, (err, results) => {
    if (err) {
      console.error("Database query error:", err);
      return res.status(500).json({ error: "Failed to retrieve payment history" });
    }

    if (results.length === 0) {
      return res.status(404).json({ message: "No payment history found" });
    }

    return res.status(200).json(results);
  });
};




exports.Paytransaction = async (req, res) => {
  const query = `
    SELECT 
      cs.username AS username,
      s.user_id, 
      IFNULL(t.status, 'N/A') AS transaction_status, 
      IFNULL(t.razorpay_pay_id, 'N/A') AS razorpay_pay_id,
      IFNULL(DATE(t.created_at), '0000-00-00') AS created_at,
      IFNULL(t.payment_method , 0) AS payment_method,
      IFNULL(t.invoice_number, 'N/A') AS invoice_number
    FROM 
      transactions t
    INNER JOIN 
      subscriptions s ON t.sub_id = s.id
    INNER JOIN 
      chatsignup cs ON s.user_id = cs.id
    ORDER BY t.created_at DESC;
  `;

  try {
    const awsSecrets = await getAwsSecrets();

    db.query(query, (err, results) => {
      if (err) {
        console.error("Database query error:", err);
        return res.status(500).json({ error: "Failed to retrieve payment history" });
      }

      if (results.length === 0) {
        return res.status(404).json({ message: "No payment history found" });
      }
        const formatInvoiceFilename = (name) =>
          name.replace(/[\/\\#?%*:|"<>]/g, '_').replace(/^_+/, ''); 

        const formattedResults = results.map((row) => {
          return {
            ...row,
            invoice_url:
              row.invoice_number !== 'N/A'
                ? `https://${awsSecrets.bucket}.s3.${awsSecrets.region}.amazonaws.com/invoicepdf/${formatInvoiceFilename(row.invoice_number)}.pdf`
                : null
          };
        });
      return res.status(200).json(formattedResults);
    });
  } catch (err) {
    console.error("AWS Secrets error:", err);
    return res.status(500).json({ error: "Failed to load AWS credentials" });
  }
};


exports.getRevenueByStatus = (req, res) => {
  const query = `
    SELECT
      DATE_FORMAT(created_at, '%M') AS Month,
      SUM(amount_in_paise) / 100 AS Sales 
    FROM transactions 
    GROUP BY DATE_FORMAT(created_at, '%M'), YEAR(created_at);
  `;

  db.query(query, (error, results) => {
    if (error) {
      console.error("Error fetching data from transactions table:", error);
      return res.status(500).json({
        success: false,
        message: "Error fetching revenue data.",
      });
    }

    // Convert results to an array of objects
    const formattedData = results.map(row => ({
      Month: row.Month,
      Sales: parseFloat(row.Sales).toFixed(4), 
    }));

    res.json({
      success: true,
      data: formattedData,
    });
  });
};


function generrateOtp() {
  const otp = crypto.randomInt(100000, 1000000);
  return otp.toString();
}


async function sendOtpEmail(email, otp) {
  try {
    const transporter = nodemailer.createTransport({
      host: process.env.EMAIL_HOST || 'smtp.gmail.com',
      port: 587,
      secure: false,
      auth: {
        user: process.env.EMAIL_USERNAME,     
        pass: process.env.EMAIL_USERPASSWORD 
      }
    });

    const mailOptions = {
      from: `"Juristbot" <${process.env.FROM_EMAIL}>`,  
      to: email,
      subject: 'Email Verification Code',
      html: `
        <!DOCTYPE html>
        <html lang="en">
        <head>
            <meta charset="UTF-8">
            <meta name="viewport" content="width=device-width, initial-scale=1.0">
            <title>Email Verification Code</title>
            <style>
                body { font-family: Arial, sans-serif; background-color: #f4f4f4; margin: 0; padding: 0; }
                .email-container { max-width: 550px; margin: 0 auto; background-color: #ffffff; padding: 15px; border-radius: 7px; border: 1px solid rgb(214, 214, 214); box-shadow: rgba(0, 0, 0, 0.1) 0px 0px 5px 0px, rgba(0, 0, 0, 0.1) 0px 0px 1px 0px; }
                .email-header { text-align: center; padding: 10px 0; }
                .email-header img { height: 40px; }
                .email-body { padding: 15px; }
                .otp { font-size: 2em; background-color: #DCA02C0D; padding: 5px 10px; border-radius: 8px; display: inline-block; margin: 12px; text-align: center; letter-spacing: 0.9em; }
                .email-footer { text-align: center; font-size: 1em; color: #161414; padding: 10px 0 0; border-top: 1px solid #eeeeee; }
                .custom-color { color: #FFC42B; margin: 0px 0px 0px 0px; }
            </style>
        </head>
        <body>
            <div class="email-container">
                <div class="email-header">
                    <img src="https://rotary-bot.s3.ap-south-1.amazonaws.com/Profile%20Images/cards.png" alt="juristbot">
                </div>
                <div class="email-body">
                    <p>Here is your One Time Password (OTP).</p>
                    <p>Please enter this code to verify your email address for Juristbot bot</p>
                    <div class="otp"><strong>${otp}</strong></div>
                    <p>OTP will expire in 5 minutes.</p>
                    <p class="no-margin">Best Regards,</p>
                    <p class="custom-color">Juristbot team.</p>
                </div>
                <div class="email-footer">
                    &copy; 2024 JURISTBOT. All rights reserved.
                </div>
            </div>
        </body>
        </html>
      `
    };

    const info = await transporter.sendMail(mailOptions);
    console.log("✅ OTP email sent: %s", info.messageId);
    return info.messageId;
  } catch (error) {
    console.error("❌ Error sending OTP email:", error);
    throw error;
  }
}



exports.sendotpsmailadmin= (req, res) => {
  const { email } = req.body;
  db.query('SELECT * FROM Admins WHERE email = ?', [email], (err, result) => {
      if (err) {
          console.error('Database query error:', err);
          return res.status(500).json({ error: true, message: 'Database query failed' });
      }
      if (result.length === 0) {
          return res.status(400).json({ error: true, message: 'Email not found  please correct email' });
      }
      const otp = generrateOtp();
      db.query('UPDATE Admins SET otp = ? WHERE email = ?', [otp, email], (err) => {
          if (err) {
              console.error('Database update error:', err);
              return res.status(500).json({ error: true, message: 'Failed to update OTP' });
          }
          sendOtpEmail(email, otp);
          return res.json({ error: false, message: 'OTP sent to email.' });
      });
  });
};

exports.verifypasswordadmin= (req, res) => {
  const { otp, password } = req.body;
  if (!otp || !password) {
    return res.status(400).json({ error: true, message: 'OTP and password are required.' });
  }
  db.query('SELECT * FROM Admins WHERE otp = ?', [otp], (error, results) => {
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
      db.query('UPDATE Admins SET pass_word = ? WHERE otp = ?', [hashedPassword, otp], (updateError) => {
        if (updateError) {
          console.error('Failed to update the password:', updateError);
          return res.status(500).json({ error: true, message: 'Failed to update the password' });
        }
        return res.json({ error: false, message: 'Password updated successfully.' });
      });
      
    });
  });
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
  } catch (err) {
    console.error("❌ AWS secrets init failed:", err);
  }
})();

exports.Certificate = async (req, res) => {
  try {
    const { user_id } = req.body;
    if (!user_id) return res.status(400).json({ message: "Missing user_id" });

    const id = user_id;

    // Step 1: Fetch user info
    const [rows] = await db.promise().query(
      "SELECT username, certificate_no FROM chatsignup WHERE id = ?",
      [id]
    );
    if (rows.length === 0) return res.status(404).json({ message: "User not found" });

    const { username, certificate_no } = rows[0];
    let finalCertificateNo = certificate_no;

    // Step 2: Generate certificate number if missing
    if (!certificate_no) {
      const [certRows] = await db.promise().query(
        "SELECT certificate_no FROM chatsignup WHERE certificate_no IS NOT NULL ORDER BY certificate_no DESC LIMIT 1"
      );
      if (certRows.length > 0) {
        const lastCert = certRows[0].certificate_no;
        const lastNumber = parseInt(lastCert.replace("ALSJB", ""), 10);
        finalCertificateNo = "ALSJB" + String(lastNumber + 1).padStart(7, "0");
      } else {
        finalCertificateNo = "ALSJB0000001";
      }
    }

    // Step 3: Load template PDF
    const templateBytes = fs.readFileSync(path.join(__dirname, "../public/cals.pdf"));
    const pdfDoc = await PDFDocument.load(templateBytes);
    const page = pdfDoc.getPages()[0];

    // Step 4: Embed font
    const font = await pdfDoc.embedFont(StandardFonts.HelveticaBold);

    // Step 5: Draw text on PDF
    page.drawText(username.toUpperCase(), {
      x: 360,
      y: 300,
      size: 18,
      font,
      color: rgb(0, 0, 0),
    });

    page.drawText(`Certificate No: ${finalCertificateNo}`, {
      x: 350,
      y: 390,
      size: 10,
      font,
      color: rgb(0.2, 0.2, 0.2),
    });

    const pdfBytes = await pdfDoc.save();
    const s3Key = `certificates/${finalCertificateNo}.pdf`;

    // Step 6: Upload to S3 using AWS SDK v3
    const uploadCommand = new PutObjectCommand({
      Bucket: awsSecrets.bucket,
      Key: s3Key,
      Body: Buffer.from(pdfBytes),
      ContentType: "application/pdf",
    });

    await s3Client.send(uploadCommand);
    const certificate_url = `https://${awsSecrets.bucket}.s3.${awsSecrets.region}.amazonaws.com/${s3Key}`;

    // Step 7: Update database
    await db.promise().query(
      "UPDATE chatsignup SET certificate_no = ?, certificate_url = ?, cals = 1 WHERE id = ?",
      [finalCertificateNo, certificate_url, id]
    );

    console.log(`✅ Certificate issued to ${username} (${id}): ${finalCertificateNo}`);

    // Step 8: Send certificate via email
    const [userEmailRow] = await db.promise().query(
      "SELECT email FROM chatsignup WHERE id = ?",
      [id]
    );
    const userEmail = userEmailRow[0]?.email;

    if (userEmail) {
      const transporter = nodemailer.createTransport({
        host: process.env.EMAIL_HOST || 'smtp.gmail.com',
        port: 587,
        secure: false,
        auth: {
          user: process.env.EMAIL_USERNAME,
          pass: process.env.EMAIL_USERPASSWORD,
        },
      });

      const mailOptions = {
        from: '"JuristBot 🧑‍⚖️" <noreply@juristbot.ai>',
        to: userEmail,
        subject: '🎉 Your AI Legal Specialist Certificate from JuristBot',
        html: `
          <div style="font-family: Arial, sans-serif; padding: 20px;">
            <h2>Congratulations, ${username}!</h2>
            <p>You have successfully completed the <strong>AI Tools for Legal Assistance and Case Management</strong> program.</p>
            <p>Your certificate number is: <strong>${finalCertificateNo}</strong></p>
            <p>🎓 Click the link below to view or download your official certificate:</p>
            <p>🔗 <a href="${certificate_url}" target="_blank">Download Certificate</a></p>
            <br/>
            <p style="font-size: 14px; color: #888;">— JuristBot Team</p>
          </div>
        `
      };
      const info = await transporter.sendMail(mailOptions);
      console.log('✅ Certificate email sent:', info.messageId);
    } else {
      console.warn(`⚠️ Email not found `);
    }

    res.status(200).json({
      message: "Certificate issued successfully",
      certificate_no: finalCertificateNo,
      certificate_url,
    });
  } catch (err) {
    console.error("❌ Certificate generation error:", err);
    res.status(500).json({ message: "Internal server error" });
  }
};


exports.Exportuserlist = (req, res) => {
  const { startDate, endDate, } = req.body;

  if (!startDate || !endDate) {
    return res.status(400).json({ message: 'startDate and endDate are required' });
  }

  let sql = `
    SELECT 
      id, username, mobile_no, email, role, created_at 
    FROM chatsignup 
    WHERE DATE(created_at) BETWEEN ? AND ?
  `;
  const params = [startDate, endDate];

  db.query(sql, params, async (err, results) => {
    if (err) {
      console.error('DB error:', err);
      return res.status(500).json({ message: 'Database error' });
    }

    if (!results.length) {
      return res.status(404).json({ message: 'No data found' });
    }

    const workbook = new ExcelJS.Workbook();
    const worksheet = workbook.addWorksheet('ChatSignups');

    worksheet.columns = [
      { header: 'ID', key: 'id', width: 10 },
      { header: 'Name', key: 'username', width: 25 },
      { header: 'Phone', key: 'mobile_no', width: 20 },
      { header: 'Email', key: 'email', width: 30 },
      { header: 'Role', key: 'role', width: 20 },
      { header: 'Created At', key: 'created_at', width: 25 },
    ];

    worksheet.addRows(results);

    res.setHeader('Content-Type', 'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet');
    res.setHeader('Content-Disposition', 'attachment; filename=chat_signup_export.xlsx');

    await workbook.xlsx.write(res);
    res.end();
  });
};

exports.drafts = (req, res) => {
  const reportId = req.params.id;
  const sql = 'SELECT * FROM legal_draft_pricing ORDER BY id DESC';

  db.query(sql, [reportId], (err, result) => {
    if (err) {
      console.error('Database Query Error:', err);
      return res.status(500).send({ error: true, message: 'Database query failed' });
    }

    if (result.length === 0) {
      return res.status(404).send({ error: true, message: 'Drafts not found' });
    }

    res.send({ message: 'Drafts retrieved successfully', data: result });
  });
};

exports.newdraft = (req, res) => {
  const { draft_name,draft_type,sub_type_name , domestic_bot_price, domestic_customization_price, international_bot_price, international_customization_price} = req.body;
  console.log("Received new draft data:",req.body);

  const sql = `
    INSERT INTO legal_draft_pricing 
    (draft_name, draft_type, sub_type_name , domestic_bot_price, domestic_customization_price, international_bot_price, international_customization_price) 
    VALUES (?, ?, ?, ?, ?, ?, ?)
  `;
  db.query(sql, [ draft_name,draft_type,sub_type_name , domestic_bot_price, domestic_customization_price, international_bot_price,international_customization_price], (err, result) => {
    if (err) {
      console.error("Insert Error:", err);
      return res.status(500).json({ error: true, message: 'Failed to create draft' });
    }
    res.json({ message: 'Draft created successfully' });
  });
};


exports.deletedraft = (req, res) => {
  const { id } = req.params;
  console.log("Delete draft id:", id);

  const sql = `DELETE FROM legal_draft_pricing WHERE id = ?`;

  db.query(sql, [id], (err, result) => {
    if (err) {
      console.error("Delete Error:", err);
      return res.status(500).json({ error: true, message: 'Failed to delete draft' });
    }
    if (result.affectedRows === 0) {
      return res.status(404).json({ error: true, message: 'Draft not found' });
    }
    res.json({ message: 'Draft deleted successfully' });
  });
};

exports.updatedrafts = (req, res) => {
  const draftId = req.params.id;
  const { draft_name,draft_type,sub_type_name , domestic_bot_price, domestic_customization_price, international_bot_price, international_customization_price } = req.body;
  const sql = `
    UPDATE legal_draft_pricing 
    SET draft_name = ?, 
        draft_type = ?, 
        sub_type_name = ?,    
        domestic_bot_price = ?, 
        domestic_customization_price = ?, 
        international_bot_price = ?, 
        international_customization_price = ? 
    WHERE id = ?
  `;

  db.query(sql, [ draft_name,draft_type,sub_type_name , domestic_bot_price, domestic_customization_price, international_bot_price, international_customization_price, draftId], (err, result) => {
    if (err) {
      console.error("Update Error:", err);
      return res.status(500).json({ error: true, message: 'Failed to update draft' });
    }

    if (result.affectedRows === 0) {
      return res.status(404).json({ error: true, message: 'Draft not found' });
    }

    res.json({ message: 'Draft updated successfully' });
  });
};

exports.activedeal = async (req, res) => {
  try {
    const {  all } = req.body;
    const allValue = all ? 1 : 0;

   console.log("Received active deal update:", { all: allValue });
    if (typeof allValue === "number") {
      const sqlAll = `UPDATE settings SET active_block_friday = ?`;
      await db.promise().query(sqlAll, [allValue]);
    }

    res.status(200).json({
      success: true,
      message: "Active deals updated successfully",
    });

  } catch (error) {
    console.error("Failed to update active deals:", error);
    res.status(500).json({
      success: false,
      message: "Server error",
      error: error.message,
    });
  }
};  

exports.getActiveDeal = async (req, res) => {
  try {
    const [settings] = await db
      .promise()
      .query(`SELECT active_block_friday FROM settings LIMIT 1`);

    const blackFriday = settings.length
      ? Number(settings[0].active_block_friday) === 1
      : false;

    return res.status(200).json({
      success: true,
      blackFriday,
    });
  } catch (error) {
    console.error("GET Active Deal Error:", error);
    return res.status(500).json({
      success: false,
      message: "Server error",
    });
  }
};




exports.createDiscussion = (req, res) => {
  const { course_id, module_id, message ,user_id } = req.body;

  if (!course_id || !module_id || !message) {
    return res.status(400).json({ success: false, message: 'Missing required fields' });
  }

  const sql = `
    INSERT INTO module_discussions (course_id, module_id, user_id, message, status, is_pinned)
    VALUES (?, ?, ?, ?, 'open', 0)
  `;

  db.query(sql, [course_id, module_id, user_id, message], (err, result) => {
    if (err) {
      console.error('Error creating discussion:', err);
      return res.status(500).json({ success: false, message: 'Failed to create discussion' });
    }

    const discussionId = result.insertId;

    // Get user details for the response
    const getUserSql = 'SELECT id, username, email FROM chatsignup WHERE id = ?';
    db.query(getUserSql, [user_id], (userErr, userResult) => {
      if (userErr) {
        console.error('Error fetching user:', userErr);
      }

      const discussionData = {
        discussion_id: discussionId,
        course_id,
        module_id,
        user_id,
        user: userResult[0] || {},
        message,
        status: 'open',
        is_pinned: 0,
        created_at: new Date(),
      };

      // Emit to admin room
      getIO().emit('newDiscussion', discussionData);

      res.json({
        success: true,
        message: 'Discussion created successfully',
        data: discussionData
      });
    });
  });
};

exports.getModuleDiscussions = (req, res) => {
  const { module_id ,user_id} = req.params;
  console.log(module_id)

  const sql = `
    SELECT 
      md.id as discussion_id,
      md.course_id,
      md.module_id,
      md.user_id,
      md.message,
      md.status,
      md.is_pinned,
      md.created_at,
      u.username as user_name,
      (SELECT COUNT(*) FROM discussion_replies WHERE discussion_id = md.id) as reply_count
    FROM module_discussions md
    JOIN chatsignup u ON md.user_id = u.id
    WHERE md.module_id = ? AND md.user_id = ?
    ORDER BY md.is_pinned DESC, md.created_at DESC
  `;

  db.query(sql, [module_id, user_id], (err, discussions) => {
    if (err) {
      console.error('Error fetching discussions:', err);
      return res.status(500).json({ success: false, message: 'Failed to fetch discussions' });
    }

    res.json({ success: true, data: discussions });
  });
};


exports.replyToDiscussion = (req, res) => {
  const { discussionId, user_id } = req.params;
  const { message } = req.body;

  if (!message) {
    return res.status(400).json({ success: false, message: 'Message is required' });
  }

  const sql = `
    INSERT INTO discussion_replies (discussion_id, user_id, message, is_instructor)
    VALUES (?, ?, ?, 0)
  `;

  db.query(sql, [discussionId, user_id, message], (err, result) => {
    if (err) {
      console.error('Error creating reply:', err);
      return res.status(500).json({ success: false, message: 'Failed to create reply' });
    }

    const replyId = result.insertId;

    // Get user details
    const getUserSql = 'SELECT id, username, email FROM chatsignup WHERE id = ?';
    db.query(getUserSql, [user_id], (userErr, userResult) => {
      const replyData = {
        reply_id: replyId,
        discussion_id: discussionId,
        user_id,
        user: userResult[0] || {},
        message,
        is_instructor: 0,
        created_at: new Date(),
      };

      // Emit to discussion room
      getIO().to(`discussion_${discussionId}`).emit('newReply', replyData);

      res.json({
        success: true,
        message: 'Reply created successfully',
        data: replyData
      });
    });
  });
};

// Get all discussions (Admin)
exports.getAllDiscussions = (req, res) => {
  const sql = `
    SELECT 
      md.id as discussion_id,
      md.course_id,
      md.module_id,
      md.user_id,
      md.message,
      md.status,
      md.is_pinned,
      md.created_at,
      u.username as user_name,
      u.email as user_email,
      c.course_title as course_title,
      m.module_title as module_title,
      (SELECT COUNT(*) FROM discussion_replies WHERE discussion_id = md.id) as reply_count,
      (SELECT COUNT(*) FROM discussion_replies WHERE discussion_id = md.id AND is_instructor = 1) as instructor_reply_count
    FROM module_discussions md
    JOIN chatsignup u ON md.user_id = u.id
    LEFT JOIN courses c ON md.course_id = c.id
    LEFT JOIN modules m ON md.module_id = m.id
    ORDER BY md.is_pinned DESC, md.created_at DESC
  `;

  db.query(sql, (err, discussions) => {
    if (err) {
      console.error('Error fetching discussions:', err);
      return res.status(500).json({ success: false, message: 'Failed to fetch discussions' });
    }

    res.json({ success: true, data: discussions });
  });
};

// Get unread discussions (Admin)
exports.getUnreadDiscussions = (req, res) => {
  const sql = `
    SELECT 
      md.id as discussion_id,
      md.course_id,
      md.module_id,
      md.user_id,
      md.message,
      md.status,
      md.is_pinned,
      md.created_at,
      u.username as user_name,
      u.email as user_email,
      c.course_title as course_title,
      m.module_title as module_title,
      (SELECT COUNT(*) FROM discussion_replies WHERE discussion_id = md.id) as reply_count
    FROM module_discussions md
    JOIN chatsignup u ON md.user_id = u.id
    LEFT JOIN courses c ON md.course_id = c.id
    LEFT JOIN modules m ON md.module_id = m.id
    WHERE NOT EXISTS (
      SELECT 1 FROM discussion_replies 
      WHERE discussion_id = md.id AND is_instructor = 1
    )
    ORDER BY md.is_pinned DESC, md.created_at DESC
  `;

  db.query(sql, (err, discussions) => {
    if (err) {
      console.error('Error fetching unread discussions:', err);
      return res.status(500).json({ success: false, message: 'Failed to fetch unread discussions' });
    }

    res.json({ success: true, data: discussions });
  });
};


// Controller: adminController.js
exports.getDiscussionReplies = (req, res) => {
  const { discussionId, user_id } = req.params;

  // First verify the discussion belongs to the user
  const checkOwnershipSql = 'SELECT id FROM module_discussions WHERE id = ? AND user_id = ?';
  
  db.query(checkOwnershipSql, [discussionId, user_id], (checkErr, checkResult) => {
    if (checkErr) {
      console.error('Error checking discussion ownership:', checkErr);
      return res.status(500).json({ success: false, message: 'Failed to verify discussion' });
    }

    if (checkResult.length === 0) {
      return res.status(403).json({ success: false, message: 'Access denied to this discussion' });
    }

    // Fetch replies if user owns the discussion
    const sql = `
      SELECT 
        dr.id as reply_id,
        dr.discussion_id,
        dr.user_id,
        dr.message,
        dr.is_instructor,
        dr.created_at,
        u.username as user_name,
        u.email as user_email
      FROM discussion_replies dr
      JOIN chatsignup u ON dr.user_id = u.id
      WHERE dr.discussion_id = ?
      ORDER BY dr.created_at ASC
    `;

    db.query(sql, [discussionId], (err, replies) => {
      if (err) {
        console.error('Error fetching replies:', err);
        return res.status(500).json({ success: false, message: 'Failed to fetch replies' });
      }

      res.json({ success: true, data: replies });
    });
  });
};


exports.adminReply = (req, res) => {
  const { discussionId,user_id } = req.params;
  const { message } = req.body;

  if (!message) {
    return res.status(400).json({ success: false, message: 'Message is required' });
  }

  const sql = `
    INSERT INTO discussion_replies (discussion_id, user_id, message, is_instructor)
    VALUES (?, ?, ?, 1)
  `;

  db.query(sql, [discussionId, user_id, message], (err, result) => {
    if (err) {
      console.error('Error creating admin reply:', err);
      return res.status(500).json({ success: false, message: 'Failed to create reply' });
    }

    const replyId = result.insertId;

    // Update discussion status to answered if needed
    const updateStatusSql = `
      UPDATE module_discussions 
      SET status = 'answered' 
      WHERE id = ? AND status = 'open'
    `;
    db.query(updateStatusSql, [discussionId]);

    const replyData = {
      reply_id: replyId,
      discussion_id: discussionId,
      user_id: user_id,
      message,
      is_instructor: 1,
      created_at: new Date(),
    };

    // Emit to discussion room and user
    getIO().to(`discussion_${discussionId}`).emit('instructorReply', replyData);

    res.json({
      success: true,
      message: 'Reply created successfully',
      data: replyData
    });
  });
};

// Update discussion status
exports.updateDiscussionStatus = (req, res) => {
  const { discussionId } = req.params;
  const { status } = req.body;

  if (!['open', 'answered', 'closed'].includes(status)) {
    return res.status(400).json({ success: false, message: 'Invalid status' });
  }

  const sql = 'UPDATE module_discussions SET status = ? WHERE id = ?';

  db.query(sql, [status, discussionId], (err, result) => {
    if (err) {
      console.error('Error updating discussion status:', err);
      return res.status(500).json({ success: false, message: 'Failed to update status' });
    }

    getIO().to(`discussion_${discussionId}`).emit('statusUpdated', { discussion_id: discussionId, status });

    res.json({ success: true, message: 'Status updated successfully' });
  });
};

// Toggle pin status
exports.togglePin = (req, res) => {
  const { discussionId } = req.params;

  const sql = 'UPDATE module_discussions SET is_pinned = NOT is_pinned WHERE id = ?';

  db.query(sql, [discussionId], (err, result) => {
    if (err) {
      console.error('Error toggling pin:', err);
      return res.status(500).json({ success: false, message: 'Failed to toggle pin' });
    }

    // Get updated pin status
    const getStatusSql = 'SELECT is_pinned FROM module_discussions WHERE id = ?';
    db.query(getStatusSql, [discussionId], (statusErr, statusResult) => {
      const isPinned = statusResult[0]?.is_pinned || 0;
      
      getIO().emit('discussionPinned', { discussion_id: discussionId, is_pinned: isPinned });

      res.json({ success: true, message: 'Pin status updated', is_pinned: isPinned });
    });
  });
};

exports.draftDocument = async (req, res) => {
  const { maindraft_name, userId, user_name } = req.body;

  if (!maindraft_name || !userId) {
    return res.status(400).json({ error: 'Topic and userId are required' });
  }

  if (!req.file) {
    return res.status(400).json({ error: 'No file uploaded' });
  }

  let awsSecrets, s3Client;

  try {
    awsSecrets = await getAwsSecrets();

    s3Client = new S3Client({
      region: awsSecrets.region,
      credentials: {
        accessKeyId: awsSecrets.accessKeyId,
        secretAccessKey: awsSecrets.secretAccessKey,
      },
    });

    const fileKey = `documents/${Date.now()}_${req.file.originalname}`;
    const params = {
      Bucket: awsSecrets.bucket,
      Key: fileKey,
      Body: req.file.buffer,
      ContentType: req.file.mimetype,
    };

    await s3Client.send(new PutObjectCommand(params));


    // ✅ Save to DB
    const sqlQuery = `
      INSERT INTO Legaldraftpdf (user_id,user_name, maindraft_name, file_path, status, upload_date)
      VALUES (?, ?, ?, ?, 'pending', NOW())
    `;
    const values = [userId,user_name, maindraft_name,  fileKey];

    db.query(sqlQuery, values, (err, results) => {
      if (err) {
        return res.status(500).json({ error: err.message });
      }

      res.status(201).json({
        message: 'Document uploaded successfully',
      });
    });

  } catch (err) {
    console.error('Upload error:', err);
    return res.status(500).json({ error: 'Upload failed: ' + err.message });
  }
};


exports.getpadDocuments = async (req, res) => {
  const { userId } = req.params;

  try {
    // ✅ Get AWS credentials
    const awsSecrets = await getAwsSecrets();

    const sqlQuery = `
      SELECT id, maindraft_name, file_path, status, comments, upload_date, credits
      FROM Legaldraftpdf
      WHERE user_id = ?
      ORDER BY upload_date DESC
    `;

    db.query(sqlQuery, [userId], (err, results) => {
      if (err) return res.status(500).json({ error: err.message });

      // ✅ Calculate total credits
      const totalCredits = results.reduce((sum, doc) => sum + (doc.credits || 0), 0);

      // ✅ Build full S3 URL for each document
      const documentsWithUrls = results.map(doc => ({
        id: doc.id,
        topic: doc.maindraft_name,
        file_name: doc.file_path.split('/').pop(),
        file_path: `https://${awsSecrets.bucket}.s3.${awsSecrets.region}.amazonaws.com/${doc.file_path}`,
        status: doc.status,
        comments: doc.comments,
        created_at: doc.upload_date,
        credits: doc.credits
      }));

      res.status(200).json({
        message: 'Documents fetched successfully',
        total: documentsWithUrls.length,
        totalCredits: totalCredits, // ✅ Total credits earned
        data: documentsWithUrls
      });
    });

  } catch (error) {
    console.error('Error fetching documents:', error);
    return res.status(500).json({ error: 'Failed to fetch documents' });
  }
};

exports.getAllDocuments = async (req, res) => {

  try {
    const awsSecrets = await getAwsSecrets();

    const sqlQuery = `
      SELECT id,user_name, maindraft_name, file_path, status, comments, upload_date, credits
      FROM Legaldraftpdf      
      ORDER BY upload_date DESC
    `;

    db.query(sqlQuery,  (err, results) => {
      if (err) return res.status(500).json({ error: err.message });

      const documentsWithUrls = results.map(doc => ({
        id: doc.id,
        username:doc.user_name,
        topic: doc.maindraft_name,
        file_name: doc.file_path.split('/').pop(),
        file_path: `https://${awsSecrets.bucket}.s3.${awsSecrets.region}.amazonaws.com/${doc.file_path}`,
        status: doc.status,
        comments: doc.comments,
        created_at: doc.upload_date,
        credits: doc.credits
      }));

      res.status(200).json({
        message: 'Documents fetched successfully',
        total: documentsWithUrls.length,
        data: documentsWithUrls
      });
    });

  } catch (error) {
    console.error('Error fetching documents:', error);
    return res.status(500).json({ error: 'Failed to fetch documents' });
  }
};

exports.updateDocumentStatus = async (req, res) => {
  const { id, status, comments, credits } = req.body;

  if (!id || !status) {
    return res.status(400).json({ error: 'Document ID and status are required' });
  }

  if (!['approved', 'rejected'].includes(status)) {
    return res.status(400).json({ error: 'Invalid status. Must be "approved" or "rejected"' });
  }

  try {
    let sqlQuery;
    let values;

    if (status === 'approved') {
      sqlQuery = `
        UPDATE Legaldraftpdf 
        SET status = ?, credits = ?, comments = ?, updated_at = NOW()
        WHERE id = ?
      `;
      values = [status, credits || 0, comments || 'Approved', id];
    } else {
      sqlQuery = `
        UPDATE Legaldraftpdf 
        SET status = ?, comments = ?, updated_at = NOW()
        WHERE id = ?
      `;
      values = [status, comments || 'Declined', id];
    }

    db.query(sqlQuery, values, async (err, results) => {
      if (err) {
        return res.status(500).json({ error: err.message });
      }

      if (results.affectedRows === 0) {
        return res.status(404).json({ message: 'Document not found' });
      }

      if (status === 'approved' && credits > 0) {
        db.query('SELECT user_id FROM Legaldraftpdf WHERE id = ?', [id], (err, docResults) => {
          if (err) {
            console.error('Error fetching user_id:', err);
            return res.status(200).json({ message: 'Document updated but failed to update credits' });
          }

          if (docResults.length > 0) {
            const userId = docResults[0].user_id;

            db.query(
              'UPDATE Admins SET refearn = refearn + ? WHERE id = ?',
              [credits, userId],
              (err) => {
                if (err) {
                  console.error('Error updating refearn:', err);
                }
              }
            );
          }
        });
      }

      res.status(200).json({
        message: `Document ${status} successfully`,
        data: {
          id,
          status,
          credits: status === 'approved' ? credits : 0,
          comments
        }
      });
    });

  } catch (error) {
    console.error('Error updating document:', error);
    return res.status(500).json({ error: 'Failed to update document status' });
  }
};




exports.getUserListchat = (req, res) => {
  const query = 'SELECT id, username, mobile_no, cals, activeplan, created_at FROM chatsignup WHERE activeplan = 1  ORDER BY id DESC';
  db.query(query, (err, results) => {
    if (err) {
      console.error('Error fetching user list:', err);
      res.status(500).json({ error: 'Internal Server Error' });
      return;
    }
   res.json(results);
  });
};3