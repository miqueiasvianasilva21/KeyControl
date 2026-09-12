const express = require('express');
const { createProxyMiddleware } = require('http-proxy-middleware');
const path = require('path');

const app = express();
const PORT = Number(process.env.PORT) || 80;
const BACKEND_URL = process.env.BACKEND_URL || 'http://backend:3000';

// Reverse proxy /api requests to the backend service
app.use(
  '/api',
  createProxyMiddleware({
    target: BACKEND_URL,
    changeOrigin: true,
    pathRewrite: {
      '^/api': '',
    },
    onError: (err, req, res) => {
      console.error(`[Proxy Error] ${req.method} ${req.url} -> ${BACKEND_URL}:`, err.message);
      if (!res.headersSent) {
        res.status(502).json({
          error: 'Falha ao se comunicar com o backend.',
          details: err.message,
        });
      }
    },
  })
);

// Serve static build from dist folder
const distPath = path.join(__dirname, 'dist');
app.use(express.static(distPath));

// SPA fallback for HTML5 History API client routes
app.get('*', (req, res) => {
  res.sendFile(path.join(distPath, 'index.html'));
});

app.listen(PORT, '0.0.0.0', () => {
  console.log(`Frontend server running on http://0.0.0.0:${PORT}`);
  console.log(`Proxying /api/* to ${BACKEND_URL}/*`);
});
