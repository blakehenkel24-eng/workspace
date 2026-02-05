/**
 * Application Constants
 * Centralized constants for the application
 */

module.exports = {
  // Version
  VERSION: '1.1.1',
  
  // HTTP Status Codes
  STATUS: {
    OK: 200,
    CREATED: 201,
    BAD_REQUEST: 400,
    UNAUTHORIZED: 401,
    FORBIDDEN: 403,
    NOT_FOUND: 404,
    CONFLICT: 409,
    UNPROCESSABLE: 422,
    INTERNAL_ERROR: 500,
    SERVICE_UNAVAILABLE: 503
  },
  
  // Error Codes
  ERROR_CODES: {
    VALIDATION_ERROR: 'VALIDATION_ERROR',
    GENERATION_FAILED: 'GENERATION_FAILED',
    EXPORT_FAILED: 'EXPORT_FAILED',
    NOT_FOUND: 'NOT_FOUND',
    INTERNAL_ERROR: 'INTERNAL_ERROR',
    FORBIDDEN: 'FORBIDDEN',
    TEMPLATE_ERROR: 'TEMPLATE_ERROR',
    STATS_ERROR: 'STATS_ERROR',
    INVALID_INPUT: 'INVALID_INPUT'
  },
  
  // Slide Types
  SLIDE_TYPES: [
    'Executive Summary',
    'Market Analysis',
    'Financial Model',
    'Competitive Analysis',
    'Growth Strategy',
    'Risk Assessment'
  ],
  
  // Export Formats
  EXPORT_FORMATS: ['png', 'pptx', 'pdf', 'zip'],
  
  // Aspect Ratios
  ASPECT_RATIOS: ['16:9', '4:3', 'widescreen', 'letter', 'a4'],
  
  // Quality Levels
  QUALITY_LEVELS: ['low', 'medium', 'high', 'ultra'],
  
  // Colors (McKinsey-style palette)
  COLORS: {
    navy: '003366',
    navyLight: '1a4d7a',
    gray: 'F5F5F5',
    grayDark: '666666',
    accent: '4A90E2',
    white: 'FFFFFF',
    black: '1a1a1a',
    green: '16a34a',
    red: 'dc2626'
  },
  
  // File Limits
  LIMITS: {
    MAX_CONTEXT_LENGTH: 2000,
    MIN_CONTEXT_LENGTH: 10,
    MAX_REQUEST_SIZE: '2mb',
    MAX_DATA_POINTS: 10,
    MAX_TITLE_LENGTH: 100
  },
  
  // Time Constants
  TIME: {
    SLIDE_EXPIRY_MS: 24 * 60 * 60 * 1000, // 24 hours
    EXPORT_EXPIRY_MS: 60 * 60 * 1000, // 1 hour
    CLEANUP_INTERVAL_MS: 60 * 60 * 1000 // 1 hour
  },
  
  // Messages
  MESSAGES: {
    GENERATION_FAILED: 'Failed to generate slide. Please try again.',
    AI_NOT_CONFIGURED: 'AI service not configured. Please check your API key.',
    TIMEOUT: 'Generation timed out. Please try with a shorter context.',
    RATE_LIMIT: 'Too many requests. Please wait a moment and try again.',
    EXPORT_FAILED: 'Failed to generate export. Please try again.',
    NOT_FOUND: 'Resource not found.',
    INTERNAL_ERROR: 'An unexpected error occurred. Please refresh and try again.'
  }
};
