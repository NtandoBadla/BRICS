const API_URL = 'http://localhost:5000';

async function createAdmin() {
  try {
    const response = await fetch(`${API_URL}/api/auth/register`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        email: 'admin@bifa.com',
        password: 'admin123',
        firstName: 'Admin',
        lastName: 'User',
        role: 'ADMIN'
      })
    });

    if (response.ok) {
      const data = await response.json();
      console.log('Admin user created successfully');
      console.log('Email: admin@bifa.com');
      console.log('Password: admin123');
    } else {
      const error = await response.json();
      console.log('Error:', error.error);
    }
  } catch (error) {
    console.log('Connection error:', error.message);
    console.log('Make sure backend is running on http://localhost:5000');
  }
}

createAdmin();