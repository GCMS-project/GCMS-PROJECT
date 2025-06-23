require('dotenv').config();
const { query } = require('./config/database');

async function checkTriggers() {
  try {
    console.log('🔍 Checking triggers on users table...');
    
    const result = await query(`
      SELECT 
        trigger_name,
        event_manipulation,
        action_timing,
        action_statement
      FROM information_schema.triggers 
      WHERE event_object_table = 'users'
    `);
    
    if (result.rows.length === 0) {
      console.log('No triggers found on users table');
    } else {
      console.log('Triggers found:');
      result.rows.forEach(trigger => {
        console.log(`  ${trigger.trigger_name}: ${trigger.action_timing} ${trigger.event_manipulation}`);
        console.log(`    Statement: ${trigger.action_statement}`);
      });
    }
    
    // Check for functions that might be called by triggers
    console.log('\n🔍 Checking functions...');
    const functions = await query(`
      SELECT routine_name, routine_definition
      FROM information_schema.routines 
      WHERE routine_type = 'FUNCTION' 
      AND routine_definition LIKE '%users%'
    `);
    
    if (functions.rows.length > 0) {
      console.log('Functions that reference users table:');
      functions.rows.forEach(func => {
        console.log(`  ${func.routine_name}`);
      });
    }
    
  } catch (error) {
    console.error('❌ Error:', error.message);
  }
}

checkTriggers(); 