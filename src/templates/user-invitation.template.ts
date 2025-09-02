export interface UserInvitationTemplateData {
  firstName: string;
  lastName: string;
  email: string;
  role: string;
  companyName?: string;
  temporaryPassword: string;
  loginUrl: string;
  invitedBy: string;
}

export class UserInvitationTemplate {
  static getHtml(data: UserInvitationTemplateData): string {
    return `
      <!DOCTYPE html>
      <html>
      <head>
        <meta charset="utf-8">
        <meta name="viewport" content="width=device-width, initial-scale=1.0">
        <title>Welcome to HR Ease - Account Invitation</title>
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
            background: #28a745; 
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
          .footer { 
            padding: 20px; 
            text-align: center; 
            color: #666; 
            font-size: 12px; 
          }
          .credentials-box {
            background: #e7f3ff;
            border: 2px solid #007bff;
            padding: 20px;
            border-radius: 8px;
            margin: 20px 0;
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
          .role-badge {
            background: #ffc107;
            color: #212529;
            padding: 4px 12px;
            border-radius: 20px;
            font-size: 12px;
            font-weight: bold;
            text-transform: uppercase;
          }
          .company-info {
            background: white;
            padding: 15px;
            border-left: 4px solid #28a745;
            margin: 20px 0;
          }
        </style>
      </head>
      <body>
        <div class="container">
          <div class="header">
            <h1>🎉 Welcome to HR Ease!</h1>
          </div>
          <div class="content">
            <h2>Account Invitation</h2>
            <p>Hello <strong>${data.firstName} ${data.lastName}</strong>,</p>
            
            <p>You have been invited to join HR Ease as a <span class="role-badge">${data.role.replace('_', ' ')}</span> by <strong>${data.invitedBy}</strong>.</p>
            
            ${
              data.companyName
                ? `
            <div class="company-info">
              <p><strong>🏢 Company:</strong> ${data.companyName}</p>
            </div>
            `
                : ''
            }
            
            <div class="credentials-box">
              <h3>🔐 Your Login Credentials</h3>
              <p><strong>Email:</strong> ${data.email}</p>
              <p><strong>Temporary Password:</strong> <code>${data.temporaryPassword}</code></p>
              <p><em>⚠️ Please change your password after your first login for security.</em></p>
            </div>
            
            <p>Click the button below to access your account:</p>
            <a href="${data.loginUrl}" class="button">Login to HR Ease</a>
            
            <p>Or copy and paste this link in your browser:</p>
            <p><a href="${data.loginUrl}">${data.loginUrl}</a></p>
            
            <h3>🚀 What's Next?</h3>
            <ul>
              <li>Login with your temporary credentials</li>
              <li>Change your password immediately</li>
              <li>Complete your profile information</li>
              <li>Start exploring HR Ease features</li>
            </ul>
            
            <p>If you have any questions or need assistance, please contact our support team.</p>
            <p>Welcome aboard!</p>
            <p>Best regards,<br><strong>The HR Ease Team</strong></p>
          </div>
          <div class="footer">
            <p>This invitation was sent by ${data.invitedBy} via HR Ease.</p>
            <p>&copy; 2025 HR Ease. All rights reserved.</p>
          </div>
        </div>
      </body>
      </html>
    `;
  }

  static getText(data: UserInvitationTemplateData): string {
    return `
Welcome to HR Ease - Account Invitation

Hello ${data.firstName} ${data.lastName},

You have been invited to join HR Ease as a ${data.role.replace('_', ' ').toUpperCase()} by ${data.invitedBy}.

${data.companyName ? `Company: ${data.companyName}` : ''}

🔐 Your Login Credentials:
Email: ${data.email}
Temporary Password: ${data.temporaryPassword}

⚠️ Please change your password after your first login for security.

Login URL: ${data.loginUrl}

🚀 What's Next?
- Login with your temporary credentials
- Change your password immediately  
- Complete your profile information
- Start exploring HR Ease features

If you have any questions or need assistance, please contact our support team.

Welcome aboard!

Best regards,
The HR Ease Team

---
This invitation was sent by ${data.invitedBy} via HR Ease.
© 2025 HR Ease. All rights reserved.
    `.trim();
  }
}
