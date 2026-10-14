const otp_template = ({ payload }) => {
    return {
        subject: 'Email Verification Code',
        html: `
          <!DOCTYPE html>
            <html lang="en">
            <head>
            <meta charset="UTF-8">
            <meta name="viewport" content="width=device-width, initial-scale=1.0">
            <title>Email Verification Code</title>
            <style>
            body {
                font-family: Arial, sans-serif;
                background-color: #f4f4f4;
                margin: 0;
                padding: 0;
            }
            .email-container {
                max-width: 550px;
                margin: 0 auto;
                background-color: #ffffff;
                padding: 15px;
                border-radius: 7px;
                border:1px solid  rgb(214, 214, 214);
                box-shadow: rgba(0, 0, 0, 0.1) 0px 0px 5px 0px, rgba(0, 0, 0, 0.1) 0px 0px 1px 0px;
            }
            .email-header {
                text-align: center;
                padding: 10px 0;
            }
            .email-header img {
                height: 40px;
            }
            .email-body {
                padding:15px;
            }
            .otp {
                font-size: 2em;
                background-color: #DCA02C0D;
                padding: 5px 10px 5px 10px;
                border-radius: 8px;
                display: inline-block;
                margin: 12px;
                text-align: center;
                letter-spacing: 0.9em;
            }
            .email-footer {
                text-align: center;
                font-size: 1em;
                color: #161414;
                padding: 10px 0 0;
                border-top: 1px solid #eeeeee;
            }
            .texts{
                margin-top: 0px ;
            }
            .text{
                margin-bottom: 0px;
            }
            .custom-color {
                color: #FFC42B;
                margin: 0px 0px 0px 0px;
                }
                .no-margin {
                    margin-bottom: 0px;
                    margin-left: 0px;
                    margin-right: 0px;
                }
            </style>
            </head>
            <body>
            <div class="email-container">
            <div class="email-header">
                <img src="https://rotary-bot.s3.ap-south-1.amazonaws.com/Profile%20Images/cards.png" alt="Jurist Bot">
            </div>
            <div class="email-body">
                <h2>Hi ${payload.username},</h2>
                <p class="no-margin">Here is your One Time Password (OTP).</p>
                <p class="text">Please enter this code to verify your email address for Jurist bot</p>
                <div class="otp"><strong>${payload.otp}</strong></div>
                <p class="texts"> OTP will expire in 5 minutes.</p>
                <p class="no-margin">Best Regards,</p>
                <p  class="custom-color">Juristbot team.</p>
            </div>
            <div class="email-footer">
                &copy; 2024 JURISTBOT. All rights reserved.
            </div>
            </div>
            </body>
        </html>`
    };
};

const forget_otp_template = ({ payload }) => {
    return {
        subject: 'Email Verification Code',
        html: `<!DOCTYPE html>
          <html lang="en">
          <head>
              <meta charset="UTF-8">
              <meta name="viewport" content="width=device-width, initial-scale=1.0">
              <title>Email Verification Code</title>
              <style>
                  body { font-family: Arial, sans-serif; background-color: #f4f4f4; margin: 0; padding: 0; }
                  .email-container { max-width: 550px; margin: 0 auto; background-color: #ffffff; padding: 15px; border-radius: 7px; border: 1px solid rgb(214, 214, 214); box-shadow: rgba(0, 0, 0, 0.1) 0px 0px 5px 0px, rgba(0, 0, 0, 0.1) 0px 0px 1px 0px; }
                  .email-header { text-align: center; padding: 10px 0; }
                  .email-header img { height: 40px; }
                  .email-body { padding: 15px; }
                  .otp { font-size: 2em; background-color: #DCA02C0D; padding: 5px 10px; border-radius: 8px; display: inline-block; margin: 12px; text-align: center; letter-spacing: 0.9em; }
                  .email-footer { text-align: center; font-size: 1em; color: #161414; padding: 10px 0 0; border-top: 1px solid #eeeeee; }
                  .custom-color { color: #FFC42B; margin: 0px 0px 0px 0px; }
              </style>
          </head>
          <body>
              <div class="email-container">
                  <div class="email-header">
                      <img src="https://rotary-bot.s3.ap-south-1.amazonaws.com/Profile%20Images/cards.png" alt="juristbot">
                  </div>
                  <div class="email-body">
                      <p>Here is your One Time Password (OTP).</p>
                      <p>Please enter this code to verify your email address for Juristbot bot</p>
                      <div class="otp"><strong>${payload.otp}</strong></div>
                      <p>OTP will expire in 5 minutes.</p>
                      <p class="no-margin">Best Regards,</p>
                      <p  class="custom-color">Juristbot team.</p>
                  </div>
                  <div class="email-footer">
                      &copy; 2024 JURISTBOT. All rights reserved.
                  </div>
              </div>
          </body>
          </html>`

    };
};

