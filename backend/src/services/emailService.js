// Log EmailJS configuration status
console.log('Email Service: Using console logging (EmailJS disabled for server environment)');

const sendRoleUpdateEmail = async (userEmail, userName, oldRole, newRole) => {
  try {
    console.log(`📧 Role update notification:`, {
      to: userEmail,
      name: userName,
      oldRole,
      newRole
    });

    // EmailJS doesn't work in server environments, so we'll just log for now
    // In production, you would integrate with a proper email service like SendGrid, AWS SES, etc.
    console.log(`✅ Role update notification logged for ${userEmail}: ${oldRole} → ${newRole}`);
    return { success: true, message: 'Email notification logged' };
  } catch (error) {
    console.error('❌ Failed to send role update email:', error);
    return { success: false, error: error.message };
  }
};

module.exports = { sendRoleUpdateEmail };