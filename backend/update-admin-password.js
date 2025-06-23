require('dotenv').config();
const { query } = require('./config/database');

async function updateAdminPassword() {
  try {
    const newHash = '$2a$12$4KoPFX/835GeMuTCWX5AkOgSAT34n5CdwnkKhjXcCC4IsEosynCV.';
    
    console.log('🔄 Updating admin password...');
    
    const result = await query(
      'UPDATE users SET password_hash = $1 WHERE email = $2 RETURNING id, email',
      [newHash, 'admin@gcms.com']
    );
    
    if (result.rows.length > 0) {
      console.log('✅ Admin password updated successfully!');
      console.log(`User ID: ${result.rows[0].id}`);
      console.log(`Email: ${result.rows[0].email}`);
      console.log('');
      console.log('🔑 New login credentials:');
      console.log('Email: admin@gcms.com');
      console.log('Password: Link@babe32');
    } else {
      console.log('❌ Admin user not found');
    }
  } catch (error) {
    console.error('❌ Error updating password:', error.message);
  }
}

updateAdminPassword(); 