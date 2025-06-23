require('dotenv').config();
const { query } = require('./config/database');

async function testSimple() {
  try {
    console.log('🧪 Simple GCMS Backend Test');
    console.log('===========================');
    
    // Test 1: Database connection
    console.log('\n1️⃣ Testing database connection...');
    const timeResult = await query('SELECT NOW() as current_time');
    console.log('✅ Database connected:', timeResult.rows[0].current_time);
    
    // Test 2: Check if admin user exists
    console.log('\n2️⃣ Checking admin user...');
    const userResult = await query(
      'SELECT id, email, first_name, last_name, role, is_active FROM users WHERE email = $1',
      ['admin@gcms.com']
    );
    
    if (userResult.rows.length > 0) {
      const user = userResult.rows[0];
      console.log('✅ Admin user found:');
      console.log(`   ID: ${user.id}`);
      console.log(`   Email: ${user.email}`);
      console.log(`   Name: ${user.first_name} ${user.last_name}`);
      console.log(`   Role: ${user.role}`);
      console.log(`   Active: ${user.is_active}`);
    } else {
      console.log('❌ Admin user not found');
    }
    
    // Test 3: Check dump sites
    console.log('\n3️⃣ Checking dump sites...');
    const dumpSitesResult = await query('SELECT COUNT(*) as count FROM dump_sites');
    console.log(`✅ Found ${dumpSitesResult.rows[0].count} dump sites`);
    
    // Test 4: Check roles
    console.log('\n4️⃣ Checking roles...');
    const rolesResult = await query('SELECT COUNT(*) as count FROM roles');
    console.log(`✅ Found ${rolesResult.rows[0].count} roles`);
    
    console.log('\n🎉 All basic tests passed!');
    console.log('\n💡 Next steps:');
    console.log('   - Start the server: npm start');
    console.log('   - Test login: node test-login.js');
    console.log('   - View API docs: http://localhost:3000/api-docs');
    
  } catch (error) {
    console.error('❌ Test failed:', error.message);
    console.error('Stack:', error.stack);
  }
}

testSimple(); 