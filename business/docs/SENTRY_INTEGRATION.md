# Sentry Integration Example

## Step 1: Install Dependencies

```bash
npm install @sentry/node @sentry/tracing
```

## Step 2: Update server.js

Add Sentry initialization at the very top of your server.js file:

```javascript
// ===== SENTRY SETUP (MUST BE FIRST) =====
const { initSentry } = require('./lib/sentry');
const Sentry = initSentry();
// =========================================

const express = require('express');
const app = express();

// Sentry request handler (must be first middleware)
if (Sentry) {
  const { requestHandler } = require('./lib/sentry');
  app.use(requestHandler());
}

// ... your other middleware ...

// Sentry user context middleware
const { sentryUserMiddleware, sentryBreadcrumbMiddleware } = require('./middleware/sentry');
app.use(sentryUserMiddleware);
app.use(sentryBreadcrumbMiddleware);

// ... your routes ...

// Sentry error handler (must be before other error handlers)
if (Sentry) {
  const { errorHandler } = require('./lib/sentry');
  app.use(errorHandler());
}

// Your error handling middleware
app.use((err, req, res, next) => {
  // Handle errors
});
```

## Step 3: Add Sentry to Frontend

Add to your HTML template head section:

```html
<script>
  window.SENTRY_DSN = 'YOUR_DSN_HERE';
  window.SENTRY_ENVIRONMENT = 'production';
  window.SENTRY_RELEASE = '2.0.0';
</script>
<script src="/js/sentry.js" defer></script>
```

## Step 4: Test the Integration

Trigger a test error:

```javascript
// In browser console
Sentry.captureException(new Error('Test error'));

// Or on server
const { captureException } = require('./lib/sentry');
captureException(new Error('Server test error'));
```

## Environment Variables

Add to your `.env` file:

```bash
SENTRY_DSN=https://xxxx@xxxx.ingest.sentry.io/xxxx
SENTRY_ENVIRONMENT=production
SENTRY_RELEASE=2.0.0
SENTRY_TRACES_SAMPLE_RATE=0.1
```

## Monitoring Dashboard

View errors at: https://sentry.io/organizations/YOUR_ORG/projects/slidetheory/

## Alert Configuration

Set up alerts in Sentry for:
- New issues
- Issue regression
- High error rate (threshold: 1% of requests)
- Performance degradation (p95 > 2s)
