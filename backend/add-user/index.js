import express from "express";
import Mailjet from "node-mailjet";

const router = express.Router();

// Initialize Mailjet client
const mailjet = Mailjet.apiConnect(
  process.env.MAILJET_API_KEY,
  process.env.MAILJET_SECRET_KEY
);

router.post("/", async (req, res) => {
  console.log("Received request:", req.body);

  const { firstName, email, password } = req.body;

  // Validate input
  if (!firstName || !email || !password) {
    return res.status(400).json({
      error: "Missing required fields",
      received: {
        firstName: !!firstName,
        email: !!email,
        password: !!password,
      },
    });
  }

  console.log("Attempting to send email to:", email);

  try {
    // Send email using Mailjet
    const request = await mailjet.post("send", { version: "v3.1" }).request({
      Messages: [
        {
          From: {
            Email: process.env.MAILJET_SENDER_EMAIL,
            Name: "Odyssey Clinic",
          },
          To: [
            {
              Email: email,
              Name: firstName,
            },
          ],
          Subject: "Welcome to Odyssey Clinic Management System",
          HTMLPart: `
              <!DOCTYPE html>
              <html>
              <head>
                <style>
                  body { font-family: Arial, sans-serif; line-height: 1.6; color: #333; }
                  .container { max-width: 600px; margin: 0 auto; padding: 20px; background: #f9fafb; }
                  .header { 
                    background: linear-gradient(135deg, #667eea 0%, #764ba2 100%); 
                    color: white; 
                    padding: 40px 30px; 
                    text-align: center; 
                    border-radius: 10px 10px 0 0; 
                  }
                  .header h1 { margin: 0; font-size: 28px; }
                  .content { background: white; padding: 30px; border-radius: 0 0 10px 10px; box-shadow: 0 2px 4px rgba(0,0,0,0.1); }
                  .credentials { 
                    background: #f0f4ff; 
                    padding: 20px; 
                    border-radius: 8px; 
                    margin: 20px 0; 
                    border-left: 4px solid #667eea; 
                  }
                  .credentials h3 { margin-top: 0; color: #667eea; }
                  .credentials p { margin: 8px 0; font-size: 14px; }
                  .button { 
                    display: inline-block; 
                    padding: 14px 32px; 
                    background: #667eea; 
                    color: white !important; 
                    text-decoration: none; 
                    border-radius: 6px; 
                    margin-top: 20px;
                    font-weight: bold;
                  }
                  .footer { 
                    text-align: center; 
                    margin-top: 30px; 
                    padding-top: 20px;
                    border-top: 1px solid #e5e7eb;
                    color: #666; 
                    font-size: 12px; 
                  }
                  ul { padding-left: 20px; }
                  li { margin: 8px 0; }
                </style>
              </head>
              <body>
                <div class="container">
                  <div class="header">
                    <h1>🏥 Welcome to Odyssey Clinic!</h1>
                  </div>
                  <div class="content">
                    <h2>Hello ${firstName},</h2>
                    <p>Your account has been successfully created in the Odyssey Clinic Management System.</p>
                    
                    <div class="credentials">
                      <h3>📧 Your Login Credentials</h3>
                      <p><strong>Email:</strong> ${email}</p>
                      <p><strong>Temporary Password:</strong> ${password}</p>
                    </div>
                    
                    <p><strong>⚠️ Important Security Notice:</strong></p>
                    <ul>
                      <li>Please log in and change your password immediately</li>
                      <li>Keep your credentials confidential</li>
                      <li>Do not share your password with anyone</li>
                    </ul>
                    
                    <div style="text-align: center;">
                      <a href="https://odysys.netlify.app/signin" class="button">Login to Your Account</a>
                    </div>
                    
                    <p style="margin-top: 30px;">If you have any questions or need assistance, please don't hesitate to contact our support team.</p>
                    
                    <p style="margin-top: 20px;">Best regards,<br><strong>Odyssey Clinic Management Team</strong></p>
                  </div>
                  <div class="footer">
                    <p>This is an automated message. Please do not reply to this email.</p>
                    <p>&copy; ${new Date().getFullYear()} Odyssey Clinic Management System. All rights reserved.</p>
                  </div>
                </div>
              </body>
              </html>
            `,
          TextPart: `
              Welcome to Odyssey Clinic!
              
              Hello ${firstName},
              
              Your account has been successfully created in the Odyssey Clinic Management System.
              
              Your Login Credentials:
              Email: ${email}
              Temporary Password: ${password}
              
              Important Security Notice:
              - Please log in and change your password immediately
              - Keep your credentials confidential
              - Do not share your password with anyone
              
              Login here: https://odysys.netlify.app/signin
              
              If you have any questions or need assistance, please don't hesitate to contact our support team.
              
              Best regards,
              Odyssey Clinic Management Team
            `,
        },
      ],
    });

    console.log("Email sent successfully:", request.body);
    res.json({
      success: true,
      message: "Welcome email sent successfully",
      emailId: request.body.Messages[0].Status,
    });
  } catch (error) {
    console.error("Email sending error:", error);
    return res.status(500).json({
      error: "Failed to send email",
      details: error.message || error.statusCode,
    });
  }
});

export default router;
