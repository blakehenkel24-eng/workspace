// Express server for SlideTheory API
// Supports both Vercel serverless and standalone modes

const express = require('express');
const cors = require('cors');
require('dotenv').config();

const app = express();

// Middleware
app.use(cors());
app.use(express.json({ limit: '10mb' }));

// Import route handlers
const signupHandler = require('./auth/signup').default;
const loginHandler = require('./auth/login').default;
const generateSlideHandler = require('./slides/generate').default;
const saveSlideHandler = require('./slides/index').default;
const listSlidesHandler = require('./slides/list').default;
const slideByIdHandler = require('./slides/[id]').default;

// Helper to convert Express req/res to handler format
function adaptHandler(handler) {
  return async (req, res) => {
    // Add query to req for [id].js handler
    req.query = { ...req.params, ...req.query };
    return handler(req, res);
  };
}

// Auth Routes
app.post('/api/auth/signup', adaptHandler(signupHandler));
app.post('/api/auth/login', adaptHandler(loginHandler));

// Slide Routes
app.post('/api/slides/generate', adaptHandler(generateSlideHandler));
app.post('/api/slides', adaptHandler(saveSlideHandler));
app.get('/api/slides', adaptHandler(listSlidesHandler));
app.get('/api/slides/:id', adaptHandler(slideByIdHandler));
app.delete('/api/slides/:id', adaptHandler(slideByIdHandler));

// Health check
app.get('/api/health', (req, res) => {
  res.json({
    status: 'ok',
    timestamp: new Date().toISOString(),
    version: '1.0.0'
  });
});

// 404 handler
app.use((req, res) => {
  res.status(404).json({
    success: false,
    error: 'Not found'
  });
});

// Error handler
app.use((err, req, res, next) => {
  console.error('Server error:', err);
  res.status(500).json({
    success: false,
    error: 'Internal server error'
  });
});

// Start server if running directly (not as Vercel function)
if (require.main === module) {
  const PORT = process.env.PORT || 3000;
  app.listen(PORT, () => {
    console.log(`SlideTheory API server running on port ${PORT}`);
    console.log(`Health check: http://localhost:${PORT}/api/health`);
  });
}

// Export for Vercel
module.exports = app;
