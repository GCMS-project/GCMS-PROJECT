require('dotenv').config();
const { query } = require('./config/database');

async function checkTableStructure() {
  try {
    console.log('🔍 Checking users table structure...');
    
    const result = await query(`
      SELECT column_name, data_type, is_nullable, column_default
      FROM information_schema.columns 
      WHERE table_name = 'users' 
      ORDER BY ordinal_position
    `);
    
    console.log('Users table columns:');
    result.rows.forEach(col => {
      console.log(`  ${col.column_name}: ${col.data_type} (nullable: ${col.is_nullable})`);
    });
    
    // Check constraints
    console.log('\n🔍 Checking constraints...');
    const constraints = await query(`
      SELECT constraint_name, constraint_type
      FROM information_schema.table_constraints 
      WHERE table_name = 'users'
    `);
    
    console.log('Table constraints:');
    constraints.rows.forEach(constraint => {
      console.log(`  ${constraint.constraint_name}: ${constraint.constraint_type}`);
    });
    
  } catch (error) {
    console.error('❌ Error:', error.message);
  }
}

checkTableStructure(); 