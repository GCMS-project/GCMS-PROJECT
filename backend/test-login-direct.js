require('dotenv').config();
const userService = require('./services/userService');

async function testLoginDirect() {
  try {
    console.log('🧪 Testing GCMS Backend Login Directly');
    console.log('=====================================');
    console.log('Testing with admin credentials...');
    console.log('Email: admin@gcms.com');
    console.log('Password: Link@babe32');
    console.log('');

    const result = await userService.login('admin@gcms.com', 'Link@babe32');
    
    console.log('✅ Login successful!');
    console.log('📄 Response:');
    console.log(JSON.stringify(result, null, 2));
    console.log('');
    console.log('🎉 Backend login functionality is working correctly!');
    
  } catch (error) {
    console.log('❌ Login failed!');
    console.log(`Error: ${error.message}`);
    console.log('');
    console.log('💡 This could be due to:');
    console.log('   - Incorrect password');
    console.log('   - Database connection issues');
    console.log('   - User not found');
    console.log('   - Account deactivated');
  }
}

testLoginDirect(); 