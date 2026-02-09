// Test referee endpoint
const token = 'YOUR_ADMIN_TOKEN_HERE'; // Get this from localStorage after logging in as admin

fetch('http://localhost:5000/api/referees', {
  method: 'POST',
  headers: {
    'Authorization': `Bearer ${token}`,
    'Content-Type': 'application/json'
  },
  body: JSON.stringify({
    firstName: 'Test',
    lastName: 'Referee',
    email: 'test.referee@bifa.com',
    licenseNumber: 'REF-2024-TEST',
    certification: 'FIFA Level 1',
    experience: 5
  })
})
.then(res => res.json())
.then(data => console.log('Success:', data))
.catch(err => console.error('Error:', err));
