const express = require('express');
const router = express.Router();
const { connectToMongo } = require('../database/mongodb');
const { S3Client, GetObjectCommand } = require('@aws-sdk/client-s3');
const { getSignedUrl } = require('@aws-sdk/s3-request-presigner');
const { getAwsSecrets } = require('../utils/razorpayvalut');

const URL_EXPIRES_IN = 60 * 60; // 1 hour (seconds)


let s3Promise = null;

function getS3() {
  if (!s3Promise) {
    s3Promise = (async () => {
      const secrets = await getAwsSecrets();
      const client = new S3Client({
        region: secrets.region,
        credentials: {
          accessKeyId: secrets.accessKeyId,
          secretAccessKey: secrets.secretAccessKey,
        },
      });
      console.log('✅ AWS S3 Client (v3) initialized');
      return { client, secrets };
    })().catch((err) => {
      s3Promise = null; 
      throw err;
    });
  }
  return s3Promise;
}


async function getViewUrl(doc) {
  if (!doc.s3_key) return null;
  try {
    const { client, secrets } = await getS3();
    const filename = doc.filename || 'file';

    const command = new GetObjectCommand({
      Bucket: doc.s3_bucket || secrets.bucket,
      Key: doc.s3_key.trim(),
      ResponseContentDisposition: `inline; filename*=UTF-8''${encodeURIComponent(filename)}`,
      ...(doc.mime_type && { ResponseContentType: doc.mime_type }),
    });

    return await getSignedUrl(client, command, { expiresIn: URL_EXPIRES_IN });
  } catch (err) {
    console.error(`Presign error for ${doc.s3_key}:`, err.message);
    return null;
  }
}


router.get('/document/:user_id', async (req, res) => {
  const { user_id } = req.params;
  const page = parseInt(req.query.page, 10);
  const limit = parseInt(req.query.limit, 10);
  if (!Number.isInteger(page) || page < 1 || !Number.isInteger(limit) || limit < 1) {
    return res.status(400).json({ error: 'Valid page and limit query params are required' });
  }
  const skip = (page - 1) * limit;
  const filter = { user_id: String(user_id) };

  try {
    const db = await connectToMongo();
    const collection = db.collection('document_ledger');

    const [total, docs] = await Promise.all([
      collection.countDocuments(filter),
      collection
        .find(filter, {
          projection: {
            _id: 1,
            document_id: 1,
            session_id: 1,
            filename: 1,
            mime_type: 1,
            size_bytes: 1,
            uploaded_at: 1,
            upload_date: 1,
            s3_key: 1,
            s3_bucket: 1,
          },
        })
        .sort({ uploaded_at: -1, _id: -1 })
        .skip(skip)
        .limit(limit)
        .toArray(),
    ]);

    const data = await Promise.all(
      docs.map(async ({ s3_key, s3_bucket, ...rest }) => ({
        ...rest,
        view_url: await getViewUrl({ ...rest, s3_key, s3_bucket }),
      }))
    );

    const totalPages = Math.max(1, Math.ceil(total / limit));

    res.json({
      data,
      pagination: {
        page,
        limit,
        total,
        totalPages,
        hasNext: page < totalPages,
        hasPrev: page > 1,
      },
      url_expires_in: URL_EXPIRES_IN,
    });
  } catch (err) {
    console.error('Error fetching documents:', err);
    res.status(500).json({ error: 'An error occurred' });
  }
});

module.exports = router;