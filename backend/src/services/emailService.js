const emailjs = require('@emailjs/nodejs');

// Initialize EmailJS with your service ID, template ID, and public key
const EMAILJS_SERVICE_ID = process.env.EMAILJS_SERVICE_ID || 'service_g2e0rdz';
const EMAILJS_TEMPLATE_ID = process.env.EMAILJS_TEMPLATE_ID || 'template_gdw6kor';
const EMAILJS_PUBLIC_KEY = process.env.EMAILJS_PUBLIC_KEY || 'Llol5ilLg7owVcbPl';
const EMAILJS_PRIVATE_KEY = process.env.EMAILJS_PRIVATE_KEY || 'xtoQSQwVRlU-Lktg8Pore';

const sendRoleUpdateEmail = async (userEmail, userName, oldRole, newRole) => {
  try {
    const templateParams = {
      to_email: userEmail,
      to_name: userName,
      old_role: oldRole,
      new_role: newRole,
      platform_name: 'BRICS Platform',
      support_email: 'support@brics.com'
    };

    const response = await emailjs.send(
      EMAILJS_SERVICE_ID,
      EMAILJS_TEMPLATE_ID,
      templateParams,
      {
        publicKey: EMAILJS_PUBLIC_KEY,
        privateKey: EMAILJS_PRIVATE_KEY,
      }
    );

    console.log('Role update email sent successfully:', response);
    return { success: true, response };
  } catch (error) {
    console.error('Failed to send role update email:', error);
    return { success: false, error: error.message };
  }
};

module.exports = { sendRoleUpdateEmail };