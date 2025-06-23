require('dotenv').config();
const { query } = require('./config/database');

async function testDatabase() {
  try {
    console.log('Testing database connection...');
    
    const result = await query('SELECT NOW() as current_time');
    console.log('✅ Database connection successful!');
    console.log('Current time from DB:', result.rows[0].current_time);
    
    // Test users table
    const usersResult = await query('SELECT COUNT(*) as user_count FROM users');
    console.log('Users in database:', usersResult.rows[0].user_count);
    
    // Test dump_sites table
    const dumpSitesResult = await query('SELECT COUNT(*) as dump_sites_count FROM dump_sites');
    console.log('Dump sites in database:', dumpSitesResult.rows[0].dump_sites_count);
    
    process.exit(0);
  } catch (error) {
    console.error('❌ Database connection failed:', error.message);
    process.exit(1);
  }
}

testDatabase(); 