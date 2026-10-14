
const express = require('express');
const adminController = require('../controllers/adminController');
const router = express.Router();
const { getPool } = require('../database/db');
const db = getPool();
const bcrypt = require('bcrypt');
const multer = require("multer");
const storage = multer.memoryStorage();
const upload = multer({ storage });
const { sendEmail } = require("../middleware/sentmail");


router.get('/userstatus', adminController.getUsersByStatus);
router.get('/users', adminController.getUserCount);
router.get('/newusers', adminController.getNewUsers);
router.get('/userlist', adminController.getUserList);
router.get('/userlistchat', adminController.getUserListchat);
router.get('/monthlypichart', adminController.getRevenueByStatus);
router.get('/Paymenttransaction', adminController.getPaymenttransaction);
router.get('/Paytransaction', adminController.Paytransaction);
router.get('/sentotpmailadmin', adminController.sendotpsmailadmin);
router.get('/verifypasswordadmin', adminController.verifypasswordadmin);
router.post('/subfilter', adminController.Exportuserlist );
router.post('/calscertificate', adminController.Certificate);
router.get('/user-reports', adminController.getUserReports);
router.delete('/user-reports/:id', adminController.deleteUserReport);
router.post('/add_legal_draft', adminController.newdraft );
router.get('/legal_draft_pricing', adminController.drafts );
router.put('/legal_draft_pricing/:id', adminController.updatedrafts );
router.get('/trainew', adminController.getPaymenttrail);
router.post('/activedeal', adminController.activedeal);
router.get('/getActiveDeal', adminController.getActiveDeal);
router.delete('/deletedraft/:id', adminController.deletedraft);

router.post('/discussions', adminController.createDiscussion);
router.get('/discussions/:discussionId/:user_id/replies',adminController.getDiscussionReplies);
router.get('/discussions/:module_id/:user_id', adminController.getModuleDiscussions);
router.post('/discussions/:discussionId/:user_id/reply', adminController.replyToDiscussion);
router.get('/discussions', adminController.getAllDiscussions);
router.get('/discussions/unread', adminController.getUnreadDiscussions);
router.post('/discussions/:discussionId/reply', adminController.adminReply);
router.put('/discussions/:discussionId/status', adminController.updateDiscussionStatus);

router.post('/upload', upload.single("legalpdf"), adminController.draftDocument);
router.get('/getpadDocuments/:userId', adminController.getpadDocuments);
router.get('/getAllDocuments', adminController.getAllDocuments);
router.put('/updateDocumentStatus', adminController.updateDocumentStatus);
router.get('/total-amount', async (req, res) => {
    const sqlQuery = 'SELECT SUM(amount_in_paise) as total_amount FROM transactions';
    db.query(sqlQuery, (err, results) => {
        if (err) {
            return res.status(500).json({ error: err.message });
        }
        const totalAmount = results[0]?.total_amount || 0  ;
        let totalamt =totalAmount  / 100; 
        res.status(200).json({ total_amount: totalamt });
    });
});

router.get('/monthly-revenue', async (req, res) => {
    const sqlQuery = `
       SELECT SUM(amount_in_paise) as monthly_revenue 
        FROM transactions 
        WHERE MONTH(created_at) = MONTH(NOW()) 
          AND YEAR(created_at) = YEAR(NOW());
    `;
    db.query(sqlQuery, (err, results) => {
        if (err) {
            return res.status(500).json({ error: err.message });
        }
        const monthlyRevenue = results[0]?.monthly_revenue || 0;
        const revenueInRupees = monthlyRevenue / 100;
        res.status(200).json({ monthly_revenue: revenueInRupees });
    });
});


router.get('/getadminemployee', (req, res) => {
    const sqlQuery = `
        SELECT 
            id,
            username,
            mobile_no,
            email,
            role,
            referral_code,
            created_at
        FROM Admins
        WHERE role IN ('staff', 'intern')
    `;

    db.query(sqlQuery, (err, results) => {
        if (err) {
            return res.status(500).json({ error: err.message });
        }

        if (results.length === 0) {
            return res.status(404).json({ message: 'No employees found' });
        }

        res.status(200).json({
            message: 'Employees fetched successfully',
            total: results.length,
            data: results
        });
    });
});


