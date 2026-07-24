import { spawn } from 'child_process';
import path from 'path';
import { fileURLToPath } from 'url';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

const backendDir = path.resolve(__dirname, '../climate_smart_backend');

console.log('===================================================');
console.log('   AgriSmart Advisory - Unified Dev Server   ');
console.log('===================================================');

// Start Vite Frontend
console.log('Starting Vite Frontend on http://localhost:5173...');
const frontendProcess = spawn('npx', ['vite'], {
  cwd: __dirname,
  shell: true,
  stdio: 'inherit'
});

frontendProcess.on('error', (err) => {
  console.error('[Frontend Error] Failed to start Vite frontend server:', err.message);
});

// Optionally try starting Django Backend if available
console.log('Checking Django Backend REST API on http://127.0.0.1:8000...');
const backendProcess = spawn('python', ['manage.py', 'runserver', '127.0.0.1:8000'], {
  cwd: backendDir,
  shell: true,
  stdio: 'inherit'
});

backendProcess.on('error', () => {
  console.log('[Notice] Django backend not detected or unconfigured. Supabase cloud database active.');
});

// Handle termination to clean up child processes
const cleanup = () => {
  console.log('\nShutting down dev servers...');
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
