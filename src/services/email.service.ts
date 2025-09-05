import {
  PasswordChangedTemplate,
  PasswordChangedTemplateData,
} from '@/templates/password-changed.template';
import {
  PasswordResetTemplate,
  PasswordResetTemplateData,
} from '@/templates/password-reset.template';
import {
  WelcomeTemplate,
  WelcomeTemplateData,
} from '@/templates/welcome.template';
import { Injectable, Logger } from '@nestjs/common';
import * as nodemailer from 'nodemailer';

export interface EmailOptions {
  to: string;
  subject: string;
  text?: string;
  html?: string;
}

export interface PasswordResetEmailData {
  firstName: string;
  resetToken: string;
  resetUrl?: string;
}

@Injectable()
export class EmailService {
  private transporter: nodemailer.Transporter;
  private readonly logger = new Logger(EmailService.name);

  constructor() {
    this.createTransporter();
  }

  private createTransporter() {
    // For development, use Ethereal Email (test email service) if no credentials
    if (!process.env.EMAIL_USER || !process.env.GOOGLE_APP_PASSWORD) {
      this.logger.warn(
        'Gmail credentials not found. Using test configuration.',
      );
      this.logger.log(
        'To use Gmail: Set EMAIL_USER and GOOGLE_APP_PASSWORD in .env file',
      );
      // Create test account for development
      void this.createTestAccount();
      return;
    }

    // Gmail configuration with App Password
    const emailConfig = {
      service: 'gmail', // Use Gmail service
      auth: {
        user: process.env.EMAIL_USER, // Your Gmail address
        pass: process.env.GOOGLE_APP_PASSWORD, // 16-character App Password
      },
    };

    this.transporter = nodemailer.createTransport(emailConfig);

    // Verify connection configuration
    this.transporter.verify((error, _success) => {
      if (error) {
        this.logger.error('Gmail transporter verification failed:', error);
        this.logger.error(
          'Please check your EMAIL_USER and GOOGLE_APP_PASSWORD',
        );
      } else {
        this.logger.log('Gmail transporter is ready to send messages');
        this.logger.log(`Configured to send from: ${process.env.EMAIL_USER}`);
      }
    });
  }

  private async createTestAccount() {
    try {
      // Create a test account for development
      const testAccount = await nodemailer.createTestAccount();

      this.transporter = nodemailer.createTransport({
        host: 'smtp.ethereal.email',
        port: 587,
        secure: false,
        auth: {
          user: testAccount.user,
          pass: testAccount.pass,
        },
      });

      this.logger.log(`Test email account created: ${testAccount.user}`);
      this.logger.log(`Preview emails at: https://ethereal.email`);
    } catch (error) {
      this.logger.error('Failed to create test email account:', error);
    }
  }

  async sendEmail(options: EmailOptions): Promise<boolean> {
    try {
      const mailOptions = {
        from: process.env.EMAIL_FROM || '"HR Ease" <noreply@hrease.com>',
        to: options.to,
        subject: options.subject,
        text: options.text,
        html: options.html,
      };

      const result = await this.transporter.sendMail(mailOptions);

      // Log preview URL for test emails
      if (result.messageId && process.env.NODE_ENV !== 'production') {
        const previewUrl = nodemailer.getTestMessageUrl(result);
        if (previewUrl) {
          this.logger.log(`Email preview: ${previewUrl}`);
        }
      }

      this.logger.log(`Email sent successfully to ${options.to}`);

      return true;
    } catch (error) {
      this.logger.error(`Failed to send email to ${options.to}:`, error);
      return false;
    }
  }

  async sendPasswordResetEmail(
    email: string,
    data: PasswordResetEmailData,
  ): Promise<boolean> {
    const resetUrl =
      data.resetUrl ||
      `${process.env.FRONTEND_URL || 'http://localhost:3000'}/reset-password?token=${data.resetToken}`;

    const templateData: PasswordResetTemplateData = {
      firstName: data.firstName,
      resetUrl,
      resetToken: data.resetToken,
    };

    const htmlTemplate = PasswordResetTemplate.getHtml(templateData);
    const textTemplate = PasswordResetTemplate.getText(templateData);

    return this.sendEmail({
      to: email,
      subject: 'Password Reset Request - HR Ease',
      text: textTemplate,
      html: htmlTemplate,
    });
  }

  async sendWelcomeEmail(email: string, firstName: string): Promise<boolean> {
    const templateData: WelcomeTemplateData = {
      firstName,
      email,
    };

    const htmlTemplate = WelcomeTemplate.getHtml(templateData);
    const textTemplate = WelcomeTemplate.getText(templateData);

    return this.sendEmail({
      to: email,
      subject: 'Welcome to HR Ease! 🎉',
      text: textTemplate,
      html: htmlTemplate,
    });
  }

  async sendPasswordChangedNotification(
    email: string,
    firstName: string,
  ): Promise<boolean> {
    const templateData: PasswordChangedTemplateData = {
      firstName,
      email,
      changeDate: new Date().toLocaleString(),
    };

    const htmlTemplate = PasswordChangedTemplate.getHtml(templateData);
    const textTemplate = PasswordChangedTemplate.getText(templateData);

    return this.sendEmail({
      to: email,
      subject: 'Password Changed - HR Ease Security Alert 🔐',
      text: textTemplate,
      html: htmlTemplate,
    });
  }
}
