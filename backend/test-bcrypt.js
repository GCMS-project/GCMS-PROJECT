const bcrypt = require('bcryptjs');

const newPassword = 'Link@babe32';

bcrypt.hash(newPassword, 12, (err, hash) => {
  if (err) {
    console.error('❌ Error:', err.message);
  } else {
    console.log('🔑 Hash for password:', newPassword);
    console.log(hash);
  }
}); 