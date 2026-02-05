/**
 * SlideTheory MVP - Input Validators v1.0
 * Validates user inputs and parses data files
 */

const fs = require('fs').promises;
const path = require('path');

// Valid slide types supported by the system
const VALID_SLIDE_TYPES = [
  'Executive Summary',
  'Market Analysis', 
  'Financial Model',
  'Competitive Analysis',
  'Growth Strategy',
  'Risk Assessment'
];

// Valid audience types
const VALID_AUDIENCES = [
  'C-Suite',
  'Board',
  'Investors',
  'PE',
  'VC',
  'Internal',
  'External',
  'Sales',
  'Operations',
  'General'
];

// Valid presentation modes
const VALID_PRESENTATION_MODES = [
  'live',
  'email',
  'pre-read',
  'board-deck',
  'pitch-deck'
];

/**
 * Validation result type
 * @typedef {Object} ValidationResult
 * @property {boolean} isValid
 * @property {Array<{field: string, message: string}>} errors
 * @property {Object} parsedData - Cleaned/transformed data if valid
 */

/**
 * Validate slide generation request
 * @param {Object} inputs - Raw user inputs
 * @returns {ValidationResult}
 */
function validateSlideInputs(inputs) {
  const errors = [];
  const parsedData = {};

  // Required fields
  if (!inputs.slideType) {
    errors.push({ field: 'slideType', message: 'Slide type is required' });
  } else if (!VALID_SLIDE_TYPES.includes(inputs.slideType)) {
    errors.push({ 
      field: 'slideType', 
      message: `Invalid slide type. Must be one of: ${VALID_SLIDE_TYPES.join(', ')}`
    });
  } else {
    parsedData.slideType = inputs.slideType;
  }

  // Context validation
  if (!inputs.context) {
    errors.push({ field: 'context', message: 'Context is required' });
  } else if (typeof inputs.context !== 'string') {
    errors.push({ field: 'context', message: 'Context must be a string' });
  } else if (inputs.context.length < 10) {
    errors.push({ field: 'context', message: 'Context must be at least 10 characters' });
  } else if (inputs.context.length > 5000) {
    errors.push({ field: 'context', message: 'Context must be less than 5000 characters' });
  } else {
    parsedData.context = inputs.context.trim();
  }

  // Audience validation
  if (!inputs.audience && !inputs.targetAudience) {
    errors.push({ field: 'audience', message: 'Target audience is required' });
  } else {
    const audience = inputs.audience || inputs.targetAudience;
    if (!VALID_AUDIENCES.includes(audience)) {
      // Allow custom audiences but warn
      parsedData.audience = audience;
    } else {
      parsedData.audience = audience;
    }
  }

  // Presentation mode (optional)
  if (inputs.presentationMode) {
    if (!VALID_PRESENTATION_MODES.includes(inputs.presentationMode)) {
      errors.push({ 
        field: 'presentationMode', 
        message: `Invalid mode. Must be one of: ${VALID_PRESENTATION_MODES.join(', ')}`
      });
    } else {
      parsedData.presentationMode = inputs.presentationMode;
    }
  } else {
    parsedData.presentationMode = 'live';
  }

  // Key takeaway (optional but recommended)
  if (inputs.keyTakeaway) {
    if (typeof inputs.keyTakeaway !== 'string') {
      errors.push({ field: 'keyTakeaway', message: 'Key takeaway must be a string' });
    } else if (inputs.keyTakeaway.length > 500) {
      errors.push({ field: 'keyTakeaway', message: 'Key takeaway must be less than 500 characters' });
    } else {
      parsedData.keyTakeaway = inputs.keyTakeaway.trim();
    }
  }

  // Framework (optional)
  if (inputs.framework) {
    parsedData.framework = inputs.framework;
  }

  // Data validation (can be array, string, or file path)
  if (inputs.data) {
    const dataResult = validateAndParseData(inputs.data);
    if (!dataResult.isValid) {
      errors.push(...dataResult.errors);
    } else {
      parsedData.data = dataResult.parsed;
    }
  }

  // Data points (legacy support)
  if (inputs.dataPoints) {
    if (!Array.isArray(inputs.dataPoints)) {
      errors.push({ field: 'dataPoints', message: 'Data points must be an array' });
    } else {
      parsedData.dataPoints = inputs.dataPoints.filter(dp => dp && typeof dp === 'string');
    }
  }

  return {
    isValid: errors.length === 0,
    errors,
    parsedData
  };
}

