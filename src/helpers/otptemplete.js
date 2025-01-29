const otptemplete = (Otp, userEmail) => {
  return `<!DOCTYPE html>
<html lang="en">
<head>
  <meta charset="UTF-8">
  <meta name="viewport" content="width=device-width, initial-scale=1.0">
  <title>OTP Verification</title>
  <style>
    /* General Reset */
    * {
      margin: 0;
      padding: 0;
      box-sizing: border-box;
      font-family: Arial, sans-serif;
    }
    body {
      display: flex;
      align-items: center;
      justify-content: center;
      min-height: 100vh;
      background: #f4f7fa;
      color: #333;
    }
    .container {
      max-width: 450px;
      background: #fff;
      padding: 40px;
      border-radius: 12px;
      box-shadow: 0px 6px 15px rgba(0, 0, 0, 0.1);
      text-align: center;
    }
    .container h2 {
      font-size: 1.8em;
      margin-bottom: 10px;
      color: #2c3e50;
      font-weight: bold;
    }
    .container p {
      font-size: 1em;
      margin: 10px 0 20px;
      color: #7f8c8d;
    }
    .otp-code {
      font-size: 1.8em;
      font-weight: bold;
      letter-spacing: 3px;
      color: #3498db;
      padding: 10px 20px;
      border-radius: 8px;
      background: #f1f9ff;
      display: inline-block;
      margin-bottom: 25px;
    }
    .btn-container {
      margin-top: 20px;
    }
    .btn {
      display: inline-block;
      padding: 12px 30px;
      font-size: 1em;
      font-weight: 600;
      color: #fff;
      background-color: #28a745;
      border: none;
      border-radius: 8px;
      cursor: pointer;
      text-decoration: none;
      transition: background-color 0.3s ease;
    }
    .btn:hover {
      background-color: #218838;
    }
    .alt-text {
      font-size: 0.9em;
      color: #7f8c8d;
      margin-top: 15px;
    }
    .alt-text a {
      color: #3498db;
      text-decoration: none;
      font-weight: 600;
    }
    .alt-text a:hover {
      text-decoration: underline;
    }
  </style>
</head>
<body>
  <div class="container">
    <h2>Verify Your Account</h2>
    <p>Thank you for signing up with Oreby! Please verify your account by entering the OTP sent to your email.</p>
    
    <div class="otp-code">${Otp}</div> <!-- Display OTP code here -->
    
    <div class="btn-container">
      <button class="btn"> <a href="http://localhost:5173/otp-verify/${userEmail}">VERIFY MY ACCOUNT</a></button>
    </div>
    
    <p class="alt-text">
      If the button above doesn't work, copy and paste the following link into your browser:<br>
      <a href="http://localhost:5173/otp-verify/${userEmail}">Verification URL</a>
    </p>
  </div>
</body>
</html>
`;
};

module.exports = otptemplete;
