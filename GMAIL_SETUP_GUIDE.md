# Gmail Email Integration Setup Guide

## 🚀 Quick Setup for Gmail Integration

### Step 1: Enable 2-Step Verification

1. Go to [Google Account Settings](https://myaccount.google.com/)
2. Click on **Security** in the left sidebar
3. Under "Signing in to Google", click **2-Step Verification**
4. Follow the setup process to enable 2-Step Verification

### Step 2: Generate App Password

1. After 2-Step Verification is enabled, go to [App Passwords](https://myaccount.google.com/apppasswords)
2. Select **Other (Custom name)** from the dropdown
3. Enter a name like "HR Ease Backend" or "NodeJS App"
4. Click **Generate**
5. **Important**: Copy the 16-character password immediately (you won't see it again)

### Step 3: Update Environment Variables

Update your `.env` file with:

```bash
# Email Configuration (Gmail with App Password)
EMAIL_USER=theusmanofficial@gmail.com
GOOGLE_APP_PASSWORD=your-16-character-app-password
EMAIL_FROM="HR Ease" <theusmanofficial@gmail.com>
```

**Example of 16-character App Password format:**

```
abcd efgh ijkl mnop
```

_Note: Copy without spaces_

### Step 4: Test Email Functionality

After updating your `.env` file, test the email functionality:

```bash
# Test signup (should send welcome email)
curl -X POST http://localhost:3000/api/v1/auth/signup \
  -H "Content-Type: application/json" \
  -d '{
    "email": "test@example.com",
    "password": "test123",
    "firstName": "Test",
    "lastName": "User",
    "role": "employee"
  }'

# Test forgot password (should send reset email)
curl -X POST http://localhost:3000/api/v1/auth/forgot-password \
  -H "Content-Type: application/json" \
  -d '{
    "email": "theusmanofficial@gmail.com"
  }'
```

## 🔧 Updated Email Service Features

### Gmail Service Configuration

The email service now uses Gmail's optimized configuration:

```javascript
const emailConfig = {
  service: 'gmail',
  auth: {
    user: process.env.EMAIL_USER,
    pass: process.env.GOOGLE_APP_PASSWORD,
  },
};
```

### Enhanced Error Handling

- Clear error messages for missing credentials
- Gmail-specific troubleshooting information
- Fallback to test email service for development

### Verification Logging

The service will log verification status:

- ✅ "Gmail transporter is ready to send messages"
- ❌ "Gmail transporter verification failed"

## 🐛 Troubleshooting

### Common Issues & Solutions

#### 1. "Authentication failed" Error

**Cause**: Incorrect App Password or 2-Step Verification not enabled
**Solution**:

- Verify 2-Step Verification is enabled
- Generate a new App Password
- Ensure no spaces in the App Password

#### 2. "User not found" Error

**Cause**: Wrong Gmail address
**Solution**: Use the exact Gmail address that has 2-Step Verification enabled

#### 3. Emails not received

**Possible causes**:

- Check spam/junk folder
- Gmail may block from unusual IP ranges
- App Password may be incorrect
- Email delivery delays (can take a few minutes)

#### 4. Still using test email service

**Cause**: Environment variables not loaded properly
**Solution**:

- Restart your application after updating `.env`
- Check console logs for "Gmail credentials not found"

### Email Delivery Checklist

- [ ] 2-Step Verification enabled on Google Account
- [ ] App Password generated and copied correctly
- [ ] `.env` file updated with correct credentials
- [ ] Application restarted after `.env` changes
- [ ] Check spam folder in recipient email
- [ ] Wait 2-3 minutes for delivery (Gmail can have delays)

## 📧 Email Templates

All emails now include:

- **HTML Version**: Rich formatting with colors and styling
- **Text Version**: Plain text fallback
- **Responsive Design**: Works on mobile devices
- **Professional Branding**: HR Ease branding and styling

### Email Types:

1. **Welcome Email** 🎉 - Sent on user registration
2. **Password Reset** 🔐 - Sent on forgot password request
3. **Password Changed** ⚠️ - Sent after password changes

## 🔒 Security Notes

- App Passwords bypass most Google security heuristics
- Google may still block unusual locations or IP ranges
- App Passwords are specific to the application
- Revoke App Passwords when no longer needed
- Never share your App Password in code repositories

## ✅ Production Checklist

Before deploying to production:

- [ ] Remove `resetToken` from forgot password response
- [ ] Set up proper domain for email links
- [ ] Configure DMARC/SPF records for better deliverability
- [ ] Use professional email address for `EMAIL_FROM`
- [ ] Test email delivery from production environment
- [ ] Set up email monitoring and error tracking

---

**Current Status**: Email service updated for Gmail App Password integration
**Next Steps**: Update your `.env` file and test email functionality
