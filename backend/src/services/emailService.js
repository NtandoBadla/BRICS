const prisma = require('../prisma');
const nodemailer = require('nodemailer');

// Email Configuration
const EMAIL_USER = process.env.EMAIL_USER || process.env.GMAIL_USER;
const EMAIL_PASS = process.env.EMAIL_PASS || process.env.GMAIL_PASS;
const EMAIL_FROM = process.env.EMAIL_FROM || EMAIL_USER;

const EMAIL_ENABLED = EMAIL_USER && EMAIL_PASS;

if (EMAIL_ENABLED) {
  console.log('✅ Email Service: Enabled with SMTP');
  console.log('Email User:', EMAIL_USER);
} else {
  console.log('⚠️ Email Service: Disabled (EMAIL_USER and EMAIL_PASS required)');
}

// Create transporter
const transporter = EMAIL_ENABLED ? nodemailer.createTransport({
  service: 'gmail',
  auth: {
    user: EMAIL_USER,
    pass: EMAIL_PASS
  }
}) : null;

const sendRoleUpdateEmail = async (userEmail, userName, oldRole, newRole) => {
  try {
    console.log(`📧 Role update notification:`, { to: userEmail, name: userName, oldRole, newRole });

    if (!EMAIL_ENABLED) {
      console.log('⚠️ Email not sent - Email service not configured');
      return { success: false, message: 'Email service not configured' };
    }

    const mailOptions = {
      from: `"BIFA Platform" <${EMAIL_FROM}>`,
      to: userEmail,
      subject: 'Your Role Has Been Updated',
      html: `
        <h2>Role Update Notification</h2>
        <p>Hello ${userName},</p>
        <p>Your role on the BIFA Platform has been updated.</p>
        <p><strong>Previous Role:</strong> ${oldRole}</p>
        <p><strong>New Role:</strong> ${newRole}</p>
        <p>If you have any questions, please contact support@bifa.com</p>
        <br>
        <p>Best regards,<br>BIFA Platform Team</p>
      `
    };

    await transporter.sendMail(mailOptions);
    console.log(`✅ Role update email sent to ${userEmail}`);
    return { success: true, message: 'Email sent successfully' };
  } catch (error) {
    console.error('❌ Failed to send role update email:', error.message);
    return { success: false, error: error.message };
  }
};

const sendMatchAssignmentEmail = async (refereeEmail, refereeName, matchDetails) => {
  try {
    console.log(`📧 Match assignment notification:`, {
      to: refereeEmail,
      referee: refereeName,
      match: `${matchDetails.homeTeam} vs ${matchDetails.awayTeam}`
    });

    if (!EMAIL_ENABLED) {
      console.log('⚠️ Email not sent - Email service not configured');
      return { success: false, message: 'Email service not configured' };
    }

    const mailOptions = {
      from: `"BIFA Platform" <${EMAIL_FROM}>`,
      to: refereeEmail,
      subject: `Match Assignment: ${matchDetails.homeTeam} vs ${matchDetails.awayTeam}`,
      html: `
        <h2>Match Assignment Notification</h2>
        <p>Hello ${refereeName},</p>
        <p>You have been assigned to an upcoming match!</p>
        
        <h3>Match Details:</h3>
        <ul>
          <li><strong>Home Team:</strong> ${matchDetails.homeTeam}</li>
          <li><strong>Away Team:</strong> ${matchDetails.awayTeam}</li>
          <li><strong>Date:</strong> ${matchDetails.date}</li>
          <li><strong>Time:</strong> ${matchDetails.time}</li>
          <li><strong>Venue:</strong> ${matchDetails.venue}</li>
          <li><strong>Your Role:</strong> ${matchDetails.role}</li>
        </ul>
        
        <p>Please confirm your availability as soon as possible.</p>
        <br>
        <p>Best regards,<br>BIFA Platform Team</p>
        <p><small>For support, contact: support@bifa.com</small></p>
      `
    };

    await transporter.sendMail(mailOptions);
    console.log('✅ Match assignment email sent to', refereeEmail);
    return { success: true, message: 'Email sent successfully' };
  } catch (error) {
    console.error('❌ Failed to send match assignment email:', error.message);
    return { success: false, error: error.message };
  }
};

module.exports = { sendRoleUpdateEmail, sendMatchAssignmentEmail };