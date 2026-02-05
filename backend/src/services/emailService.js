const prisma = require('../prisma');

// Email service configuration
const EMAIL_ENABLED = process.env.EMAIL_SERVICE_ENABLED === 'true';
const EMAIL_FROM = process.env.EMAIL_FROM || 'noreply@bifa.com';

console.log('Email Service:', EMAIL_ENABLED ? 'Enabled' : 'Using console logging (disabled for server environment)');

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

    // If email service is enabled, send actual email
    if (EMAIL_ENABLED) {
      // TODO: Integrate with SendGrid, AWS SES, or other email service
      console.log(`📧 Email would be sent to ${userEmail}`);
    }

    console.log(`✅ Role update notification processed for ${userEmail}: ${oldRole} → ${newRole}`);
    return { success: true, message: 'Notification sent successfully' };
  } catch (error) {
    console.error('❌ Failed to send role update notification:', error);
    return { success: false, error: error.message };
  }
};

module.exports = { sendRoleUpdateEmail };