router.get('/myreferrals/:referral_code', async (req, res) => {
    const { referral_code } = req.params;

    try {
        if (!referral_code) {
            return res.status(400).json({ 
                success: false,
                error: 'Referral code is required' 
            });
        }

        const sqlQuery = `
            SELECT 
                c.id,
                c.username,
                c.mobile_no,
                c.role,
                s.refearn,
                s.user_id,
                s.plan_name,
                s.created_at as subscription_date
            FROM chatsignup c
            INNER JOIN subscriptions s ON c.id = s.user_id
            WHERE c.referral_code = ? AND s.refearn = 1
            ORDER BY s.created_at DESC
            LIMIT 1
        `;

        const [results] = await db.promise().query(sqlQuery, [referral_code]);

        if (results.length === 0) {
            return res.status(404).json({ 
                success: false,
                message: 'No referrals found for this code' 
            });
        }

        res.status(200).json({
            success: true,
            message: 'Referrals fetched successfully',
            total: results.length,
            data: results
        });
    } catch (error) {
        console.error('Error fetching referrals:', error);
        res.status(500).json({ 
            success: false,
            error: error.message 
        });
    }
});

router.get('/myreferralsview/:referral_code', (req, res) => {
    const { referral_code } = req.params;

    if (!referral_code) {
        return res.status(400).json({ error: 'Referral code is required' });
    }

    const referralsQuery = `
        SELECT id, username, email, mobile_no, role, referral_code, created_at
        FROM chatsignup
        WHERE referral_code = ?
        ORDER BY created_at DESC
    `;

    db.query(referralsQuery, [referral_code], (err, referralResults) => {
        if (err) {
            return res.status(500).json({ error: err.message });
        }

        if (referralResults.length === 0) {
            return res.status(404).json({ message: 'No referrals found' });
        }

        const statsQuery = `
            SELECT 
                COUNT(DISTINCT s.user_id) as paid_users_count,
                SUM(s.taxed_amount_in_paise) as total_amount_paise
            FROM subscriptions s
            INNER JOIN chatsignup c ON s.user_id = c.id
            WHERE c.referral_code = ? AND s.refearn = 1
        `;

        db.query(statsQuery, [referral_code], (err, statsResults) => {
            if (err) {
                return res.status(500).json({ error: err.message });
            }

            const stats = statsResults[0];
            
            let totalAmountRupees = '0.00';
            if (stats.total_amount_paise) {
                const totalWithGST = stats.total_amount_paise / 100; 
                const amountWithoutGST = totalWithGST / 1.18; 
                totalAmountRupees = amountWithoutGST.toFixed(2);
            }

            res.status(200).json({
                message: 'Referrals fetched successfully',
                referrals: referralResults,
                totalRegistrations: referralResults.length,
                totalRegistrationValue: totalAmountRupees 
            });
        });
    });
});


router.post('/adminemployee', async (req, res) => {
    const { name, role, email, mobile_no, password } = req.body;

    if (!name || !role || !email || !mobile_no || !password) {
        return res.status(400).json({ error: 'All fields are required' });
    }

    const roleScreens = {
        staff: ["Subscription", "trail-subscribtion", "user-list", "setting","myreferrals"],
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
            bcrypt.hash(password, 10),
            getUniqueReferralCode()
        ]);

        const screensJson = JSON.stringify(screens);

        const sqlQuery = `
            INSERT INTO Admins (username, mobile_no, email, pass_word, screens, role, referral_code)
            VALUES (?, ?, ?, ?, ?, ?, ?)
        `;

        db.query(sqlQuery, [name, mobile_no, email, hashedPassword, screensJson, role, referralCode], async (err, results) => {
            if (err) {
                return res.status(500).json({ error: err.message });
            }

            // ✅ Email sent only after successful DB insert
            try {
                await sendEmail(email, {
                    template: "crd_template",
                    name,
                    email,
                    password,
                });
            } catch (emailErr) {
                // Insert succeeded, so still return 201 — but log the email failure
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


module.exports = router;
