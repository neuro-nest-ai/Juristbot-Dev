require('dotenv').config();
const nodemailer = require('nodemailer');

async function sendEmaildemo(user) {
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
    from: `${process.env.FROM_EMAIL}`,
    to: user.email,
    subject: '🎉 Payment Successful – Welcome to JuristBot (First-Time Demo Access)',
    html: `
      <div style="max-width: 600px; margin: auto; font-family: 'Segoe UI', Tahoma, Geneva, Verdana, sans-serif; color: #2c3e50; border: 1px solid #e0e0e0; border-radius: 10px; padding: 30px; background-color: #fafafa;">
        <div style="text-align: center;">
          <img src="https://rotary-bot.s3.ap-south-1.amazonaws.com/Profile%20Images/cards.png" alt="JuristBot Logo" style="height: 40px; margin-bottom: 13px;" />
        </div>
        <h2 style="text-align: center; color: #27ae60;">🎉 Payment Successful – Welcome to JuristBot!</h2>
        <p style="font-size: 16px;">
         Dear ${user.username || 'User'},

        </p>
        <p style="font-size: 16px;">
          Thank you for choosing JuristBot AI. Your payment has been received, and your subscription is now active.
        </p>
        <div style="margin: 30px 0; text-align: center;">
          <a href="https://juristbot.ai/demo-feature" style="background-color: #2d89ef; color: #fff; text-decoration: none; padding: 12px 30px; border-radius: 5px; font-size: 16px; font-weight: bold;">
            Click here to try our DEMO features
          </a>
        </div>
        <p style="font-size: 15px; color: #34495e;">
          As a first-time user, we invite you to explore all the premium features with our guided demo. If you have any questions or need support, simply reply to this email—our team is always ready to help.
        </p>
        <p style="font-size: 14px; color: #7f8c8d;">
          Need help? Just reply to this email—we’ve got your back.
        </p>
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

module.exports = sendEmaildemo;
