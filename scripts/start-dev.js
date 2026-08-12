const net = require('net');
const { spawn } = require('child_process');

function checkPort(port, host) {
  return new Promise((resolve) => {
    const server = net.createServer();
    server.once('error', () => resolve(false));
    server.once('listening', () => {
      server.close(() => resolve(true));
    });
    server.listen({ port, host, exclusive: true });
  });
}

function checkConnect(port, host) {
  return new Promise((resolve) => {
    const socket = new net.Socket();
    socket.setTimeout(200);
    socket.once('connect', () => {
      socket.destroy();
      resolve(true);
    });
    socket.once('error', () => {
      socket.destroy();
      resolve(false);
    });
    socket.once('timeout', () => {
      socket.destroy();
      resolve(false);
    });
    socket.connect(port, host);
  });
}

async function isPortAvailable(port) {
  const free127 = await checkPort(port, '127.0.0.1');
  if (!free127) return false;

  const free0 = await checkPort(port, '0.0.0.0');
  if (!free0) return false;

  const connected127 = await checkConnect(port, '127.0.0.1');
  if (connected127) return false;

  const connectedLocalhost = await checkConnect(port, 'localhost');
  if (connectedLocalhost) return false;

  return true;
}

async function findAvailablePort(startPort) {
  let port = startPort;
  while (!(await isPortAvailable(port))) {
    port++;
  }
  return port;
}

const DEFAULT_PORT = 4200;

findAvailablePort(DEFAULT_PORT).then((port) => {
  if (port !== DEFAULT_PORT) {
    console.log(`Port ${DEFAULT_PORT} is in use. Switching to next available port: ${port}`);
  } else {
    console.log(`Starting Angular dev server on port: ${port}`);
  }

  const isWin = process.platform === 'win32';
  const command = isWin ? 'cmd.exe' : 'npx';
  const args = isWin 
    ? ['/c', 'npx', 'ng', 'serve', '--port', port.toString()] 
    : ['ng', 'serve', '--port', port.toString()];

  const child = spawn(command, args, {
    stdio: 'inherit'
  });

  child.on('error', (err) => {
    console.error('Failed to start Angular CLI:', err);
  });
});
