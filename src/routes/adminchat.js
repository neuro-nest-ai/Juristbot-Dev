const express = require('express');
const router = express.Router();
const { connectToMongo } = require('../database/mongodb'); 


router.get('/Scenario_history/:user_id', async (req, res) => {
  const { user_id } = req.params;
  try {
    const db = await connectToMongo(); 
    const results = await db.collection('Scenario_history')
      .find({ user_id: user_id })
      .sort({ Date: -1 }) // Sort by created_at in descending order (latest first)
      .toArray(); 

    if (results.length > 0) {
      res.json(results);
    } else {
      res.status(404).json({ error: 'Documents not found' }); 
    }
  } catch (err) {
    console.error('Error fetching documents:', err); 
    res.status(500).json({ error: 'An error occurred' }); 
  }
});


router.get('/Draft_history/:user_id', async (req, res) => {
  const { user_id } = req.params;
  try {
    const db = await connectToMongo(); 
    const results = await db.collection('Draft_history')
      .find({ user_id: user_id })
      .sort({ Date: -1 }) // Sort by created_at in descending order (latest first)
      .toArray(); 

    if (results.length > 0) {
      res.json(results);
    } else {
      res.status(404).json({ error: 'Documents not found' }); 
    } 
  } catch (err) {
    console.error('Error fetching documents:', err); 
    res.status(500).json({ error: 'An error occurred' }); 
  }
});


router.get('/Crossquestions_history/:user_id', async (req, res) => {
  const { user_id } = req.params;
  try {
    const db = await connectToMongo(); 
    const results = await db.collection('Crossquestions_history')
      .find({ user_id: user_id })
      .sort({ Date: -1 }) // Sort by created_at in descending order (latest first)
      .toArray(); 

    if (results.length > 0) {
      res.json(results);
    } else {
      res.status(404).json({ error: 'Documents not found' }); 
    }     
  } catch (err) {
    console.error('Error fetching documents:', err); 
    res.status(500).json({ error: 'An error occurred' }); 
  }
});

router.get('/Relevant_judgements/:user_id', async (req, res) => {
  const { user_id } = req.params;
  try {
    const db = await connectToMongo(); 
    const results = await db.collection('Relevant_judgements')
      .find({ user_id: user_id })
      .sort({ Date: -1 }) // Sort by created_at in descending order (latest first)
      .toArray(); 

    if (results.length > 0) {
      res.json(results);
    } else {
      res.status(404).json({ error: 'Documents not found' }); 
    }     
  } catch (err) {
    console.error('Error fetching documents:', err); 
    res.status(500).json({ error: 'An error occurred' }); 
  }
});


router.get('/S-history/:session_id', async (req, res) => {
  const { session_id } = req.params;
  try {
    const db = await connectToMongo();
    const result = await db.collection('Scenario_history').findOne({ session_id });
    if (result) {
      res.status(200).json(result);
    } else {
      res.status(404).json({ error: 'Session history not found' });
    }
  } catch (err) {
    console.error('Error fetching session history:', err.message);
    res.status(500).json({ error: 'An internal server error occurred' });
  }
});
router.get('/L-history/:session_id', async (req, res) => {
  const { session_id } = req.params;
  try {
    const db = await connectToMongo();
    const result = await db.collection('Draft_history').findOne({ session_id });
    if (result) {
      res.status(200).json(result);
    } else {
      res.status(404).json({ error: 'Session history not found' });
    }
  } catch (err) {
    console.error('Error fetching session history:', err.message);
    res.status(500).json({ error: 'An internal server error occurred' });
  }
});
router.get('/C-history/:session_id', async (req, res) => {
  const { session_id } = req.params;
  try {
    const db = await connectToMongo();
    const result = await db.collection('Crossquestions_history').findOne({ session_id });
    if (result) {
      res.status(200).json(result);
    } else {
      res.status(404).json({ error: 'Session history not found' });
    }
  } catch (err) {
    console.error('Error fetching session history:', err.message);
    res.status(500).json({ error: 'An internal server error occurred' });
  }
});
router.get('/R-history/:session_id', async (req, res) => {
  const { session_id } = req.params;
  try {
    const db = await connectToMongo();
    const result = await db.collection('Relevant_judgements').findOne({ session_id });
    if (result) {
      res.status(200).json(result);
    } else {
      res.status(404).json({ error: 'Session history not found' });
    }
  } catch (err) {
    console.error('Error fetching session history:', err.message);
    res.status(500).json({ error: 'An internal server error occurred' });
  }
});

router.get('/commonhistory', async (req, res) => {
  try {
    const db = await connectToMongo();
    const result = await db
      .collection('chat_history')
      .find()
      .sort({ Date: -1 })   // latest chat முதல்ல
      .toArray();

    res.status(200).json(result);   // காலியா இருந்தாலும் [] return ஆகும்
  } catch (err) {
    console.error('Error fetching session history:', err.message);
    res.status(500).json({ error: 'An internal server error occurred' });
  }
});

router.get('/feedback', async (req, res) => {
  try {
    const db = await connectToMongo();
    const result = await db
      .collection('feedback')
      .find({ rating: -1 })
      .sort({ created_at: -1 })
      .toArray();

    res.status(200).json(result);
  } catch (err) {
    console.error('Error fetching feedback history:', err.message);
    res.status(500).json({ error: 'An internal server error occurred' });
  }
});

module.exports = router;
