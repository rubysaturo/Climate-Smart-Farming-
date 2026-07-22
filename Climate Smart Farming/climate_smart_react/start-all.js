import { spawn } from 'child_process';
import path from 'path';
import { fileURLToPath } from 'url';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

const backendDir = path.resolve(__dirname, '../climate_smart_backend');

console.log('===================================================');
console.log('   AgriSmart Advisory - Starting Unified Servers   ');
console.log('===================================================');

// Start Django Backend
console.log('Starting Django Backend REST API on http://127.0.0.1:8000...');
const backendProcess = spawn('python', ['manage.py', 'runserver', '127.0.0.1:8000'], {
  cwd: backendDir,
  shell: true,
  stdio: 'inherit'
});

backendProcess.on('error', (err) => {
  console.error('[Backend Error] Failed to start Django backend server:', err.message);
});

// Start Vite Frontend
console.log('Starting Vite Frontend...');
const frontendProcess = spawn('npx', ['vite'], {
  cwd: __dirname,
  shell: true,
  stdio: 'inherit'
});

frontendProcess.on('error', (err) => {
  console.error('[Frontend Error] Failed to start Vite frontend server:', err.message);
});

// Handle termination to clean up child processes
const cleanup = () => {
  console.log('\nShutting down servers...');
  try {
    backendProcess.kill('SIGINT');
  } catch (e) {}
  try {
    frontendProcess.kill('SIGINT');
  } catch (e) {}
  process.exit();
};

process.on('SIGINT', cleanup);
process.on('SIGTERM', cleanup);
process.on('exit', cleanup);
