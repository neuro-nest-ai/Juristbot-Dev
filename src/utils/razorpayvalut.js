const Razorpay = require('razorpay');
const { getSecret } = require('../database/valut');
require('dotenv').config();

let razorpayInstance = null;
let razorpaySecretCache = null;
let awsSecretCache = null;

async function getRazorpay() {
  if (razorpayInstance) return razorpayInstance;
  const secret = await getSecret(process.env.RAZORPAY_KEY);
  razorpayInstance = new Razorpay({
    key_id: secret.RAZORPAY_KEY_ID,
    key_secret: secret.RAZORPAY_KEY_SECRET
  });
  return razorpayInstance;
}
async function getRazorpaySecretKey() {
    if (razorpaySecretCache) return razorpaySecretCache;
  
    const secret = await getSecret(process.env.RAZORPAY_KEY);
    razorpaySecretCache = secret.RAZORPAY_KEY_SECRET;
  
    return razorpaySecretCache;
  }

  async function getAwsSecrets() {
    if (awsSecretCache) return awsSecretCache;
  
    const secret = await getSecret(process.env.AWS_KEY);
    awsSecretCache = {
      accessKeyId: secret.AWS_ACCESS_KEY_ID,
      secretAccessKey: secret.AWS_SECRET_ACCESS_KEY,
      region: secret.AWS_DEFAULT_REGION || 'ap-south-1', 
      bucket: secret.S3_BUCKET_NAME || null
    };
  
    return awsSecretCache;
  }

module.exports = {getRazorpay, getRazorpaySecretKey,getAwsSecrets};
