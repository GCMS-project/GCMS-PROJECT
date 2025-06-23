require('dotenv').config();
const { query } = require('./config/database');

async function printAdminHash() {
  try {
    const result = await query('SELECT password_hash FROM users WHERE email = $1', ['admin@gcms.com']);
    if (result.rows.length === 0) {
      console.log('❌ Admin user not found');
    } else {
      console.log('🔑 Admin password hash:');
      console.log(result.rows[0].password_hash);
    }
  } catch (error) {
    console.error('❌ Error:', error.message);
  }
}

printAdminHash(); 