export interface WelcomeTemplateData {
  firstName: string;
  email: string;
}

export class WelcomeTemplate {
  static getHtml(data: WelcomeTemplateData): string {
    return `
      <!DOCTYPE html>
      <html>
      <head>
        <meta charset="utf-8">
        <meta name="viewport" content="width=device-width, initial-scale=1.0">
        <title>Welcome to HR Ease</title>
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
          .feature-list {
            background: white;
            padding: 20px;
            border-radius: 5px;
            margin: 20px 0;
          }
          .feature-list li {
            margin: 8px 0;
            padding-left: 5px;
          }
          .highlight {
            background: #e7f3ff;
            padding: 15px;
            border-left: 4px solid #007bff;
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
            <h2>Account Created Successfully</h2>
            <p>Hello <strong>${data.firstName}</strong>,</p>
            
            <div class="highlight">
              <p>🎊 Congratulations! Your HR Ease account has been successfully created with email: <strong>${data.email}</strong></p>
            </div>
            
            <p>You now have access to our comprehensive HR management platform with the following features:</p>
            
            <div class="feature-list">
              <ul>
                <li>👥 <strong>Employee Management</strong> - Manage employee profiles and information</li>
                <li>🏖️ <strong>Leave Management</strong> - Handle leave requests and approvals</li>
                <li>📊 <strong>Performance Tracking</strong> - Monitor and evaluate employee performance</li>
                <li>📄 <strong>Document Management</strong> - Store and organize important documents</li>
                <li>📈 <strong>Analytics & Reporting</strong> - Generate insights and reports</li>
                <li>🔐 <strong>Secure Access Control</strong> - Role-based permissions and security</li>
              </ul>
            </div>
            
            <p>If you have any questions or need assistance getting started, please don't hesitate to contact our support team.</p>
            <p>We're excited to have you on board!</p>
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

  static getText(data: WelcomeTemplateData): string {
    return `
Welcome to HR Ease!

Hello ${data.firstName},

🎊 Congratulations! Your HR Ease account has been successfully created with email: ${data.email}

You now have access to our comprehensive HR management platform with the following features:

👥 Employee Management - Manage employee profiles and information
🏖️ Leave Management - Handle leave requests and approvals
📊 Performance Tracking - Monitor and evaluate employee performance
📄 Document Management - Store and organize important documents
📈 Analytics & Reporting - Generate insights and reports
🔐 Secure Access Control - Role-based permissions and security

If you have any questions or need assistance getting started, please don't hesitate to contact our support team.

We're excited to have you on board!

Best regards,
The HR Ease Team

---
This email was sent by HR Ease.
© 2025 HR Ease. All rights reserved.
    `.trim();
  }
}
