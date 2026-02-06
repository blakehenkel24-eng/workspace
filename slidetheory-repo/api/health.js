// /api/health.js - Health check endpoint
module.exports = (req, res) => {
  res.setHeader('Access-Control-Allow-Origin', '*');
  
  res.status(200).json({
    status: 'ok',
    version: '2.0.0',
    timestamp: new Date().toISOString(),
    environment: 'production',
    features: {
      aiGeneration: true,
      exports: ['png', 'pptx', 'pdf'],
    },
  });
};
