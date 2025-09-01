import { Logger } from '@nestjs/common';
import { EmailService } from '../services/email.service';

// Simple test script to verify Gmail integration
async function testGmailIntegration() {
  const logger = new Logger('EmailTest');

  // Create email service instance
  const emailService = new EmailService();

  try {
    logger.log('Testing Gmail integration...');

    // Test sending a simple email
    const result = await emailService.sendPasswordResetEmail(
      'theusmanofficial@gmail.com',
      {
        firstName: 'Usman',
        resetToken: 'test-token-12345',
      },
    );

    if (result) {
      logger.log('✅ Email sent successfully!');
      logger.log('Check your Gmail inbox (and spam folder)');
    } else {
      logger.error('❌ Email sending failed');
    }
  } catch (error) {
    logger.error('Test failed:', error.message);
  }
}

// Run the test
void testGmailIntegration();
