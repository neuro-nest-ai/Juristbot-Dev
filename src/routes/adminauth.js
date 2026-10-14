
const express = require('express');
const adminController = require('../controllers/adminController');
const router = express.Router(); 
const { getPool } = require('../database/db');
const db = getPool();
const bcrypt = require('bcrypt');
const { sendEmail } = require("../middleware/sentmail");
const sendWhatsAppTemplatotp = require("../watemplate/otpverify");
const crypto = require('crypto');
router.post('/adminuser', adminController.createAdmin);
router.post('/adminlogin', adminController.adminLogin);
router.put('/adminsupdate', adminController.updateAdmin);
router.post('/sentotpmailadmin', adminController.sendotpsmailadmin);
router.post('/verifypasswordadmin', adminController.verifypasswordadmin);



function generateOtp() {
  const otp = crypto.randomInt(100000, 1000000);
  return otp.toString();
}

router.post('/adminemployeereg', async (req, res) => {

    const { username,  email, mobile_no, pass_word } = req.body;

    if (!username || !email || !mobile_no || !pass_word) {
        return res.status(400).json({ error: 'All fields are required' });
    }

    const role = "intern";

    const roleScreens = {
        intern: ["documents", "myreferrals"]
    };

    const screens = roleScreens[role.toLowerCase()] || [];

    if (screens.length === 0) {
        return res.status(400).json({ error: 'Invalid role provided' });
    }

    const generateReferralCode = () => Math.floor(10000 + Math.random() * 90000).toString();

    const getUniqueReferralCode = () => new Promise((resolve, reject) => {
        const tryCode = (code) => {
            db.query('SELECT referral_code FROM Admins WHERE referral_code = ?', [code], (err, results) => {
                if (err) return reject(err);
                if (results.length === 0) return resolve(code);
                tryCode(generateReferralCode()); 
            });
        };
        tryCode(generateReferralCode());
    });

    try {
        const [hashedPassword, referralCode] = await Promise.all([
            bcrypt.hash(pass_word, 10),
            getUniqueReferralCode()
        ]);
        const otp = generateOtp();
        const screensJson = JSON.stringify(screens);

        const sqlQuery = `
            INSERT INTO Admins (username, mobile_no, email, pass_word, screens, role, referral_code, otp)
            VALUES (?, ?, ?, ?, ?, ?, ?, ?)
        `;

        db.query(sqlQuery, [username, mobile_no, email, hashedPassword, screensJson, role, referralCode, otp], async (err, results) => {
            if (err) {
                return res.status(500).json({ error: err.message });
            }
            try {

                 await sendEmail(email, {
                    template: "otp_template",
                    otp: otp,
                    username: username,
                });             
                await sendWhatsAppTemplatotp({ mobile_no, otp });
                await sendEmail(email, { template: "interncrd_template", username: username });
            } catch (emailErr) {
                console.error('Email sending failed:', emailErr.message);
                return res.status(201).json({
                    message: 'Admin employee created successfully, but email failed to send.',
                    data: { id: results.insertId }
                });
            }

            res.status(201).json({
                message: 'Admin employee created successfully',
                data: { id: results.insertId }
            });
        });

    } catch (err) {
        return res.status(500).json({ error: 'Setup failed: ' + err.message });
    }
});

router.post('/verifyotp', async (req, res) => {

    const {email, otp } = req.body;

    if (!email || !otp) {
        return res.status(400).json({ error: 'Email and OTP are required' });
    }

    const query = 'SELECT * FROM Admins WHERE email = ? AND otp = ?';
    db.query(query, [email, otp], async (err, results) => {
        if (err) {
            return res.status(500).json({ error: err.message });
        }
        if (results.length === 0) {
            return res.status(400).json({ error: 'Invalid email or OTP' });
        }

        const updateQuery = 'UPDATE Admins SET verify_otp = 1 WHERE email = ? AND otp = ?';
        db.query(updateQuery, [email, otp], (err, result) => {
            if (err) {
                return res.status(500).json({ error: err.message });
            }
            res.json({ message: 'OTP verified successfully' });
        });
    }); 

});

module.exports = router;