const crd_template = ({ payload }) => {
  return {
    subject: "Your JuristBot AI Login Details",
    html: `<!DOCTYPE html>
<html lang="en">
<head>
<meta charset="UTF-8">
<meta name="viewport" content="width=device-width, initial-scale=1.0">
<title>Welcome to JuristBot AI</title>
</head>

<body style="margin:0; padding:0; background-color:#f4f6f8; font-family:'Segoe UI', Tahoma, Geneva, Verdana, sans-serif;">

<div style="max-width:600px; margin:30px auto; background:#ffffff; border-radius:10px; padding:30px; border:1px solid #e0e0e0;">

  <div style="text-align:center; margin-bottom:20px;">
    <img src="https://rotary-bot.s3.ap-south-1.amazonaws.com/Profile%20Images/cards.png" 
         alt="JuristBot AI Logo" 
         style="height:50px;" />
  </div>

  <h2 style="color:#1a237e; margin-bottom:10px;">
    Welcome to JuristBot AI, ${payload.name || "User"}!
  </h2>

  <p style="font-size:15px; color:#333; line-height:1.6;">
    Your account has been successfully created. Below are your login details:
  </p>

  <div style="background:#f1f5fb; padding:15px; border-radius:8px; margin:20px 0;">
    <p style="margin:0; font-size:14px;"><strong>Email:</strong> ${payload.email}</p>
    <p style="margin:0; font-size:14px;"><strong>Password:</strong> ${payload.password}</p>
  </div>

  <p style="font-size:15px; color:#333; line-height:1.6;">
    For security reasons, we do not share passwords via email.
    Please use the button below to securely log in and set your password.
  </p>

  <div style="text-align:center; margin:30px 0;">
    <a href="https://admin.juristbot.ai/" 
       style="background-color:#0066cc; color:#ffffff; padding:12px 28px; 
              text-decoration:none; border-radius:6px; font-size:15px; display:inline-block;">
      Login to Your Account
    </a>
  </div>

  <p style="font-size:14px; color:#555;">
    If you did not request this account, please ignore this email.
  </p>

  <hr style="border:none; border-top:1px solid #e0e0e0; margin:30px 0;" />

  <p style="font-size:13px; text-align:center; color:#888;">
    © ${new Date().getFullYear()} JuristBot AI. All rights reserved.
  </p>

</div>

</body>
</html>`
  };
};


const interncrd_template = ({ payload }) => {
  return {
    subject: "Your JuristBot AI Login Details",
    html: `<!DOCTYPE html>
<html lang="en">
<head>
<meta charset="UTF-8">
<meta name="viewport" content="width=device-width, initial-scale=1.0">
<title>Welcome to JuristBot AI</title>
</head>

<body style="margin:0; padding:0; background-color:#f4f6f8; font-family:'Segoe UI', Tahoma, Geneva, Verdana, sans-serif;">

<div style="max-width:600px; margin:30px auto; background:#ffffff; border-radius:10px; padding:30px; border:1px solid #e0e0e0;">

  <div style="text-align:center; margin-bottom:20px;">
    <img src="https://rotary-bot.s3.ap-south-1.amazonaws.com/Profile%20Images/cards.png" 
         alt="JuristBot AI Logo" 
         style="height:50px;" />
  </div>

  <h2 style="color:#1a237e; margin-bottom:10px;">
    Welcome to JuristBot AI, ${payload.name || "User"}!
  </h2>

  <p style="font-size:15px; color:#333; line-height:1.6;">
    Your account has been successfully created. Login link:
  </p>


  <p style="font-size:15px; color:#333; line-height:1.6;">
    For security reasons, we do not share passwords via email.
    Please use the button below to securely log in and set your password.
  </p>

  <div style="text-align:center; margin:30px 0;">
    <a href="https://admin.juristbot.ai/" 
       style="background-color:#0066cc; color:#ffffff; padding:12px 28px; 
              text-decoration:none; border-radius:6px; font-size:15px; display:inline-block;">
      Login to Your Account
    </a>
  </div>

  <p style="font-size:14px; color:#555;">
    If you did not request this account, please ignore this email.
  </p>

  <hr style="border:none; border-top:1px solid #e0e0e0; margin:30px 0;" />

  <p style="font-size:13px; text-align:center; color:#888;">
    © ${new Date().getFullYear()} JuristBot AI. All rights reserved.
  </p>

</div>

</body>
</html>`
  };
};
  module.exports = {otp_template,forget_otp_template,crd_template ,interncrd_template};