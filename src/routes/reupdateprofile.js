require('dotenv').config();
const nodemailer = require('nodemailer');

async function sendprofileupdate(emails) {
  const transporter = nodemailer.createTransport({
    host: process.env.EMAIL_HOST,
    port: 587, 
    secure: false, 
    auth: {
      user: process.env.EMAIL_USERNAME,
      pass: process.env.EMAIL_USERPASSWORD,
    },
  });

  const mailOptions = {
    from: `${process.env.FROM_EMAIL} `,
    to: emails.email,
    subject: '🎉 Registration Successful – Complete Your JuristBot Profile',
    html: `
      <div style="max-width: 600px; margin: auto; font-family: 'Segoe UI', Tahoma, Geneva, Verdana, sans-serif; color: #2c3e50; border: 1px solid #e0e0e0; border-radius: 10px; padding: 30px; background-color: #fafafa;">
        <div style="text-align: center;">
          <img src="https://rotary-bot.s3.ap-south-1.amazonaws.com/Profile%20Images/cards.png" alt="JuristBot Logo" style="height: 40px; margin-bottom: 13px;" />
        </div>
        <h2 style="color: #0066cc;">Hello Advocate,</h2>
        <p style="font-size: 16px; line-height: 1.5;">
          ✅  Your registration was successful. You’re moments away from faster drafting, smarter research, and 24/7 assistance.
        </p>
        <p style="font-size: 16px; line-height: 1.5;">
          To ensure everything is up-to-date, we recommend checking your profile details. You can quickly update them by clicking the button below:
        </p>
        <div style="text-align: center; margin: 30px 0;">
          <a href="https://juristbot.ai/profile" style="background-color: #0066cc; color: white; padding: 12px 25px; font-size: 16px; text-decoration: none; border-radius: 6px;">
            ✏️ Update My Profile
          </a>
        </div>
        <p style="font-size: 14px; color: #7f8c8d;">Need help? Just reply to this email—we’ve got your back.</p>
        <hr style="border: none; border-top: 1px solid #dcdcdc; margin: 30px 0;" />
        <p style="font-size: 14px; text-align: center; color: #95a5a6;">
          © ${new Date().getFullYear()} JuristBot AI – Built with ❤️ for legal minds
        </p>
      </div>
    `
  };

  try {
    const info = await transporter.sendMail(mailOptions);
    console.log('✅ Email sent successfully:', info.messageId);
  } catch (error) {
    console.error('❌ Error sending email:', error);
  }
}

module.exports = sendprofileupdate;
