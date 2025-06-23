require('dotenv').config();
const { query } = require('./config/database');

async function updateAdminPassword() {
  try {
    const newHash = '$2a$12$4KoPFX/835GeMuTCWX5AkOgSAT34n5CdwnkKhjXcCC4IsEosynCV.';
    
    console.log('🔄 Updating admin password...');
    console.log('New hash:', newHash);
    
    // First check if admin user exists
    const checkResult = await query('SELECT id, email FROM users WHERE email = $1', ['admin@gcms.com']);
    
    if (checkResult.rows.length === 0) {
      console.log('❌ Admin user not found');
      return;
    }
    
    console.log('✅ Admin user found:', checkResult.rows[0]);
    
    // Update the password
    const updateResult = await query(
      'UPDATE users SET password_hash = $1 WHERE email = $2',
      [newHash, 'admin@gcms.com']
    );
    
    console.log('✅ Password updated successfully!');
    console.log('Rows affected:', updateResult.rowCount);
    
    // Verify the update
    const verifyResult = await query('SELECT password_hash FROM users WHERE email = $1', ['admin@gcms.com']);
    console.log('✅ Verification - New hash:', verifyResult.rows[0].password_hash);
    
    console.log('');
    console.log('🔑 New login credentials:');
    console.log('Email: admin@gcms.com');
    console.log('Password: Link@babe32');
    
  } catch (error) {
    console.error('❌ Error updating password:', error.message);
    console.error('Full error:', error);
  }
}

updateAdminPassword(); 