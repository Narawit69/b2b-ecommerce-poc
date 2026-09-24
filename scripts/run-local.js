const { spawn } = require('child_process');
const path = require('path');

const ROOT_DIR = path.resolve(__dirname, '..');

const services = [
  { name: 'PD-SERVICE', cwd: path.join(ROOT_DIR, 'services/product-service'), cmd: 'npm', args: ['start'] },
  { name: 'CA-SERVICE', cwd: path.join(ROOT_DIR, 'services/category-service'), cmd: 'npm', args: ['start'] },
  { name: 'FILESTORY', cwd: path.join(ROOT_DIR, 'services/filestory-service'), cmd: 'npm', args: ['start'] },
  { name: 'FRONTEND', cwd: path.join(ROOT_DIR, 'frontend'), cmd: 'npm', args: ['run', 'dev'] },
];

console.log('=====================================================');
console.log('🚀 Starting B2B E-commerce Microservices & Frontend');
console.log('=====================================================');

services.forEach(s => {
  const isWindows = process.platform === 'win32';
  const executable = isWindows ? `${s.cmd}.cmd` : s.cmd;

  const child = spawn(executable, s.args, {
    cwd: s.cwd,
    stdio: 'inherit',
    shell: true
  });

  child.on('error', (err) => {
    console.error(`[${s.name}] Failed to start:`, err);
  });

  child.on('exit', (code) => {
    console.log(`[${s.name}] Process exited with code ${code}`);
  });
});
