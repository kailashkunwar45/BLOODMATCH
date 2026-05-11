const express = require('express');
const mongoose = require('mongoose');
const cors = require('cors');
const helmet = require('helmet');
const dotenv = require('dotenv');
const path = require('path');
const fs = require('fs');

// Load environment variables
dotenv.config();

const app = express();

// --- HIGH PRIORITY DIAGNOSTICS & STATIC SERVING ---

// 1. Resolve dist path absolutely
const distPath = path.resolve(__dirname, '../../frontend/dist');
console.log('🔍 Checking for static assets at:', distPath);

// 2. Request Logger (First Middleware)
app.use((req, res, next) => {
  console.log(`[${new Date().toISOString()}] ${req.method} ${req.url}`);
  next();
});

// 3. Serve Static Files IMMEDIATELY to bypass any security/CORS blocks
if (fs.existsSync(distPath)) {
  console.log('✅ Static assets directory found. Serving...');
  app.use(express.static(distPath));
} else {
  console.warn('⚠️ Static assets directory NOT found at:', distPath);
}

// --- STANDARD MIDDLEWARE ---

// Security Middleware
app.use(helmet({
  contentSecurityPolicy: false, // Disabling CSP for troubleshooting, can be hardened later
}));

// Parsing Middleware
app.use(express.json());

// CORS Configuration - Permissive for debugging
const allowedOrigins = [
  'http://localhost:5173', 
  'http://127.0.0.1:5173',
  'https://bloodmatch-4.onrender.com',
  'https://bloodmatch-unified.onrender.com'
];

app.use(cors({
  origin: (origin, callback) => {
    // If no origin (like mobile/curl) or origin in allowed list
    if (!origin || allowedOrigins.includes(origin) || (origin && origin.includes('onrender.com'))) {
      callback(null, true);
    } else {
      console.warn(`⚠️ CORS blocked request from: ${origin}`);
      callback(new Error(`CORS blocked: ${origin}`));
    }
  },
  credentials: true
}));

// MongoDB Connection
const MONGODB_URI = process.env.MONGODB_URI || 'mongodb://localhost:27017/blood-matcher';
mongoose.connect(MONGODB_URI)
  .then(() => console.log('✅ MongoDB Connected successfully'))
  .catch((err) => console.error('❌ MongoDB Connection Error:', err));

// --- API ROUTES ---
app.use('/api/auth', require('./routes/authRoutes'));
app.use('/api/donors', require('./routes/donorRoutes'));
app.use('/api/hospitals', require('./routes/hospitalRoutes'));
app.use('/api/requests', require('./routes/requestRoutes'));
app.use('/api/admin', require('./routes/adminRoutes'));
app.use('/api/notifications', require('./routes/notificationRoutes'));

// --- HEALTH CHECK ---
app.get('/health', (req, res) => {
  res.status(200).json({ 
    status: 'ok', 
    message: 'BloodMatch API is running',
    timestamp: new Date().toISOString()
  });
});

// --- SPA FALLBACK ---

// Catch-all route for SPA navigation
app.get('/*', (req, res, next) => {
  // Skip API routes
  if (req.path.startsWith('/api')) return next();

  // If we get here, express.static didn't find the file.
  // Check if it's an asset (has an extension) or a page route
  const ext = path.extname(req.path).toLowerCase();
  const staticExtensions = ['.js', '.css', '.png', '.jpg', '.jpeg', '.gif', '.svg', '.ico', '.woff', '.woff2', '.ttf'];
  
  if (staticExtensions.includes(ext) || req.path.includes('/assets/')) {
    return res.status(404).json({
      success: false,
      message: `Asset not found: ${req.path}`,
      path: req.path
    });
  }

  // Serve index.html for SPA routing (Vite build output)
  const indexPath = path.join(distPath, 'index.html');
  if (fs.existsSync(indexPath)) {
    res.sendFile(indexPath);
  } else {
    // If even index.html is missing, we might not have built the frontend yet
    res.status(500).send('Frontend build not found. Please run "npm run build" in the frontend directory.');
  }
});

// Basic error handler
app.use((err, req, res, next) => {
  console.error('❌ Server Error:', err);
  const statusCode = err.statusCode || 500;
  res.status(statusCode).json({
    success: false,
    message: err.message || 'Internal Server Error',
    path: req.path,
    stack: process.env.NODE_ENV === 'development' ? err.stack : undefined
  });
});

const PORT = process.env.PORT || 5000;
app.listen(PORT, () => {
  console.log(`🚀 Server running on port ${PORT}`);
});
