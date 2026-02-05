/**
 * Request Validator Middleware
 * Validates incoming request data
 */

const { STATUS, ERROR_CODES, SLIDE_TYPES, LIMITS } = require('../config/constants');
const { AppError } = require('./error-handler');

/**
 * Validation rules
 */
const rules = {
  generateSlide: {
    slideType: {
      required: true,
      validate: (value) => SLIDE_TYPES.includes(value),
      message: `slideType must be one of: ${SLIDE_TYPES.join(', ')}`
    },
    context: {
      required: true,
      type: 'string',
      minLength: LIMITS.MIN_CONTEXT_LENGTH,
      maxLength: LIMITS.MAX_CONTEXT_LENGTH,
      message: `context must be between ${LIMITS.MIN_CONTEXT_LENGTH} and ${LIMITS.MAX_CONTEXT_LENGTH} characters`
    },
    targetAudience: {
      required: true,
      type: 'string',
      message: 'targetAudience is required'
    },
    dataPoints: {
      required: false,
      type: 'array',
      maxItems: LIMITS.MAX_DATA_POINTS,
      message: `dataPoints must be an array with max ${LIMITS.MAX_DATA_POINTS} items`
    },
    framework: {
      required: false,
      type: 'string',
      message: 'framework must be a string'
    }
  },
  
  exportSlide: {
    slideType: {
      required: true,
      validate: (value) => SLIDE_TYPES.includes(value),
      message: 'slideType is required and must be valid'
    },
    content: {
      required: true,
      type: 'object',
      message: 'content object is required'
    }
  }
};

/**
 * Validate a field against rules
 */
function validateField(field, value, rule) {
  const errors = [];
  
  // Required check
  if (rule.required && (value === undefined || value === null || value === '')) {
    errors.push({ field, message: `${field} is required` });
    return errors;
  }
  
  // Skip further validation if not required and empty
  if (!rule.required && (value === undefined || value === null || value === '')) {
    return errors;
  }
  
  // Type check
  if (rule.type) {
    const actualType = Array.isArray(value) ? 'array' : typeof value;
    if (actualType !== rule.type) {
      errors.push({ field, message: `${field} must be a ${rule.type}` });
      return errors;
    }
  }
  
  // String length checks
  if (typeof value === 'string') {
    if (rule.minLength && value.length < rule.minLength) {
      errors.push({ field, message: `${field} must be at least ${rule.minLength} characters` });
    }
    if (rule.maxLength && value.length > rule.maxLength) {
      errors.push({ field, message: `${field} must be at most ${rule.maxLength} characters` });
    }
  }
  
  // Array checks
  if (Array.isArray(value) && rule.maxItems && value.length > rule.maxItems) {
    errors.push({ field, message: `${field} must have at most ${rule.maxItems} items` });
  }
  
  // Custom validation
  if (rule.validate && !rule.validate(value)) {
    errors.push({ field, message: rule.message || `${field} is invalid` });
  }
  
  return errors;
}

/**
 * Create validation middleware for a specific rule set
 */
function validate(ruleName) {
  const ruleSet = rules[ruleName];
  
  if (!ruleSet) {
    throw new Error(`Unknown validation rule: ${ruleName}`);
  }
  
  return (req, res, next) => {
    const errors = [];
    const body = req.body || {};
    
    // Validate each field
    for (const [field, rule] of Object.entries(ruleSet)) {
      const fieldErrors = validateField(field, body[field], rule);
      errors.push(...fieldErrors);
    }
    
    if (errors.length > 0) {
      return res.status(STATUS.BAD_REQUEST).json({
        success: false,
        error: ERROR_CODES.VALIDATION_ERROR,
        message: 'Invalid input',
        errors
      });
    }
    
    next();
  };
}

/**
 * Validate request parameters
 */
function validateParams(...paramNames) {
  return (req, res, next) => {
    const errors = [];
    
    for (const param of paramNames) {
      if (!req.params[param]) {
        errors.push({ field: param, message: `${param} is required` });
      }
    }
    
    if (errors.length > 0) {
      return res.status(STATUS.BAD_REQUEST).json({
        success: false,
        error: ERROR_CODES.VALIDATION_ERROR,
        message: 'Invalid parameters',
        errors
      });
    }
    
    next();
  };
}

module.exports = {
  validate,
  validateParams,
  rules
};
