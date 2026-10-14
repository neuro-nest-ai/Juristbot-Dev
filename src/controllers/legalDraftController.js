const path = require('path');
const { getPool } = require('../database/db');

const uploadDirectory = path.join(__dirname, '../../uploads/');

 exports.uploadFile = async (req, res) => {
  const { file,userName, maindraft_name, subdraft_name, user_id } = req.body;
  console.log(file,userName, maindraft_name, subdraft_name, user_id)
 
  const query = 'INSERT INTO Legaldraftpdf (user_name, maindraft_name, subdraft_name, file_path, user_id) VALUES (?, ?, ?, ?, ?)';
  const db = getPool();
  
  db.query(query, [userName, maindraft_name, subdraft_name, file, user_id], (err, result) => {
    if (err) return res.status(500).json({ error: err.message });
    res.status(200).json({ message: 'File uploaded successfully', file });
  });
};

// Get all uploads
 exports.getUploads = async (req, res) => {
  const query = `SELECT id, user_name, maindraft_name, subdraft_name, file_path, DATE_FORMAT(upload_date, '%Y-%m-%d') AS upload_date, user_id FROM Legaldraftpdf WHERE satus IS NULL`;
  const db = getPool();
  
  db.query(query, (err, results) => {
    if (err) return res.status(500).json({ error: err.message });
    res.status(200).json(results);
  });
};

// View file by filename
 exports.viewFile = async (req, res) => {
  const filePath = path.join(uploadDirectory, req.params.fileName);
  res.sendFile(filePath, (err) => {
    if (err) return res.status(500).json({ error: err.message });
  });
};


exports.updateUploadStatus = async (req, res) => {
  const { satus, user_id } = req.body;
  const { file_path } = req.params;
  const db = getPool();
  
  const updateQuery = 'UPDATE Legaldraftpdf SET satus = ? WHERE file_path = ?';
  
  db.query(updateQuery, [satus, file_path], (err) => {
    if (err) return res.status(500).json({ error: err.message });

    if (satus === 'Accepted') {
      db.query('CALL update_or_insert_coupon(?, 100);', [user_id], (walletErr) => {
        if (walletErr) return res.status(500).json({ error: walletErr.message });
        res.status(200).json({ message: 'Status updated and coupon added' });
      });
    } else {
      res.status(200).json({ message: 'Status updated successfully' });
    }
  });
};

// Get wallet by user_id
exports.getWallet = (req, res) => {
    
  const query = 'SELECT coupon_amt FROM wallet WHERE user_id = ?';
  const db = getPool();
  
  db.query(query, [req.params.user_id], (err, results) => {
    if (err) return res.status(500).send('Server error');
    if (results.length > 0) res.json(results[0]);
    else res.status(404).send('Wallet data not found');
  });
};

// Get status by user_id
exports.getStatusByUser = (req, res) => {
  const query = `SELECT id, user_id, user_name, maindraft_name, subdraft_name, satus FROM Legaldraftpdf WHERE satus IN ('rejected', 'accepted') AND user_id = ?`;
  const db = getPool();
  
  db.query(query, [req.params.user_id], (error, results) => {
    if (error) return res.status(500).json({ error: 'Error fetching data' });
    res.json(results);
  });
};

// Get accepted uploads
exports.getAcceptedUploads = (req, res) => {
  const query = `SELECT id, maindraft_name, subdraft_name, file_path, satus, user_id FROM Legaldraftpdf WHERE satus = 'accepted'`;
  const db = getPool();
  
  db.query(query, (err, results) => {
    if (err) return res.status(500).json({ error: err.message });
    res.status(200).json(results);
  });
};



