// using native fetch

async function test() {
  const baseUrl = 'http://localhost:3001/auth';
  const email = `test_${Date.now()}@example.com`;
  const password = 'Password123!';
  
  console.log('Testing SignUp...');
  try {
    const signupRes = await fetch(`${baseUrl}/signup`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ email, password, confirmPassword: password, fullName: 'Test User' })
    });
    console.log('Signup status:', signupRes.status);
    const signupData = await signupRes.json();
    console.log('Signup response:', signupData);

    // Note: since email verify is required to login based on source code, 
    // login will fail with needsVerification unless I bypass it.
    // I will try to see if login returns needsVerification to prove db works.
    
    console.log('Testing Login...');
    const loginRes = await fetch(`${baseUrl}/login`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ email, password })
    });
    console.log('Login status:', loginRes.status);
    const loginData = await loginRes.json();
    console.log('Login response:', loginData);

  } catch (err) {
    console.error(err);
  }
}

test();
