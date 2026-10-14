const express = require('express');
const router = express.Router();
const { connectToMongo } = require('../database/mongodb');

// Parses "DD.MM.YYYY" into a JS Date at UTC midnight
function parseSingleDate(dateStr) {
  const [day, month, year] = dateStr.split('.');
  return new Date(`${year}-${month}-${day}T00:00:00.000Z`);
}

// Given either a single date or a start/end pair (all "DD.MM.YYYY" strings),
// returns { start, end } as JS Dates, where end is exclusive (start of next day).
function resolveRange({ date, startDate, endDate }) {
  if (startDate && endDate) {
    const start = parseSingleDate(startDate);
    const end = parseSingleDate(endDate);
    end.setDate(end.getDate() + 1); // make end exclusive
    return { start, end };
  }
  if (date) {
    const start = parseSingleDate(date);
    const end = new Date(start);
    end.setDate(end.getDate() + 1);
    return { start, end };
  }
  return null;
}

// Handles Date field stored as either a string or a native BSON Date,
// and never throws on malformed values.
function safeDateField() {
  return {
    $addFields: {
      dateField: {
        $cond: {
          if: { $eq: [{ $type: "$Date" }, "string"] },
          then: {
            $dateFromString: { dateString: "$Date", onError: null, onNull: null }
          },
          else: "$Date"
        }
      }
    }
  };
}

// Centralized error handler
function handleError(routeLabel, error, res) {
  console.error(`Error in ${routeLabel}:`, error.message, error.codeName ? `(codeName: ${error.codeName})` : '');
  const isProd = process.env.NODE_ENV === 'production';
  res.status(500).json({
    error: 'Internal server error',
    ...(isProd ? {} : { details: error.message })
  });
}

// Generic helper: runs the "unique active users" aggregation
// against a given collection/field name for a resolved date range.
async function countUniqueUsers(collectionName, projectField, start, end) {
  const db = await connectToMongo();

  const result = await db.collection(collectionName).aggregate([
    safeDateField(),
    { $match: { dateField: { $gte: start, $lt: end } } },
    { $group: { _id: null, uniqueUsers: { $addToSet: "$user_id" } } },
    { $project: { [projectField]: { $size: "$uniqueUsers" }, _id: 0 } }
  ]).toArray();

  return result[0]?.[projectField] || 0;
}

// Validates the request body and returns a resolved { start, end } range,
// or sends a 400 response and returns null if the input is invalid.
function getValidatedRange(req, res) {
  const { date, startDate, endDate } = req.body;

  if (!date && !(startDate && endDate)) {
    res.status(400).json({
      error: 'Provide either "date" (DD.MM.YYYY) or both "startDate" and "endDate" (DD.MM.YYYY)'
    });
    return null;
  }

  const range = resolveRange({ date, startDate, endDate });
  if (!range) {
    res.status(400).json({ error: 'Invalid date input' });
    return null;
  }
  return range;
}

// Active Users (single collection: chat_history)
router.post('/active-userscout', async (req, res) => {
  try {
    const range = getValidatedRange(req, res);
    if (!range) return;

    const Chat_historycount = await countUniqueUsers(
      'chat_history',
      'Chat_historycount',
      range.start,
      range.end
    );

    res.status(200).json({ ...req.body, Chat_historycount });
  } catch (error) {
    handleError('active-users', error, res);
  }
});

module.exports = router;