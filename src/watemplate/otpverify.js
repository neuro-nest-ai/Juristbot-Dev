const axios = require('axios');
require('dotenv').config();

const BUSINESS_PHONE_NUMBER_ID = process.env.BUSINESS_PHONE_NUMBER_ID;
const WHATSAPP_TOKEN = process.env.WHATSAPP_TOKEN;

const sendWhatsAppTemplateOtp = async (user) => {
  console.log("📱 Sending OTP via WhatsApp:", user);
  try {
    if (!user?.mobile_no || !user?.otp) {
      throw new Error("Missing required fields: mobile_no or otp");
    }

    if (!WHATSAPP_TOKEN || !BUSINESS_PHONE_NUMBER_ID) {
      throw new Error("WhatsApp credentials are not configured properly.");
    }

    const payload = {
      messaging_product: "whatsapp",
      to: `91${user.mobile_no}`, 
      type: "template",
      template: {
        name: "verification_code",
        language: { code: "en" },
        components: [
          {
            type: "BODY",
            parameters: [
              {
                type: "text",
                text: String(user.otp)
              }
            ]
          },
          {
            type: "BUTTON",
            sub_type: "url",
            index: "0",
            parameters: [
              {
                type: "text",
                text: String(user.otp)
              }
            ]
          }
        ]
      }
    };

    const response = await axios.post(
      `https://graph.facebook.com/v23.0/${BUSINESS_PHONE_NUMBER_ID}/messages`,
      payload,
      {
        headers: {
          Authorization: `Bearer ${WHATSAPP_TOKEN}`,
          "Content-Type": "application/json"
        },
        timeout: 30000
      }
    );

    console.log("✅ OTP sent successfully with copy button:", response.data);
    return response.data;

  } catch (error) {
    console.error(
      "❌ WhatsApp OTP error:",
      error.response?.data || error.message
    );
    throw error;
  }
};

module.exports = sendWhatsAppTemplateOtp;