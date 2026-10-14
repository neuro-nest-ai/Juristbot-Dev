const axios = require('axios');
require('dotenv').config();

const BUSINESS_PHONE_NUMBER_ID = process.env.BUSINESS_PHONE_NUMBER_ID;
const WHATSAPP_TOKEN = process.env.WHATSAPP_TOKEN; 
const sendWhatsAppTemplate = async (user) => {
  if (!user?.username || !user?.mobile_no) {
    console.error("❌ Missing template username or mobile_no.");
    return;
  }
  if (!WHATSAPP_TOKEN) {
    console.error("❌ WhatsApp API token is not set.");
    return;
  }
  const payload = {
    messaging_product: "whatsapp",
    to: `91${user.mobile_no}`,
    type: "template",
    template: {
      name: "juristbot_ai_001_5095",
      language: { code: "en" },
      components: [
        {
          type: "body",
          parameters: [
            { type: "text", text: `${user.username}` }
          ]
        }
      ]
    }
  };

  try {
    const response = await axios.post(`https://graph.facebook.com/v23.0/${BUSINESS_PHONE_NUMBER_ID}/messages`,
      payload,
      {
        timeout: 30000,
        headers: {
          'Content-Type': 'application/json',  
          'Accept': 'application/json',
        },
        params: { access_token: WHATSAPP_TOKEN },
      },
    );
    console.log("✅ Message sent successfully:", response.data);
    return response.data;
  } catch (error) {
    console.error("❌ Error sending message:", error.response?.data || error.message, error);
  }
};

module.exports = sendWhatsAppTemplate;

