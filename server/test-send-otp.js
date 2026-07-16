const BASE_URL = 'http://localhost:5000/api';

const testSend = async () => {
  console.log('Sending OTP request to running backend...');
  try {
    const response = await fetch(`${BASE_URL}/otp/send`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ target: 'krishnaprajapati_test@gmail.com', type: 'email' })
    });
    const data = await response.json();
    console.log('Response Status:', response.status);
    console.log('Response Body:', data);
  } catch (err) {
    console.error('Request failed:', err);
  }
};

testSend();
