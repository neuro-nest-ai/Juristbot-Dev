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




router.delete('/Scenario_history/:session_id', async (req, res) => {
  const { session_id } = req.params;
  try {
    const db = await connectToMongo();
    const result = await db.collection('Scenario_history').deleteOne({ session_id });
    if (result.deletedCount > 0) {
      res.json({ message: 'Document deleted successfully' });
    } else {
      res.status(404).json({ error: 'Document not found' });
    }
  } catch (err) {
    console.error('Error deleting document:', err.message);
    res.status(500).json({ error: 'An internal server error occurred' });
  }
});

router.delete('/Draft_history/:session_id', async (req, res) => {
  const { session_id } = req.params;
  try {
    const db = await connectToMongo();
    const result = await db.collection('Draft_history').deleteOne({ session_id });
    if (result.deletedCount > 0) {
      res.json({ message: 'Document deleted successfully' });
    } else {
      res.status(404).json({ error: 'Document not found' });
    }
  } catch (err) {
    console.error('Error deleting document:', err.message);
    res.status(500).json({ error: 'An internal server error occurred' });
  }
});

router.delete('/Crossquestions_history/:session_id', async (req, res) => {
  const { session_id } = req.params;
  try {
    const db = await connectToMongo();
    const result = await db.collection('Crossquestions_history').deleteOne({ session_id });
    if (result.deletedCount > 0) {
      res.json({ message: 'Document deleted successfully' });
    } else {
      res.status(404).json({ error: 'Document not found' });
    }
  } catch (err) {
    console.error('Error deleting document:', err.message);
    res.status(500).json({ error: 'An internal server error occurred' });
  }
});

router.delete('/Relevant_judgements/:session_id', async (req, res) => {
  const { session_id } = req.params;
  try {
    const db = await connectToMongo();
    const result = await db.collection('Relevant_judgements').deleteOne({ session_id });
    if (result.deletedCount > 0) {
      res.json({ message: 'Document deleted successfully' });
    } else {
      res.status(404).json({ error: 'Document not found' });
    }
  } catch (err) {
    console.error('Error deleting document:', err.message);
    res.status(500).json({ error: 'An internal server error occurred' });
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




router.get('/commonhistory/:user_id', async (req, res) => {
  const { user_id } = req.params;
  const limit = parseInt(req.query.limit) || 20;
  const skip = parseInt(req.query.skip) || 0;

  try {
    const db = await connectToMongo();

    const total = await db.collection('chat_history').countDocuments({ user_id: user_id });

    const results = await db.collection('chat_history')
      .find(
        { user_id: user_id },
        { projection: { _id: 1, session_id: 1, user_id: 1, title: 1, Date: 1 } } // only these fields
      )
      .sort({ Date: -1 })
      .skip(skip)
      .limit(limit)
      .toArray();

    if (results.length > 0) {
      res.json({
        data: results,
        total,
        hasMore: skip + results.length < total,
      });
    } else {
      res.status(404).json({ error: 'Documents not found', data: [], total: 0, hasMore: false });
    }
  } catch (err) {
    console.error('Error fetching documents:', err);
    res.status(500).json({ error: 'An error occurred' });
  }
});

router.get('/historytest/:session_id', async (req, res) => {
  const { session_id } = req.params;
  try {
    const db = await connectToMongo();
    const result = await db.collection('chat_history').findOne({ session_id });
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


router.delete('/commonhistorydelete/:session_id', async (req, res) => {
  const { session_id } = req.params;
  try {
    const db = await connectToMongo();
    const result = await db.collection('chat_history').deleteOne({ session_id });
    if (result.deletedCount > 0) {
      res.json({ message: 'Document deleted successfully' });
    } else {
      res.status(404).json({ error: 'Document not found' });
    }
  } catch (err) {
    console.error('Error deleting document:', err.message);
    res.status(500).json({ error: 'An internal server error occurred' });
  }
});

module.exports = router;
