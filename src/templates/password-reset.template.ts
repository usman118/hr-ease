export interface PasswordResetTemplateData {
  firstName: string;
  resetUrl: string;
  resetToken: string;
}

export class PasswordResetTemplate {
  static getHtml(data: PasswordResetTemplateData): string {
    return `
      <!DOCTYPE html>
      <html>
      <head>
        <meta charset="utf-8">
        <meta name="viewport" content="width=device-width, initial-scale=1.0">
        <title>Password Reset - HR Ease</title>
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
            background: #007bff; 
            color: white; 
            padding: 20px; 
            text-align: center; 
            border-radius: 8px 8px 0 0;
          }
          .content { 
            padding: 30px; 
            background: #f9f9f9; 
            border-radius: 0 0 8px 8px;
          }
          .button { 
            display: inline-block; 
            background: #007bff; 
            color: white; 
            padding: 12px 30px; 
            text-decoration: none; 
            border-radius: 5px; 
            margin: 20px 0; 
            font-weight: bold;
          }
          .footer { 
            padding: 20px; 
            text-align: center; 
            color: #666; 
            font-size: 12px; 
          }
          .token { 
            background: #e9ecef; 
            padding: 10px; 
            border-radius: 5px; 
            font-family: monospace; 
            word-break: break-all; 
            margin: 10px 0;
          }
          .warning {
            background: #fff3cd;
            border: 1px solid #ffeaa7;
            color: #856404;
            padding: 15px;
            border-radius: 5px;
            margin: 20px 0;
          }
        </style>
      </head>
      <body>
        <div class="container">
          <div class="header">
            <h1>HR Ease</h1>
          </div>
          <div class="content">
            <h2>Password Reset Request</h2>
            <p>Hello ${data.firstName},</p>
            <p>We received a request to reset your password for your HR Ease account. If you didn't make this request, you can safely ignore this email.</p>
            
            <p>To reset your password, click the button below:</p>
            <a href="${data.resetUrl}" class="button">Reset Password</a>
            
            <p>Or copy and paste this link in your browser:</p>
            <p><a href="${data.resetUrl}">${data.resetUrl}</a></p>
            
            <p><strong>Reset Token:</strong></p>
            <div class="token">${data.resetToken}</div>
            
            <div class="warning">
              <strong>⚠️ Important:</strong> This link will expire in 1 hour for security reasons.
            </div>
            
            <p>If you continue to have problems, please contact our support team.</p>
            <p>Best regards,<br><strong>The HR Ease Team</strong></p>
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

  static getText(data: PasswordResetTemplateData): string {
    return `
Password Reset Request - HR Ease

Hello ${data.firstName},

We received a request to reset your password for your HR Ease account. If you didn't make this request, you can safely ignore this email.

To reset your password, visit the following link:
${data.resetUrl}

Reset Token: ${data.resetToken}

⚠️ IMPORTANT: This link will expire in 1 hour for security reasons.

If you continue to have problems, please contact our support team.

Best regards,
The HR Ease Team

---
This email was sent by HR Ease.
© 2025 HR Ease. All rights reserved.
    `.trim();
  }
}
