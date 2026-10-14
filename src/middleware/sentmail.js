require('dotenv').config();
const nodemailer = require("nodemailer");
const templates = require("./template");

// Send Email Function
const sendEmail = async (email, payload) => {
  try {
    const transporter = nodemailer.createTransport({
      host: process.env.EMAIL_HOST,
      port: 587, 
      secure: false, 
      auth: {
         user: process.env.EMAIL_USERNAME,
         pass: process.env.EMAIL_USERPASSWORD,
      },
    });

    if (!templates[payload.template]) {
      throw new Error("Invalid email template");
    }
    const emailContent = templates[payload.template]({payload});
    // Email options
    const mailOptions = {
      from: `${process.env.FROM_EMAIL} `,
      to: email,
      ...emailContent
    };
    await transporter.sendMail(mailOptions);
    console.log("Email sent successfully");
    return "Email sent successfully";
    
  } catch (error) {
    console.log(error);
    return error;
  }
};

module.exports = { sendEmail };