const { sendMatchAssignmentEmail } = require('../services/emailService');

const testMatchAssignmentEmail = async (req, res) => {
  try {
    console.log('🧪 Testing match assignment email...');
    
    const testEmail = req.query.email || 'test@example.com';
    
    const result = await sendMatchAssignmentEmail(
      testEmail,
      'John Doe',
      {
        homeTeam: 'Manchester United',
        awayTeam: 'Liverpool',
        date: '2024-03-15',
        time: '15:00',
        venue: 'Old Trafford',
        role: 'MAIN_REFEREE'
      }
    );
    
    console.log('✅ Test result:', result);
    res.json({ 
      message: 'Test email sent', 
      result,
      sentTo: testEmail
    });
  } catch (error) {
    console.error('❌ Test failed:', error);
    res.status(500).json({ 
      error: error.message,
      details: error
    });
  }
};

module.exports = { testMatchAssignmentEmail };
