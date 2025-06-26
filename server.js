// Root server.js - Starts the backend server
const path = require('path');
const { spawn } = require('child_process');

console.log('🚀 Starting GCMS Backend Server from root...');
console.log('==========================================');

// Start the backend server
const backendProcess = spawn('node', ['server.js'], {
  cwd: path.join(__dirname, 'backend'),
  stdio: 'inherit',
  env: { ...process.env, NODE_ENV: process.env.NODE_ENV || 'development' }
});

backendProcess.on('error', (error) => {
  console.error('❌ Failed to start backend server:', error.message);
  process.exit(1);
});

backendProcess.on('exit', (code) => {
  console.log(`Backend server exited with code ${code}`);
  process.exit(code);
});

// Handle process termination
process.on('SIGINT', () => {
  console.log('\n🛑 Shutting down server...');
  backendProcess.kill('SIGINT');
});

process.on('SIGTERM', () => {
  console.log('\n🛑 Shutting down server...');
  backendProcess.kill('SIGTERM');
}); 