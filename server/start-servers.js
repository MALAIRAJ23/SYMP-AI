const { spawn } = require('child_process');
const path = require('path');

console.log('🚀 Starting Medical Symptom Checker Servers...\n');

// Start the original proxy server
const proxyServer = spawn('node', ['hfProxy.js'], {
  cwd: __dirname,
  stdio: 'inherit'
});

console.log('✅ Original proxy server starting on port 5001');

// Start the BERT analysis server
const bertServer = spawn('node', ['bertMedicalAnalysis.js'], {
  cwd: __dirname,
  stdio: 'inherit'
});

console.log('✅ BERT analysis server starting on port 5002');

// Handle process termination
process.on('SIGINT', () => {
  console.log('\n🛑 Shutting down servers...');
  proxyServer.kill();
  bertServer.kill();
  process.exit(0);
});

// Handle server crashes
proxyServer.on('close', (code) => {
  console.log(`❌ Proxy server exited with code ${code}`);
});

bertServer.on('close', (code) => {
  console.log(`❌ BERT server exited with code ${code}`);
});

console.log('\n📋 Server URLs:');
console.log('   Original Proxy: http://localhost:5001');
console.log('   BERT Analysis:  http://localhost:5002');
console.log('\n💡 Press Ctrl+C to stop all servers\n'); 