/**
 * Validate and parse data input (CSV, JSON, or array)
 * @param {string|Array|Object} data - Raw data input
 * @returns {Object} - { isValid, errors, parsed }
 */
function validateAndParseData(data) {
  const errors = [];
  
  // If already an array, validate structure
  if (Array.isArray(data)) {
    return {
      isValid: true,
      errors: [],
      parsed: data.map(item => {
        if (typeof item === 'string') return item;
        if (typeof item === 'object' && item !== null) return item;
        return String(item);
      })
    };
  }

  // If object, validate it's a valid data structure
  if (typeof data === 'object' && data !== null) {
    return {
      isValid: true,
      errors: [],
      parsed: data
    };
  }

  // If string, try to parse as CSV or detect format
  if (typeof data === 'string') {
    // Check if it's a file path
    if (data.endsWith('.csv') || data.endsWith('.xlsx') || data.endsWith('.xls')) {
      return {
        isValid: true,
        errors: [],
        parsed: { filePath: data, type: 'file' }
      };
    }

    // Try parsing as CSV
    const csvResult = parseCSVString(data);
    if (csvResult.isValid) {
      return {
        isValid: true,
        errors: [],
        parsed: csvResult.data
      };
    }

    // Try parsing as JSON
    try {
      const jsonData = JSON.parse(data);
      return {
        isValid: true,
        errors: [],
        parsed: jsonData
      };
    } catch (e) {
      // Not valid JSON, treat as plain text data points
      return {
        isValid: true,
        errors: [],
        parsed: data.split('\n').filter(line => line.trim())
      };
    }
  }

  errors.push({ field: 'data', message: 'Unable to parse data format' });
  return { isValid: false, errors, parsed: null };
}

/**
 * Parse CSV string into structured data
 * @param {string} csvString - Raw CSV content
 * @returns {Object} - { isValid, data }
 */
function parseCSVString(csvString) {
  try {
    const lines = csvString.split('\n').filter(line => line.trim());
    if (lines.length < 2) {
      return { isValid: false, data: null };
    }

    // Simple CSV parsing (handles quoted values)
    const parseLine = (line) => {
      const result = [];
      let current = '';
      let inQuotes = false;
      
      for (let i = 0; i < line.length; i++) {
        const char = line[i];
        const nextChar = line[i + 1];
        
        if (char === '"') {
          if (inQuotes && nextChar === '"') {
            current += '"';
            i++; // Skip next quote
          } else {
            inQuotes = !inQuotes;
          }
        } else if (char === ',' && !inQuotes) {
          result.push(current.trim());
          current = '';
        } else {
          current += char;
        }
      }
      result.push(current.trim());
      return result;
    };

    const headers = parseLine(lines[0]);
    const rows = lines.slice(1).map(line => {
      const values = parseLine(line);
      const row = {};
      headers.forEach((header, i) => {
        row[header] = values[i] || '';
      });
      return row;
    });

    return {
      isValid: true,
      data: {
        headers,
        rows,
        rowCount: rows.length,
        columnCount: headers.length
      }
    };
  } catch (error) {
    return { isValid: false, data: null };
  }
}

/**
 * Parse Excel/CSV file from buffer or path
 * @param {string|Buffer} fileInput - File path or buffer
 * @returns {Promise<Object>} - Parsed data
 */
