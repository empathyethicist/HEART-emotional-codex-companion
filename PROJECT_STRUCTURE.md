# Complete Project Structure for Local Recreation

## Essential Files to Copy

### Root Files
```
package.json
tsconfig.json
tailwind.config.ts
vite.config.ts
postcss.config.js
components.json
drizzle.config.ts
```

### Documentation & Deployment
```
README.md (Hugging Face Spaces config)
Dockerfile
HUGGING_FACE_DEPLOYMENT.md
DOWNLOAD_AND_DEPLOY.md
replit.md
```

### Client Directory Structure
```
client/
├── index.html
└── src/
    ├── main.tsx
    ├── App.tsx
    ├── index.css
    ├── components/
    │   ├── ui/
    │   ├── codex-browser.tsx
    │   ├── emotion-input.tsx
    │   ├── manual-entry.tsx
    │   ├── export-panel.tsx
    │   └── analytics-sidebar.tsx
    ├── pages/
    │   ├── home.tsx
    │   └── not-found.tsx
    ├── lib/
    │   ├── queryClient.ts
    │   ├── utils.ts
    │   ├── emid-generator.ts
    │   └── emotion-processor.ts
    └── hooks/
```

### Server Directory Structure
```
server/
├── index.ts
├── routes.ts
├── storage.ts
├── vite.ts
├── routes/
│   └── professional-analysis.ts
├── services/
│   ├── comprehensive-codex-builder.ts (CRITICAL - 91 emotions)
│   ├── emotion-codex.ts
│   ├── cultural-overlay.ts
│   ├── sal-detector.ts
│   ├── professional-emotion-engine.ts
│   ├── cip-rubric.ts
│   ├── codex-integration.ts
│   ├── tone-classifier.ts
│   ├── cultural-expression-modifier.ts
│   ├── heart-alignment-validator.ts
│   ├── variant-expander.ts
│   └── codex-populator.ts
└── utils/
    └── emid-generator.ts
```

### Shared Directory
```
shared/
└── schema.ts (Database schemas and types)
```

## Critical Files for Functionality

### 1. comprehensive-codex-builder.ts
Contains all 91 emotion variants with professional classifications

### 2. storage.ts
Memory storage implementation with auto-loading

### 3. schema.ts
TypeScript types and database schemas

### 4. README.md
Hugging Face Spaces YAML configuration

### 5. Dockerfile
Container deployment configuration

## How to Recreate Locally

1. Create the directory structure above
2. Copy each file content from the Replit interface
3. Run `npm install` to install dependencies
4. Your complete emotion recognition system will be ready

## Key Features You'll Have

- 91 individual emotion variants (JOY-001 to JOY-015, etc.)
- Professional triggers and definitions
- Cultural context analysis
- Hugging Face Spaces deployment ready
- Research-grade emotion taxonomy