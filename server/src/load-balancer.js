import http from 'http';
import net from 'net';
import { URL } from 'url';
import dotenv from 'dotenv';

dotenv.config();

const parseTargets = (value, fallback) =>
  String(value || fallback)
    .split(',')
    .map((target) => target.trim())
    .filter(Boolean)
    .map((target) => new URL(target));

const targetPools = {
  api: parseTargets(process.env.API_TARGETS, 'http://127.0.0.1:5000'),
  ml: parseTargets(process.env.ML_TARGETS, 'http://127.0.0.1:5001'),
  web: parseTargets(process.env.FRONTEND_TARGETS, 'http://127.0.0.1:5173')
};

const cursors = {
  api: 0,
  ml: 0,
  web: 0
};

const nextTarget = (poolName) => {
  const pool = targetPools[poolName];
  const target = pool[cursors[poolName] % pool.length];
  cursors[poolName] += 1;
  return target;
};

const resolvePool = (requestUrl = '') => {
  if (requestUrl.startsWith('/api/') || requestUrl === '/health') {
    return { name: 'api', stripPrefix: '' };
  }

  if (requestUrl === '/ml' || requestUrl.startsWith('/ml/')) {
    return { name: 'ml', stripPrefix: '/ml' };
  }

  return { name: 'web', stripPrefix: '' };
};

const proxyRequest = (clientReq, clientRes) => {
  if (clientReq.url === '/lb-health') {
    clientRes.writeHead(200, { 'content-type': 'application/json' });
    clientRes.end(
      JSON.stringify({
        status: 'OK',
        service: 'mindcare-load-balancer',
        timestamp: new Date().toISOString(),
        targets: Object.fromEntries(
          Object.entries(targetPools).map(([name, pool]) => [
            name,
            pool.map((target) => target.origin)
          ])
        )
      })
    );
    return;
  }

  const pool = resolvePool(clientReq.url);
  const target = nextTarget(pool.name);
  const upstreamPath = pool.stripPrefix
    ? clientReq.url.replace(pool.stripPrefix, '') || '/'
    : clientReq.url;

  const upstreamReq = http.request(
    {
      protocol: target.protocol,
      hostname: target.hostname,
      port: target.port,
      method: clientReq.method,
      path: upstreamPath,
      headers: {
        ...clientReq.headers,
        host: target.host,
        'x-forwarded-host': clientReq.headers.host,
        'x-forwarded-proto': 'http',
        'x-forwarded-for': clientReq.socket.remoteAddress
      }
    },
    (upstreamRes) => {
      clientRes.writeHead(upstreamRes.statusCode || 502, upstreamRes.headers);
      upstreamRes.pipe(clientRes, { end: true });
    }
  );

  upstreamReq.on('error', (error) => {
    clientRes.writeHead(502, { 'content-type': 'application/json' });
    clientRes.end(
      JSON.stringify({
        success: false,
        message: `Load balancer could not reach ${pool.name} target ${target.origin}`,
        error: error.message
      })
    );
  });

  clientReq.pipe(upstreamReq, { end: true });
};

const proxyUpgrade = (clientReq, clientSocket, head) => {
  const pool = resolvePool(clientReq.url);
  const target = nextTarget(pool.name);

  const upstreamSocket = net.connect(Number(target.port), target.hostname, () => {
    upstreamSocket.write(
      `${clientReq.method} ${clientReq.url} HTTP/${clientReq.httpVersion}\r\n` +
        Object.entries({
          ...clientReq.headers,
          host: target.host,
          'x-forwarded-host': clientReq.headers.host,
          'x-forwarded-proto': 'http'
        })
          .map(([key, value]) => `${key}: ${value}`)
          .join('\r\n') +
        '\r\n\r\n'
    );
    upstreamSocket.write(head);
    upstreamSocket.pipe(clientSocket);
    clientSocket.pipe(upstreamSocket);
  });

  upstreamSocket.on('error', () => clientSocket.destroy());
};

const PORT = process.env.LOAD_BALANCER_PORT || 8080;
const server = http.createServer(proxyRequest);

server.on('upgrade', proxyUpgrade);
server.listen(PORT, () => {
  console.log(`MindCare load balancer running on http://127.0.0.1:${PORT}`);
  console.log(`Frontend targets: ${targetPools.web.map((target) => target.origin).join(', ')}`);
  console.log(`API targets: ${targetPools.api.map((target) => target.origin).join(', ')}`);
  console.log(`ML targets: ${targetPools.ml.map((target) => target.origin).join(', ')}`);
});
