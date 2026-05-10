import { spawn } from 'child_process';
import http from 'http';
import path from 'path';
import { fileURLToPath } from 'url';

const __filename = fileURLToPath(import.meta.url);
const rootDir = path.resolve(path.dirname(__filename), '..');
const isWindows = process.platform === 'win32';
const children = [];

const services = [
  {
    name: 'ML',
    url: 'http://127.0.0.1:5001/health',
    command: isWindows ? 'python.exe' : 'python3',
    args: ['app.py'],
    cwd: path.join(rootDir, 'ml-service')
  },
  {
    name: 'Backend',
    url: 'http://127.0.0.1:5000/health',
    command: 'node',
    args: ['src/server.js'],
    cwd: path.join(rootDir, 'server')
  },
  {
    name: 'Frontend',
    url: 'http://127.0.0.1:5173',
    command: 'node',
    args: ['serve-dist.js'],
    cwd: path.join(rootDir, 'client')
  },
  {
    name: 'Load Balancer',
    url: 'http://127.0.0.1:8080/lb-health',
    command: 'node',
    args: ['src/load-balancer.js'],
    cwd: path.join(rootDir, 'server')
  }
];

const isHealthy = (url) =>
  new Promise((resolve) => {
    const req = http.get(url, { timeout: 1500 }, (res) => {
      res.resume();
      resolve(res.statusCode >= 200 && res.statusCode < 500);
    });

    req.on('timeout', () => {
      req.destroy();
      resolve(false);
    });
    req.on('error', () => resolve(false));
  });

const waitForHealthy = async (service, attempts = 20) => {
  for (let attempt = 0; attempt < attempts; attempt += 1) {
    if (await isHealthy(service.url)) {
      return true;
    }
    await new Promise((resolve) => setTimeout(resolve, 1000));
  }
  return false;
};

const startService = (service) => {
  const child = spawn(service.command, service.args, {
    cwd: service.cwd,
    env: process.env,
    stdio: ['ignore', 'pipe', 'pipe'],
    windowsHide: true
  });

  child.stdout.on('data', (data) => process.stdout.write(`[${service.name}] ${data}`));
  child.stderr.on('data', (data) => process.stderr.write(`[${service.name}] ${data}`));
  child.on('exit', (code) => {
    if (code !== 0 && code !== null) {
      console.error(`[${service.name}] exited with code ${code}`);
    }
  });

  children.push(child);
};

const shutdown = () => {
  for (const child of children) {
    if (!child.killed) {
      child.kill();
    }
  }
  process.exit(0);
};

process.on('SIGINT', shutdown);
process.on('SIGTERM', shutdown);

console.log('Starting MindCare AI complete project...');

for (const service of services) {
  if (await isHealthy(service.url)) {
    console.log(`${service.name} is already running.`);
    continue;
  }

  console.log(`Starting ${service.name}...`);
  startService(service);
}

for (const service of services) {
  const healthy = await waitForHealthy(service);
  console.log(`${service.name}: ${healthy ? 'ready' : 'not responding yet'} - ${service.url}`);
}

console.log('');
console.log('Direct app link: http://127.0.0.1:5173');
console.log('Complete project through load balancer: http://127.0.0.1:8080');
console.log('Backend health: http://127.0.0.1:5000/health');
console.log('ML health: http://127.0.0.1:5001/health');
console.log('');
console.log('Keep this terminal open while using the app. Press Ctrl+C to stop services started here.');

setInterval(() => {}, 1000);
