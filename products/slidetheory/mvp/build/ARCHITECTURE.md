# SlideTheory MVP - Modular Architecture

## Folder Structure

```
├── config/              # Configuration management
│   ├── index.js         # Main config loader
│   ├── constants.js     # App constants
│   ├── ai-providers.js  # AI service configs
│   └── database.js      # Database configs (future)
│
├── controllers/         # Request handlers
│   ├── health-controller.js
│   ├── stats-controller.js
│   ├── template-controller.js
│   ├── slide-controller.js
│   ├── export-controller.js
│   └── file-controller.js
│
├── middleware/          # Express middleware
│   ├── error-handler.js # Global error handling
│   ├── validator.js     # Request validation
│   ├── auth.js          # Authentication/authorization
│   └── logger.js        # Request logging
│
├── models/              # Data structures
│   └── slide-model.js   # Slide schemas
│
├── routes/              # Route definitions
│   ├── health-routes.js
│   ├── stats-routes.js
│   ├── template-routes.js
│   ├── slide-routes.js
│   ├── export-routes.js
│   ├── file-routes.js
│   └── index.js         # Route aggregator
│
├── services/            # Business logic
│   ├── ai-service.js    # AI content generation
│   ├── fallback-service.js
│   ├── slide-service.js # Image rendering
│   ├── slide-templates.js
│   ├── export-service.js # PPTX/PDF generation
│   └── analytics-service.js
│
├── utils/               # Utility functions
│   ├── file-parser.js   # CSV/Excel parsing
│   ├── exporter.js      # Export helpers
│   └── helpers.js       # Common utilities
│
├── lib/                 # Legacy (kept for reference)
│   ├── openai-client.js
│   ├── slide-generator.js
│   └── export-generator.js
│
├── public/              # Static files
├── tmp/                 # Temporary files
├── server.js            # Entry point
└── package.json
```

## Key Design Principles

1. **Separation of Concerns**: Routes handle HTTP, controllers handle request logic, services handle business logic
2. **Centralized Configuration**: All config in `/config/` folder
3. **Middleware Chain**: Reusable middleware for logging, validation, errors
4. **Service Layer**: Business logic isolated for testability
5. **Model Layer**: Data validation and structure

## Adding New Features

### New API Endpoint
1. Add route in `routes/`
2. Add controller in `controllers/`
3. Add validation rules in `middleware/validator.js` (if needed)
4. Mount route in `routes/index.js`

### New Slide Type
1. Add to `SLIDE_TYPES` in `config/constants.js`
2. Add template builder in `services/slide-templates.js`
3. Add prompt in `services/ai-service.js`
4. Add fallback in `services/fallback-service.js`

### New Export Format
1. Add to `EXPORT_FORMATS` in `config/constants.js`
2. Add generator in `services/export-service.js`
3. Add route in `routes/export-routes.js`
4. Add controller method in `controllers/export-controller.js`

## Environment Variables

See `.env.example` for required variables.

Key variables:
- `PORT` - Server port (default: 3000)
- `KIMI_API_KEY` - AI service API key
- `NODE_ENV` - Environment (development/production)