async function parseDataFile(fileInput) {
  // If it's a file path, read it
  let fileContent;
  let fileType = 'csv';

  if (typeof fileInput === 'string') {
    const ext = path.extname(fileInput).toLowerCase();
    if (ext === '.xlsx' || ext === '.xls') {
      fileType = 'excel';
    }
    fileContent = await fs.readFile(fileInput, 'utf-8');
  } else if (Buffer.isBuffer(fileInput)) {
    fileContent = fileInput.toString('utf-8');
  } else {
    throw new Error('Invalid file input: must be file path or buffer');
  }

  if (fileType === 'csv') {
    const result = parseCSVString(fileContent);
    if (!result.isValid) {
      throw new Error('Failed to parse CSV file');
    }
    return result.data;
  }

  // For Excel files, return raw content with type indicator
  // (Full Excel parsing would require additional libraries like xlsx)
  return {
    type: 'excel',
    rawContent: fileContent.substring(0, 10000), // Limit size
    note: 'Excel parsing requires additional processing'
  };
}

/**
 * Extract data points from unstructured text
 * @param {string} text - Unstructured text
 * @returns {Array<string>} - Extracted data points
 */
function extractDataPoints(text) {
  if (!text || typeof text !== 'string') return [];

  const dataPatterns = [
    // Currency amounts: $5.2M, $1.2 billion
    /\$[\d,]+\.?\d*\s*[MBK%]?/gi,
    // Percentages: 23%, +15%, -8%
    /[+-]?[\d,]+\.?\d*%/gi,
    // Ratios and multiples: 4.2x, 3:1
    /[\d,]+\.?\d*x/gi,
    // Years and dates: 2024, Q3 2024, FY2025
    /(?:FY|Q[1-4])?\s*20\d{2}/gi,
    // Metrics with labels: Revenue: $5M, Growth: 20%
    /(?:Revenue|Growth|Margin|EBITDA|ARR|MRR|CAC|LTV|ROI)[\s:]+[^\n,]+/gi
  ];

  const extracted = new Set();
  
  dataPatterns.forEach(pattern => {
    const matches = text.match(pattern) || [];
    matches.forEach(match => extracted.add(match.trim()));
  });

  // Also extract numbered/bulleted items
  const lines = text.split('\n');
  lines.forEach(line => {
    const trimmed = line.trim();
    // Match bullet points or numbered items that contain numbers
    if ((/^[-•*\d]/.test(trimmed) || /^\d+\./.test(trimmed)) && 
        /\d/.test(trimmed) && 
        trimmed.length > 10 && 
        trimmed.length < 200) {
      extracted.add(trimmed);
    }
  });

  return Array.from(extracted).slice(0, 20); // Limit to 20 data points
}

/**
 * Sanitize text input to prevent injection
 * @param {string} text - Raw text
 * @returns {string} - Sanitized text
 */
function sanitizeText(text) {
  if (!text || typeof text !== 'string') return '';
  
  return text
    .replace(/[<>]/g, '') // Remove potential HTML tags
    .replace(/[\x00-\x08\x0B\x0C\x0E-\x1F\x7F]/g, '') // Remove control characters
    .trim();
}

/**
 * Check if required fields are present
 * @param {Object} inputs - User inputs
 * @param {Array<string>} required - Required field names
 * @returns {Array<{field: string, message: string}>}
 */
function checkRequiredFields(inputs, required) {
  const errors = [];
  required.forEach(field => {
    if (!inputs[field] || 
        (typeof inputs[field] === 'string' && !inputs[field].trim()) ||
        (Array.isArray(inputs[field]) && inputs[field].length === 0)) {
      errors.push({ field, message: `${field} is required` });
    }
  });
  return errors;
}

module.exports = {
  validateSlideInputs,
  validateAndParseData,
  parseCSVString,
  parseDataFile,
  extractDataPoints,
  sanitizeText,
  checkRequiredFields,
  VALID_SLIDE_TYPES,
  VALID_AUDIENCES,
  VALID_PRESENTATION_MODES
};
