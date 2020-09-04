// A simple proxy for dealing with Auto-CORS when performing local development.
const httpProxy = require('http-proxy');
const PORT = process.env.IDAPI_PROXY_PORT;
const TARGET = process.env.IDAPI_PROXY_TARGET;
const FAKE_ORIGIN = process.env.IDAPI_PROXY_ORIGIN;
const proxy = httpProxy.createProxyServer({
  target: TARGET,
  secure: false,
  changeOrigin: true,
});
proxy.on('proxyReq', (proxyReq) => {
  proxyReq.setHeader('origin', FAKE_ORIGIN);
});
console.log('idapi proxy server starting on:', PORT);
proxy.listen(PORT);
