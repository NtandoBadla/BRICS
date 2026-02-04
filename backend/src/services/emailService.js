const emailjs = require('@emailjs/nodejs');

// Initialize EmailJS with your service ID, template ID, and public key
const EMAILJS_SERVICE_ID = process.env.EMAILJS_SERVICE_ID || 'service_g2e0rdz';
const EMAILJS_TEMPLATE_ID = process.env.EMAILJS_TEMPLATE_ID || 'template_gdw6kor';
const EMAILJS_PUBLIC_KEY = process.env.EMAILJS_PUBLIC_KEY || 'Llol5ilLg7owVcbPl';
const EMAILJS_PRIVATE_KEY = process.env.EMAILJS_PRIVATE_KEY || 'xtoQSQwVRlU-Lktg8Pore';

// Log EmailJS configuration status
console.log('EmailJS Configuration:', {
  serviceId: EMAILJS_SERVICE_ID ? 'Set' : 'Missing',
  templateId: EMAILJS_TEMPLATE_ID ? 'Set' : 'Missing',
  publicKey: EMAILJS_PUBLIC_KEY ? 'Set' : 'Missing',
  privateKey: EMAILJS_PRIVATE_KEY ? 'Set' : 'Missing'
});

const sendRoleUpdateEmail = async (userEmail, userName, oldRole, newRole) => {
  try {
    console.log(`📧 Preparing to send role update email:`, {
      to: userEmail,
      name: userName,
      oldRole,
      newRole
    });

    const templateParams = {
      to_email: userEmail,
      to_name: userName,
      old_role: oldRole,
      new_role: newRole,
      platform_name: 'BRICS Platform',
      support_email: 'support@brics.com'
    };

    console.log('📧 Template parameters:', templateParams);

    const response = await emailjs.send(
      EMAILJS_SERVICE_ID,
      EMAILJS_TEMPLATE_ID,
      templateParams,
      {
        publicKey: EMAILJS_PUBLIC_KEY,
        privateKey: EMAILJS_PRIVATE_KEY,
      }
    );

    console.log('✅ Role update email sent successfully:', {
      status: response.status,
      text: response.text
    });
    return { success: true, response };
  } catch (error) {
    console.error('❌ Failed to send role update email:', {
      message: error.message,
      stack: error.stack,
      name: error.name,
      status: error.status,
      text: error.text
    });
    return { success: false, error: error.message, details: error };
  }
};

module.exports = { sendRoleUpdateEmail };