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
        await prisma.notification.create({
          data: {
            userId: user.id,
            type: 'ROLE_CHANGE',
            title: 'Role Updated',
            message: `Your role has been changed from ${oldRole} to ${newRole}`,
            read: false
          }
        });
        console.log(`✅ In-app notification created for ${userEmail}`);
      }
    } catch (dbError) {
      console.warn('⚠️ Could not create in-app notification:', dbError.message);
    }

    // Send email via EmailJS
    if (EMAIL_ENABLED) {
      try {
        await emailjs.send(
          EMAILJS_SERVICE_ID,
          EMAILJS_TEMPLATE_ID,
          {
            to_email: userEmail,
            to_name: userName,
            old_role: oldRole,
            new_role: newRole,
            message: `Your role has been updated from ${oldRole} to ${newRole}. You can now access features and permissions associated with your new role.`
          },
          {
            publicKey: EMAILJS_PUBLIC_KEY,
            privateKey: EMAILJS_PRIVATE_KEY
          }
        );
        console.log(`✅ Email sent to ${userEmail} via EmailJS`);
      } catch (emailError) {
        console.error('❌ EmailJS send failed:', emailError.message);
      }
    }

    console.log(`✅ Role update notification processed for ${userEmail}: ${oldRole} → ${newRole}`);
    return { success: true, message: 'Notification sent successfully' };
  } catch (error) {
    console.error('❌ Failed to send role update notification:', error);
    return { success: false, error: error.message };
  }
};

module.exports = { sendRoleUpdateEmail };