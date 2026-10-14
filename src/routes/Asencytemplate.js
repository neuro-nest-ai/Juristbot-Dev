
const axios = require('axios');
const sendWhatsAppTemplate = async (template) => {
const options = {
  method: 'POST',
  url: 'https://backend.aisensy.com/direct-apis/t1/messages',
  headers: {
    'Content-Type': 'application/json',
    Accept: 'application/json, application/xml',
    Authorization: 'Bearer eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJhc3Npc3RhbnRJZCI6IjY3MWY3NmRhYTExZjYyMGMwNGRmNmQ3MyIsImNsaWVudElkIjoiNjcxZjc2ZGFhMTFmNjIwYzA0ZGY2ZDZhIiwid2ViaG9va1VybCI6Imh0dHBzOi8vcmVsYXRlZC1zdHJhbmdlbHktaHllbmEubmdyb2stZnJlZS5hcHAvd2ViaG9vayIsImlhdCI6MTczNzEwMzcxMH0.0aCck_isIiM1zFURtrZqHNfc_SWRys-PBNM2IFCDcZI'
  },
  data: {
    to: `91${template.mobile_no}`,
    type: 'template',
    template: {
      language: {policy: 'deterministic', code: 'en'},
      name: 'juristbot_class_reminder_001_1110',
      components: [{type: 'body', parameters: [{type: 'text', text: `${template.username}`}]}]
    }
  }
};
try {
  const { data } = await axios.request(options);
  console.log(data);
} catch (error) {
  console.error(error);
}
}

module.exports = sendWhatsAppTemplate;