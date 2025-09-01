export interface PasswordChangedTemplateData {
  firstName: string;
  email: string;
  changeDate: string;
}

export class PasswordChangedTemplate {
  static getHtml(data: PasswordChangedTemplateData): string {
    return `
      <!DOCTYPE html>
      <html>
      <head>
        <meta charset="utf-8">
        <meta name="viewport" content="width=device-width, initial-scale=1.0">
        <title>Password Changed - HR Ease</title>
        <style>
          body { 
            font-family: Arial, sans-serif; 
            line-height: 1.6; 
            color: #333; 
            margin: 0; 
            padding: 0; 
          }
          .container { 
            max-width: 600px; 
            margin: 0 auto; 
            padding: 20px; 
          }
          .header { 
            background: #ffc107; 
            color: #212529; 
            padding: 20px; 
            text-align: center; 
            border-radius: 8px 8px 0 0;
          }
          .content { 
            padding: 30px; 
            background: #f9f9f9; 
            border-radius: 0 0 8px 8px;
          }
          .footer { 
            padding: 20px; 
            text-align: center; 
            color: #666; 
            font-size: 12px; 
          }
          .alert { 
            background: #d1ecf1; 
            border: 1px solid #bee5eb; 
            padding: 15px; 
            border-radius: 5px; 
            margin: 20px 0; 
          }
          .security-tips {
            background: white;
            padding: 20px;
            border-radius: 5px;
            margin: 20px 0;
          }
          .security-tips li {
            margin: 8px 0;
            padding-left: 5px;
          }
          .timestamp {
            background: #e9ecef;
            padding: 10px;
            border-radius: 5px;
            font-family: monospace;
            margin: 10px 0;
          }
        </style>
      </head>
      <body>
        <div class="container">
          <div class="header">
            <h1>🔐 HR Ease Security</h1>
          </div>
          <div class="content">
            <h2>Password Changed Successfully</h2>
            <p>Hello <strong>${data.firstName}</strong>,</p>
            
            <div class="alert">
              <p>✅ This is a confirmation that your password has been successfully changed for account: <strong>${data.email}</strong></p>
              <div class="timestamp">
                <strong>Change Date:</strong> ${data.changeDate}
              </div>
            </div>
            
            <div class="alert" style="background: #f8d7da; border-color: #f5c6cb; color: #721c24;">
              <strong>🚨 Security Notice:</strong> If you did not make this change, please contact our support team immediately.
            </div>
            
            <div class="security-tips">
              <h3>🛡️ Security Recommendations:</h3>
              <ul>
                <li>🔑 Use a strong, unique password for your account</li>
                <li>🤐 Never share your password with anyone</li>
                <li>🚪 Always log out from shared or public devices</li>
                <li>👀 Monitor your account for any suspicious activity</li>
                <li>📧 Keep your email address secure and up to date</li>
              </ul>
            </div>
            
            <p>If you have any security concerns or questions, please contact our support team immediately.</p>
            <p>Best regards,<br><strong>The HR Ease Security Team</strong></p>
          </div>
          <div class="footer">
            <p>This email was sent by HR Ease. If you no longer wish to receive these emails, please contact support.</p>
            <p>&copy; 2025 HR Ease. All rights reserved.</p>
          </div>
        </div>
      </body>
      </html>
    `;
  }

  static getText(data: PasswordChangedTemplateData): string {
    return `
Password Changed Successfully - HR Ease

Hello ${data.firstName},

✅ This is a confirmation that your password has been successfully changed for account: ${data.email}

Change Date: ${data.changeDate}

🚨 SECURITY NOTICE: If you did not make this change, please contact our support team immediately.

🛡️ Security Recommendations:
🔑 Use a strong, unique password for your account
🤐 Never share your password with anyone
🚪 Always log out from shared or public devices
👀 Monitor your account for any suspicious activity
📧 Keep your email address secure and up to date

If you have any security concerns or questions, please contact our support team immediately.

Best regards,
The HR Ease Security Team

---
This email was sent by HR Ease.
© 2025 HR Ease. All rights reserved.
    `.trim();
  }
}
