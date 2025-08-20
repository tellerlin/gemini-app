import express from 'express';
import cors from 'cors';
import { createProxyMiddleware } from 'http-proxy-middleware';
import path from 'path';
import { fileURLToPath } from 'url';
import { HttpsProxyAgent } from 'https-proxy-agent';
import { HttpProxyAgent } from 'http-proxy-agent';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

const app = express();
const PORT = process.env.PORT || 3001;

// Configure proxy agent if PROXY_URL is set
const PROXY_URL = process.env.PROXY_URL || 'http://192.168.1.3:7890';
let proxyAgent = null;

if (PROXY_URL) {
  try {
    if (PROXY_URL.startsWith('https://')) {
      proxyAgent = new HttpsProxyAgent(PROXY_URL);
    } else {
      proxyAgent = new HttpProxyAgent(PROXY_URL);
    }
    console.log(`🌐 Using proxy: ${PROXY_URL}`);
  } catch (error) {
    console.warn(`⚠️ Failed to configure proxy ${PROXY_URL}:`, error.message);
  }
}

// Enable CORS for all routes
app.use(cors({
  origin: [
    'http://localhost:5173', 
    'http://127.0.0.1:5173', 
    'http://localhost:5174', 
    'http://127.0.0.1:5174',
    'http://100.90.100.8:5173',
    'http://100.90.100.8:5174',
    /^http:\/\/.*:517[34]$/
  ],
  methods: ['GET', 'POST', 'PUT', 'DELETE', 'OPTIONS'],
  allowedHeaders: ['Content-Type', 'Authorization', 'x-goog-api-key'],
  credentials: true
}));

// Parse JSON bodies
app.use(express.json({ limit: '50mb' }));
app.use(express.urlencoded({ limit: '50mb', extended: true }));

// Health check endpoint
app.get('/health', (req, res) => {
  res.json({ status: 'ok', timestamp: new Date().toISOString() });
});

// Proxy for Gemini API with configured proxy support
app.use('/api/gemini', createProxyMiddleware({
  target: 'https://generativelanguage.googleapis.com',
  changeOrigin: true,
  pathRewrite: {
    '^/api/gemini': '', // Remove /api/gemini prefix
  },
  // Use configured proxy agent if available
  ...(proxyAgent && { agent: proxyAgent }),
  onProxyReq: (proxyReq, req, res) => {
    console.log(`[PROXY] ${req.method} ${req.url} -> ${proxyReq.getHeader('host')}${proxyReq.path}`);
    
    // Forward the API key from various possible headers
    const apiKey = req.headers['x-goog-api-key'] || 
                   req.headers['authorization']?.replace('Bearer ', '') ||
                   req.query.key;
    
    if (apiKey) {
      proxyReq.setHeader('x-goog-api-key', apiKey);
    }
    
    // Ensure proper content type for JSON requests
    if (req.body && typeof req.body === 'object') {
      const bodyData = JSON.stringify(req.body);
      proxyReq.setHeader('Content-Type', 'application/json');
      proxyReq.setHeader('Content-Length', Buffer.byteLength(bodyData));
      proxyReq.write(bodyData);
    }
  },
  onProxyRes: (proxyRes, req, res) => {
    // Add CORS headers to the response
    proxyRes.headers['Access-Control-Allow-Origin'] = '*';
    proxyRes.headers['Access-Control-Allow-Methods'] = 'GET, POST, PUT, DELETE, OPTIONS';
    proxyRes.headers['Access-Control-Allow-Headers'] = 'Content-Type, Authorization, x-goog-api-key';
    
    console.log(`[PROXY] Response ${proxyRes.statusCode} for ${req.method} ${req.url}`);
  },
  onError: (err, req, res) => {
    console.error(`[PROXY ERROR] ${req.method} ${req.url}:`, err.message);
    res.status(500).json({ 
      error: 'Proxy error', 
      message: err.message,
      timestamp: new Date().toISOString()
    });
  }
}));

// Handle preflight requests for CORS
app.options('*', (req, res) => {
  res.header('Access-Control-Allow-Origin', '*');
  res.header('Access-Control-Allow-Methods', 'GET, POST, PUT, DELETE, OPTIONS');
  res.header('Access-Control-Allow-Headers', 'Content-Type, Authorization, x-goog-api-key');
  res.sendStatus(200);
});

// Error handling middleware
app.use((err, req, res, next) => {
  console.error('Server error:', err);
  res.status(500).json({ 
    error: 'Internal server error',
    message: err.message,
    timestamp: new Date().toISOString()
  });
});

// 404 handler
app.use((req, res) => {
  res.status(404).json({ 
    error: 'Not found',
    path: req.url,
    timestamp: new Date().toISOString()
  });
});

app.listen(PORT, '0.0.0.0', () => {
  console.log(`🚀 Proxy server running on http://0.0.0.0:${PORT}`);
  console.log(`📡 Proxying Gemini API requests from /api/gemini to Google's API`);
  console.log(`🌐 CORS enabled for external access`);
});