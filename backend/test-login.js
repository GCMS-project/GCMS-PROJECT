const http = require('http');

// Test configuration
const config = {
  hostname: 'localhost',
  port: 3000,
  path: '/api/v1/auth/login',
  method: 'POST',
  headers: {
    'Content-Type': 'application/json'
  }
};

// Test data
const testData = {
  identifier: 'admin@gcms.com',
  password: 'Link@babe32'
};

console.log('🧪 Testing GCMS Backend Login Endpoint');
console.log('=====================================');
console.log(`URL: http://${config.hostname}:${config.port}${config.path}`);
console.log(`Data: ${JSON.stringify(testData, null, 2)}`);
console.log('');

// Make the request
const req = http.request(config, (res) => {
  let data = '';
  
  res.on('data', (chunk) => {
    data += chunk;
  });
  
  res.on('end', () => {
    console.log(`📊 Response Status: ${res.statusCode}`);
    console.log(`📋 Response Headers:`, res.headers);
    console.log('');
    
    try {
      const response = JSON.parse(data);
      console.log('📄 Response Body:');
      console.log(JSON.stringify(response, null, 2));
      console.log('');
      
      if (res.statusCode === 200 && response.success) {
        console.log('✅ Login successful!');
        console.log(`🔑 Token: ${response.data.token.substring(0, 50)}...`);
        console.log(`👤 User: ${response.data.user.first_name} ${response.data.user.last_name}`);
        console.log(`🎭 Role: ${response.data.user.role}`);
        console.log('');
        console.log('🎉 Backend is working correctly!');
      } else {
        console.log('❌ Login failed!');
        console.log(`Error: ${response.message}`);
        console.log(`Code: ${response.code}`);
      }
    } catch (error) {
      console.log('❌ Failed to parse response:', error.message);
      console.log('Raw response:', data);
    }
  });
});

req.on('error', (error) => {
  console.log('❌ Request failed:', error.message);
  console.log('');
  console.log('💡 Make sure the backend server is running:');
  console.log('   cd backend && npm start');
});

// Send the request
req.write(JSON.stringify(testData));
req.end();

console.log('🔄 Sending request...');
console.log(''); 