# Sentry Error Tracking Integration

This document describes the Sentry error tracking setup for SlideTheory production monitoring.

## Overview

Sentry provides real-time error tracking and performance monitoring for the SlideTheory application.

## Setup Instructions

### 1. Create Sentry Account

1. Go to https://sentry.io/signup/
2. Create a new organization (e.g., "slidetheory")
3. Create a new project for "slidetheory-web"

### 2. Get DSN

From your Sentry project settings, copy the DSN:
```
https://xxxx@xxxx.ingest.sentry.io/xxxx
```

### 3. Configure Environment Variables

Add to your `.env` file:

```bash
# Sentry Configuration
SENTRY_DSN=https://your-dsn-here@sentry.io/project-id
SENTRY_ENVIRONMENT=production
SENTRY_RELEASE=2.0.0
```

### 4. Install Sentry SDK

```bash
npm install @sentry/node @sentry/tracing
```

### 5. Initialize Sentry

See `lib/sentry.js` for the initialization code.

## Features

- **Error Tracking:** Automatic capture of unhandled exceptions
- **Performance Monitoring:** Track API response times and database queries
- **Release Tracking:** Associate errors with specific deployments
- **User Context:** Track errors by user for better debugging
- **Breadcrumbs:** Track user actions leading up to errors

## Privacy Considerations

- No PII is sent to Sentry by default
- User IDs are hashed
- IP addresses are not collected
- Request bodies are scrubbed

## Alerts

Configure alerts in Sentry for:
- New issues
- Regression issues
- High error rates (>1% of requests)
- Performance degradation
