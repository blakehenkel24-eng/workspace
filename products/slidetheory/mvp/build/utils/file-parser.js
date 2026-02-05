/**
 * File Parser Utilities
 * Handles Excel and CSV file parsing
 */

const fs = require('fs').promises;
const path = require('path');

/**
 * Parse CSV file content
 * @param {string} content - Raw CSV content
 * @param {Object} options - Parsing options
 * @returns {Object} Parsed data with headers and rows
 */
function parseCSV(content, options = {}) {
  const delimiter = options.delimiter || ',';
  const lines = content.trim().split('\n');
  
  if (lines.length === 0) {
    throw new Error('Empty CSV file');
  }
  
  // Parse header
  const headers = parseCSVLine(lines[0], delimiter);
  
  // Parse data rows
  const rows = lines.slice(1).map((line, index) => {
    const values = parseCSVLine(line, delimiter);
    return {
      rowIndex: index + 1,
      data: headers.reduce((obj, header, i) => {
        obj[header] = values[i] || '';
        return obj;
      }, {})
    };
  });
  
  return { headers, rows, rowCount: rows.length };
}

/**
 * Parse a single CSV line handling quoted values
 */
function parseCSVLine(line, delimiter = ',') {
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
    } else if (char === delimiter && !inQuotes) {
      result.push(current.trim());
      current = '';
    } else {
      current += char;
    }
  }
  
  result.push(current.trim());
  return result;
}

/**
 * Parse Excel file (placeholder for future XLSX support)
 * Currently converts to CSV-like format
 * @param {string} filePath - Path to Excel file
 * @returns {Promise<Object>} Parsed data
 */
async function parseExcel(filePath) {
  // Future: Use xlsx library for proper Excel parsing
  // const XLSX = require('xlsx');
  // const workbook = XLSX.readFile(filePath);
  // const sheet = workbook.Sheets[workbook.SheetNames[0]];
  // return XLSX.utils.sheet_to_json(sheet);
  
  throw new Error('Excel parsing requires xlsx package. Install with: npm install xlsx');
}

/**
 * Detect file type from extension
 * @param {string} filename - Filename to check
 * @returns {string} File type: 'csv', 'excel', or 'unknown'
 */
function detectFileType(filename) {
  const ext = path.extname(filename).toLowerCase();
  
  if (ext === '.csv') return 'csv';
  if (['.xlsx', '.xls'].includes(ext)) return 'excel';
  
  return 'unknown';
}

/**
 * Parse data file (auto-detects type)
 * @param {string} filePath - Path to data file
 * @returns {Promise<Object>} Parsed data
 */
async function parseDataFile(filePath) {
  const type = detectFileType(filePath);
  
  switch (type) {
    case 'csv': {
      const content = await fs.readFile(filePath, 'utf-8');
      return parseCSV(content);
    }
    case 'excel':
      return parseExcel(filePath);
    default:
      throw new Error(`Unsupported file type: ${type}`);
  }
}

/**
 * Extract data points from parsed file
 * Converts structured data to array of data point strings
 * @param {Object} parsedData - Data from parseCSV/parseExcel
 * @param {number} maxPoints - Maximum points to extract
 * @returns {string[]} Array of data point strings
 */
function extractDataPoints(parsedData, maxPoints = 10) {
  const points = [];
  
  for (const row of parsedData.rows.slice(0, maxPoints)) {
    const rowData = Object.entries(row.data)
      .map(([key, value]) => `${key}: ${value}`)
      .join(', ');
    points.push(rowData);
  }
  
  return points;
}

module.exports = {
  parseCSV,
  parseExcel,
  detectFileType,
  parseDataFile,
  extractDataPoints
};
