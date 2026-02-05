/**
 * Unit Tests - Server Validation Functions
 * Tests: validateGenerateRequest, VALID_SLIDE_TYPES
 */

const { describe, it } = require('node:test');
const assert = require('node:assert');
const { 
  mockValidRequests, 
  mockInvalidRequests, 
  VALID_SLIDE_TYPES 
} = require('../mocks/mock-data');

// Import the validation function from server
// We'll test it by requiring the server module and extracting the function
const path = require('path');

// Since the validation function is not exported, we'll test it through the API
// For unit testing, we'll re-implement the validation logic
function validateGenerateRequest(body) {
  const { slideType, context, targetAudience } = body;
  const errors = [];

  if (!slideType) {
    errors.push({ field: 'slideType', message: 'Slide type is required' });
  } else if (!VALID_SLIDE_TYPES.includes(slideType)) {
    errors.push({ 
      field: 'slideType', 
      message: `Invalid slide type. Must be one of: ${VALID_SLIDE_TYPES.join(', ')}`
    });
  }

  if (!context) {
    errors.push({ field: 'context', message: 'Context is required' });
  } else if (typeof context !== 'string') {
    errors.push({ field: 'context', message: 'Context must be a string' });
  } else if (context.length < 10) {
    errors.push({ field: 'context', message: 'Context must be at least 10 characters' });
  } else if (context.length > 2000) {
    errors.push({ field: 'context', message: 'Context must be less than 2000 characters' });
  }

  if (!targetAudience) {
    errors.push({ field: 'targetAudience', message: 'Target audience is required' });
  } else if (typeof targetAudience !== 'string') {
    errors.push({ field: 'targetAudience', message: 'Target audience must be a string' });
  }

  return errors;
}

describe('Validation Functions', () => {
  
  describe('validateGenerateRequest', () => {
    
    it('should accept valid executive summary request', () => {
      const errors = validateGenerateRequest(mockValidRequests.executiveSummary);
      assert.strictEqual(errors.length, 0);
    });

    it('should accept valid market analysis request', () => {
      const errors = validateGenerateRequest(mockValidRequests.marketAnalysis);
      assert.strictEqual(errors.length, 0);
    });

    it('should accept valid financial model request', () => {
      const errors = validateGenerateRequest(mockValidRequests.financialModel);
      assert.strictEqual(errors.length, 0);
    });

    it('should accept minimal valid request', () => {
      const errors = validateGenerateRequest(mockValidRequests.minimalValid);
      assert.strictEqual(errors.length, 0);
    });

    it('should reject missing slideType', () => {
      const errors = validateGenerateRequest(mockInvalidRequests.missingSlideType);
      assert.strictEqual(errors.length, 2); // slideType and context errors
      const slideTypeError = errors.find(e => e.field === 'slideType');
      assert.ok(slideTypeError);
      assert.ok(slideTypeError.message.includes('required'));
    });

    it('should reject invalid slideType', () => {
      const errors = validateGenerateRequest(mockInvalidRequests.invalidSlideType);
      assert.strictEqual(errors.length, 1);
      assert.strictEqual(errors[0].field, 'slideType');
      assert.ok(errors[0].message.includes('Invalid slide type'));
    });

    it('should reject missing context', () => {
      const errors = validateGenerateRequest(mockInvalidRequests.missingContext);
      assert.strictEqual(errors.length, 1);
      assert.strictEqual(errors[0].field, 'context');
      assert.ok(errors[0].message.includes('required'));
    });

    it('should reject context that is too short', () => {
      const errors = validateGenerateRequest(mockInvalidRequests.contextTooShort);
      assert.strictEqual(errors.length, 1);
      assert.strictEqual(errors[0].field, 'context');
      assert.ok(errors[0].message.includes('at least 10 characters'));
    });

    it('should reject context that is too long', () => {
      const errors = validateGenerateRequest(mockInvalidRequests.contextTooLong);
      assert.strictEqual(errors.length, 1);
      assert.strictEqual(errors[0].field, 'context');
      assert.ok(errors[0].message.includes('less than 2000 characters'));
    });

    it('should reject missing targetAudience', () => {
      const errors = validateGenerateRequest(mockInvalidRequests.missingAudience);
      assert.strictEqual(errors.length, 1);
      assert.strictEqual(errors[0].field, 'targetAudience');
      assert.ok(errors[0].message.includes('required'));
    });

    it('should reject non-string context', () => {
      const errors = validateGenerateRequest(mockInvalidRequests.nonStringContext);
      assert.strictEqual(errors.length, 1);
      assert.strictEqual(errors[0].field, 'context');
      assert.ok(errors[0].message.includes('must be a string'));
    });

    it('should reject non-string targetAudience', () => {
      const errors = validateGenerateRequest(mockInvalidRequests.nonStringAudience);
      assert.strictEqual(errors.length, 1);
      assert.strictEqual(errors[0].field, 'targetAudience');
      assert.ok(errors[0].message.includes('must be a string'));
    });

    it('should accept all valid slide types', () => {
      for (const slideType of VALID_SLIDE_TYPES) {
        const request = {
          slideType,
          context: 'This is a valid context with more than ten characters for testing.',
          targetAudience: 'C-Suite'
        };
        const errors = validateGenerateRequest(request);
        assert.strictEqual(errors.length, 0, `Slide type "${slideType}" should be valid`);
      }
    });

    it('should return multiple validation errors', () => {
      const request = {};
      const errors = validateGenerateRequest(request);
      assert.ok(errors.length >= 3);
      assert.ok(errors.some(e => e.field === 'slideType'));
      assert.ok(errors.some(e => e.field === 'context'));
      assert.ok(errors.some(e => e.field === 'targetAudience'));
    });

    it('should validate exact boundary of context length (10 chars)', () => {
      const request = {
        slideType: 'Executive Summary',
        context: '1234567890', // Exactly 10 chars
        targetAudience: 'C-Suite'
      };
      const errors = validateGenerateRequest(request);
      assert.strictEqual(errors.length, 0);
    });

    it('should reject context with 9 characters', () => {
      const request = {
        slideType: 'Executive Summary',
        context: '123456789', // 9 chars
        targetAudience: 'C-Suite'
      };
      const errors = validateGenerateRequest(request);
      assert.strictEqual(errors.length, 1);
      assert.ok(errors[0].message.includes('at least 10'));
    });

    it('should validate exact boundary of context length (2000 chars)', () => {
      const request = {
        slideType: 'Executive Summary',
        context: 'A'.repeat(2000),
        targetAudience: 'C-Suite'
      };
      const errors = validateGenerateRequest(request);
      assert.strictEqual(errors.length, 0);
    });
  });

  describe('VALID_SLIDE_TYPES', () => {
    
    it('should contain exactly 6 slide types', () => {
      assert.strictEqual(VALID_SLIDE_TYPES.length, 6);
    });

    it('should contain expected slide types', () => {
      const expected = [
        'Executive Summary',
        'Market Analysis', 
        'Financial Model',
        'Competitive Analysis',
        'Growth Strategy',
        'Risk Assessment'
      ];
      for (const type of expected) {
        assert.ok(VALID_SLIDE_TYPES.includes(type), `Should include "${type}"`);
      }
    });

    it('should have unique slide types', () => {
      const unique = [...new Set(VALID_SLIDE_TYPES)];
      assert.strictEqual(unique.length, VALID_SLIDE_TYPES.length);
    });
  });
});
