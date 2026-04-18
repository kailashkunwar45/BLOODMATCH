const express = require('express');
const mongoose = require('mongoose');
const cors = require('cors');
const helmet = require('helmet');
const dotenv = require('dotenv');
const path = require('path');

// Load environment variables
dotenv.config();

const app = express();

// Security Middleware
app.use(helmet({
  contentSecurityPolicy: false, // Turn off CSP if testing locally with maps/external assets, or configure specifically
}));

// Middleware
app.use(express.json());

// MongoDB Connection
const MONGODB_URI = process.env.MONGODB_URI || 'mongodb://localhost:27017/blood-matcher';
mongoose.connect(MONGODB_URI)
  .then(() => console.log('✅ MongoDB Connected successfully'))
  .catch((err) => console.error('❌ MongoDB Connection Error:', err));

// CORS Configuration
const allowedOrigins = [
  'http://localhost:5173', 
  'http://127.0.0.1:5173',
  'https://bloodmatch-4.onrender.com',
  'https://bloodmatch-unified.onrender.com'
];

app.use(cors({
  origin: (origin, callback) => {
    // If no origin (like mobile/curl) or origin in allowed list
    if (!origin || allowedOrigins.includes(origin) || origin.includes('onrender.com')) {
      callback(null, true);
    } else {
      console.warn(`⚠️ CORS blocked request from: ${origin}`);
      // Return a descriptive error instead of a generic one
      callback(new Error(`CORS blocked: ${origin}`));
    }
  },
  credentials: true
}));

// API Routes
app.use('/api/auth', require('./routes/authRoutes'));
app.use('/api/donors', require('./routes/donorRoutes'));
app.use('/api/hospitals', require('./routes/hospitalRoutes'));
app.use('/api/requests', require('./routes/requestRoutes'));
app.use('/api/admin', require('./routes/adminRoutes'));
app.use('/api/notifications', require('./routes/notificationRoutes'));

// Serve Static Files - Use resolve for absolute paths
const distPath = path.resolve(__dirname, '../../frontend/dist');
const fs = require('fs');

if (fs.existsSync(distPath)) {
  console.log('✅ Static assets directory found:', distPath);
  app.use(express.static(distPath));

  // SPA Fallback: Redirect all non-API and non-resource requests to index.html
  app.get('*', (req, res, next) => {
    // Skip API routes
    if (req.path.startsWith('/api')) return next();

    // Skip requests that look like static assets but weren't caught by express.static
    // This prevents serving index.html (HTML) when a .css or .js file is expected.
    const ext = path.extname(req.path).toLowerCase();
    const staticExtensions = ['.js', '.css', '.png', '.jpg', '.jpeg', '.gif', '.svg', '.ico', '.woff', '.woff2', '.ttf'];
    
    if (staticExtensions.includes(ext) || req.path.includes('/assets/')) {
      return res.status(404).json({
        success: false,
        message: `Asset not found: ${req.path}`
      });
    }

    // Serve index.html
    const indexPath = path.join(distPath, 'index.html');
    if (fs.existsSync(indexPath)) {
      res.sendFile(indexPath);
    } else {
      next();
    }
  });
} else {
  console.log('⚠️ Static assets directory NOT found at:', distPath);
  app.get('/', (req, res) => {
    res.send('API is running... (Frontend build not found)');
  });
}

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
