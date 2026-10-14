const express = require('express');
const router = express.Router();
require('dotenv').config();
const nodemailer = require("nodemailer");


const transporter = nodemailer.createTransport({
     host: process.env.EMAIL_HOST,
    port: 587, 
    secure: false,  
    auth: {
        user: process.env.EMAIL_USERNAME,
         pass: process.env.EMAIL_USERPASSWORD,
    },
    tls: {
        rejectUnauthorized: false  
    }
});

router.post('/send-message', (req, res) => {
    const { name,mobileno, email, message } = req.body;  

    if (!name ||!mobileno|| !email || !message) {
        return res.status(400).send('Name,mobileno, email, and message are required.');
    }

    const mailOptions = {
        from: `${process.env.FROM_EMAIL} `,   
        to: 'sales@neuronestai.in',  
        subject: `Contact Form Submission ${name}`,
        text: message  ,
        html: `<!DOCTYPE html>
        <html lang="en">
          <head>
            <meta charset="UTF-8" />
            <meta name="viewport" content="width=device-width, initial-scale=1.0" />
            <title>Email Template</title>
            <style>
              body {
                font-family: Arial, sans-serif;
                margin: 0;
                padding: 0;
                background-color: #f4f4f4;
              }
              .email-container {
                width: 100%;
                max-width: 800px;
                margin: 0 auto;
                background-color: #ffffff;
                border: 1px solid #ddd;
                border-radius: 5px;
                overflow: hidden;
                margin-top: "52px";
              }
              .header{
               background-color: rgb(255, 214, 102);
                color: #000000;
                text-align: center;
                padding: 10px;
              }
              .footer {
                background-color: #cdcdcd;
                color: #000000;
                text-align: center;
                padding:4px;
              }
              .header img {
                width: 292px;
                height: auto;
              }
              .content {
                padding: 20px;
                text-align: left;
                margin-bottom: "15px";
              }
              
               .first-paragraph {
                margin-top: 20px; 
                 font-weight: 300;
                 font-size: 16px;
               font-family: sans-serif;
              }
                .second-paragraph {
                margin-top: 13px; 
                font-size: 15px;
                font-family: sans-serif;
              }
                 .third-paragraph {
                margin-top: 8px; 
                font-size: 15px;
                font-family: sans-serif;
              }
        
              .para-st {
                font-size: 15px;
                font-weight: 300;
                font-family: sans-serif;
                text-align: justify;
              }
                .list{
                  font-size: 14px;
                   font-family: sans-serif;

                }
            </style>
          </head>
          <body style="margin-top: 30px;">
            <div class="email-container">
              <div class="header" >
                <img
                  src="https://juristbot.ai/static/media/framlogo.8c4a60a2808b8ababa4f.png"
                  alt="Jurist bot"
                />
              </div>
              <div class="content">
                <p class="first-paragraph">Dear Team,</p>
                <p class="second-paragraph">I hope this message finds you well.</p>
                <p class="third-paragraph">I am reaching out to you through your contact form with the following details:</p>
                <ul class="list">
                <li>Name:${name}</li>
                <li>Phone:${mobileno}</li>
                <li>Email: ${email}</li>
                </ul>
                <p class="para-st">
                  &nbsp;&nbsp;${message}
                </p>
              </div>
              <div class="footer" style="font-size: 13px;
              color: #5b5b5b; margin: 0px 0px 0px 0px !important">
                <p>@2024 juristbot.ai All Rights Reserved.</p>
              </div>
            </div>
          </body>
        </html>
        `
    };

    transporter.sendMail(mailOptions, (error, info) => {
        if (error) {
            console.error('Error sending email:', error);
            return res.status(500).send('Error sending email.');
        }
        console.log('Email sent: ' + info.response);
        res.status(200).send('Email sent successfully.');
    });
});
module.exports = router;