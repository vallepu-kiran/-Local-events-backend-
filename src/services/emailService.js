const nodemailer = require("nodemailer");

class EmailService {
  constructor() {
    this.transporter = nodemailer.createTransport({  // Fix here: use `createTransport` instead of `createTransporter`
      host: process.env.EMAIL_HOST,
      port: process.env.EMAIL_PORT,
      secure: false, // Set to true if you're using a secure connection (SSL/TLS)
      auth: {
        user: process.env.EMAIL_USER,
        pass: process.env.EMAIL_PASS,
      },
    });
  }

  async sendEmail({ to, subject, html, text }) {
    try {
      const mailOptions = {
        from: `"Local Events App" <${process.env.EMAIL_USER}>`,
        to,
        subject,
        html,
        text,
      };

      const result = await this.transporter.sendMail(mailOptions);
      console.log("Email sent successfully:", result.messageId);
      return result;
    } catch (error) {
      console.error("Email sending failed:", error);
      throw error;
    }
  }

  async sendWelcomeEmail(user) {
    const html = `
      <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto;">
        <h1 style="color: #333;">Welcome to Local Events App!</h1>
        <p>Hi ${user.firstName},</p>
        <p>Thank you for joining our local events community. We're excited to have you on board!</p>
        <p>Start discovering amazing events in your area and connect with like-minded people.</p>
        <div style="margin: 30px 0;">
          <a href="${process.env.FRONTEND_URL}" style="background-color: #007bff; color: white; padding: 12px 24px; text-decoration: none; border-radius: 5px;">Explore Events</a>
        </div>
        <p>Best regards,<br>The Local Events Team</p>
      </div>
    `;

    return this.sendEmail({
      to: user.email,
      subject: "Welcome to Local Events App!",
      html,
    });
  }

  async sendEventReminder(user, event) {
    const html = `
      <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto;">
        <h1 style="color: #333;">Event Reminder</h1>
        <p>Hi ${user.firstName},</p>
        <p>This is a reminder that you have an upcoming event:</p>
        <div style="border: 1px solid #ddd; padding: 20px; margin: 20px 0; border-radius: 5px;">
          <h2 style="color: #007bff; margin-top: 0;">${event.title}</h2>
          <p><strong>Date:</strong> ${new Date(event.startDateTime).toLocaleDateString()}</p>
          <p><strong>Time:</strong> ${new Date(event.startDateTime).toLocaleTimeString()}</p>
          <p><strong>Location:</strong> ${event.location}</p>
        </div>
        <p>We look forward to seeing you there!</p>
        <p>Best regards,<br>The Local Events Team</p>
      </div>
    `;

    return this.sendEmail({
      to: user.email,
      subject: `Reminder: ${event.title}`,
      html,
    });
  }
}

module.exports = new EmailService();
