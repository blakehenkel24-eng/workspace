# Testing Guide - SlideTheory v2

This document describes the testing infrastructure and how to run tests for SlideTheory MVP.

## Quick Start

```bash
# Run all tests
npm test

# Run only unit tests
npm run test:unit

# Run only integration tests
npm run test:integration

# Run only E2E tests
npm run test:e2e

# Run tests in watch mode
npm run test:watch
```

## Test Structure

```
tests/
├── setup.js                    # Test environment configuration
├── MANUAL-TEST-CHECKLIST.md    # Manual testing checklist
├── BUG-TRACKER.md              # Bug tracking document
├── mocks/
│   ├── mock-data.js            # Test fixtures and sample data
│   └── mock-services.js        # Mock implementations
├── unit/
│   ├── validation.test.js      # Input validation tests
│   ├── openai-client.test.js   # AI client tests
│   ├── slide-generator.test.js # Slide rendering tests
│   └── export-generator.test.js # Export format tests
├── integration/
│   └── api.test.js             # API endpoint tests
└── e2e/
    └── slide-creation.test.js  # Full user journey tests
```

## Test Categories

### Unit Tests (`tests/unit/`)

Test individual functions and modules in isolation.

**Validation Tests**
- Input validation rules
- Slide type validation
- Context length validation
- Target audience validation
- Error message formatting

**OpenAI Client Tests**
- Fallback content generation
- System prompt generation
- Error handling
- API key validation

**Slide Generator Tests**
- HTML generation for all slide types
- Style/CSS injection
- SVG fallback rendering
- Output file generation

**Export Generator Tests**
- PPTX generation
- PDF generation (with fallback)
- File format validation
- Content structure preservation

### Integration Tests (`tests/integration/`)

Test API endpoints and their interactions.

**Health Endpoint**
- Server status check
- Feature flags
- Version information

**Stats Endpoint**
- Analytics data retrieval
- Data structure validation

**Templates Endpoints**
- Template list retrieval
- Individual template loading
- Error handling (404, 403)
- Path traversal protection

**Generation Endpoint**
- Valid request handling
- All slide types
- Validation error responses
- Invalid input handling

**Export Endpoints**
- PPTX export
- PDF export
- Error handling for missing parameters

### E2E Tests (`tests/e2e/`)

Test complete user workflows.

**Full User Journey**
1. Health check
2. Get templates
3. Generate slide
4. View generated slide
5. Export to PPTX
6. Verify stats updated

**All Slide Types**
- Generate each of the 6 slide types
- Verify unique content structures

**Different Audiences**
- C-Suite
- Board of Directors
- Investors
- Management Team

**Export All Formats**
- PNG download
- PPTX export
- PDF export

**Error Recovery**
- Invalid request handling
- Retry after error

**Concurrent Requests**
- Multiple simultaneous generations

**Performance Tests**
- Generation time < 5 seconds
- Large context handling
- Many data points handling

## Mock Data

The `tests/mocks/` directory contains:

### mock-data.js
- `VALID_SLIDE_TYPES` - All 6 slide types
- `VALID_AUDIENCES` - Target audience options
- `VALID_FRAMEWORKS` - Framework options
- `mockValidRequests` - Sample valid API requests
- `mockInvalidRequests` - Invalid requests for error testing
- `mockSlideContent` - Sample slide content for all types
- `mockTemplates` - Sample template data
- `mockKimiResponses` - AI response fixtures
- `mockAnalytics` - Analytics data fixture

### mock-services.js
- `MockKimiClient` - Simulates AI client behavior
- `MockSlideGenerator` - Simulates slide rendering
- `MockExportGenerator` - Simulates export generation
- `MockFileSystem` - In-memory file system
- `MockAnalyticsStore` - In-memory analytics

## Environment Variables

Tests use these environment variables:

```bash
NODE_ENV=test
PORT=3001  # Random port in practice
KIMI_API_KEY=test-api-key
KIMI_MODEL=kimi-coding/k2p5
```

## Continuous Integration

Example GitHub Actions workflow:

```yaml
name: Tests

on: [push, pull_request]

jobs:
  test:
    runs-on: ubuntu-latest
    steps:
      - uses: actions/checkout@v3
      - uses: actions/setup-node@v3
        with:
          node-version: '18'
      - run: npm ci
      - run: npm run test:unit
      - run: npm run test:integration
```

## Manual Testing

See `MANUAL-TEST-CHECKLIST.md` for comprehensive manual testing procedures covering:

- UI/UX verification
- All slide types
- Data input methods
- Export functionality
- Responsive design
- Keyboard navigation
- Browser compatibility
- Performance benchmarks
- Accessibility
- Security

## Bug Tracking

See `BUG-TRACKER.md` for:

- Active bugs with severity levels
- Steps to reproduce
- Expected vs actual behavior
- Workarounds
- Resolution status

## Known Limitations

1. **Puppeteer**: PDF export tests may be skipped if Puppeteer isn't properly configured
2. **Kimi API**: AI generation tests use fallback mode without valid API key
3. **File System**: Some tests use temporary directories that are cleaned up

## Adding New Tests

### Unit Test Example

```javascript
const { describe, it } = require('node:test');
const assert = require('node:assert');

describe('My Feature', () => {
  it('should do something', () => {
    const result = myFunction();
    assert.strictEqual(result, expected);
  });
});
```

### Integration Test Example

```javascript
const { describe, it, before, after } = require('node:test');
const app = require('../../server');

describe('API Endpoint', () => {
  let server;
  
  before(async () => {
    server = app.listen(0);
  });
  
  after(async () => {
    await new Promise(r => server.close(r));
  });
  
  it('should respond correctly', async () => {
    const response = await fetch(`http://localhost:${port}/api/endpoint`);
    assert.strictEqual(response.status, 200);
  });
});
```

## Troubleshooting

**Tests timeout**
- Increase timeout in test: `this.timeout = 30000;`
- Check if server is already running on the port

**Puppeteer errors**
- Install dependencies: `sudo apt-get install -y libgbm-dev`
- Or skip PDF tests: `npm run test:unit`

**Port in use**
- Tests use random ports, but check for zombie processes
- Kill node processes: `pkill -f node`

## Coverage

To generate coverage reports:

```bash
npm install --save-dev c8
npx c8 node --test
```

Coverage is reported for:
- Line coverage
- Function coverage
- Branch coverage
- Statement coverage
