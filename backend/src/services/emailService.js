const prisma = require('../prisma');
const emailjs = require('@emailjs/nodejs');

// EmailJS Configuration
const EMAILJS_SERVICE_ID = process.env.EMAILJS_SERVICE_ID;
const EMAILJS_TEMPLATE_ID = process.env.EMAILJS_TEMPLATE_ID;
const EMAILJS_PUBLIC_KEY = process.env.EMAILJS_PUBLIC_KEY;
const EMAILJS_PRIVATE_KEY = process.env.EMAILJS_PRIVATE_KEY;

const EMAIL_ENABLED = EMAILJS_SERVICE_ID && EMAILJS_PUBLIC_KEY && EMAILJS_PRIVATE_KEY;

if (EMAIL_ENABLED) {
  console.log('✅ Email Service: Enabled with EmailJS');
  console.log('Service ID:', EMAILJS_SERVICE_ID);
  console.log('Template ID:', EMAILJS_TEMPLATE_ID);
} else {
  console.log('⚠️ Email Service: Disabled (EmailJS credentials missing)');
}

const sendRoleUpdateEmail = async (userEmail, userName, oldRole, newRole) => {
  try {
    console.log(`📧 Role update notification:`, {
      to: userEmail,
      name: userName,
      oldRole,
      newRole
    });

    // Create in-app notification
    try {
      const user = await prisma.user.findUnique({ where: { email: userEmail } });
      if (user) {
        // Skip notification creation - Notification model requires athlete which doesn't apply to all users
        console.log(`ℹ️ Skipping in-app notification (schema requires athlete relation)`);
      }
    } catch (dbError) {
      console.warn('⚠️ Could not create in-app notification:', dbError.message);
    }

    // Send email via EmailJS
    if (EMAIL_ENABLED) {
      try {
        console.log('📤 Attempting to send email via EmailJS...');
        console.log('Email params:', {
          service: EMAILJS_SERVICE_ID,
          template: EMAILJS_TEMPLATE_ID,
          to: userEmail
        });

        const response = await emailjs.send(
          EMAILJS_SERVICE_ID,
          EMAILJS_TEMPLATE_ID,
          {
            to_email: userEmail,
            to_name: userName,
            old_role: oldRole,
            new_role: newRole,
            platform_name: 'BRICS Platform',
            support_email: 'support@bifa.com'
          },
          {
            publicKey: EMAILJS_PUBLIC_KEY,
            privateKey: EMAILJS_PRIVATE_KEY
          }
        );
        
        console.log('✅ EmailJS Response:', response);
        console.log(`✅ Email sent successfully to ${userEmail}`);
      } catch (emailError) {
        console.error('❌ EmailJS send failed:', emailError);
        console.error('Error details:', {
          message: emailError.message,
          status: emailError.status,
          text: emailError.text
        });
        throw emailError;
      }
    } else {
      console.log('⚠️ Email not sent - EmailJS not configured');
    }

    console.log(`✅ Role update notification processed for ${userEmail}: ${oldRole} → ${newRole}`);
    return { success: true, message: 'Notification sent successfully' };
  } catch (error) {
    console.error('❌ Failed to send role update notification:', error);
    return { success: false, error: error.message };
  }
};

module.exports = { sendRoleUpdateEmail };