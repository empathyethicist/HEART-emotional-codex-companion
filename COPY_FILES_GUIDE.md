# Quick File Copy Guide

## Essential Files for Your Complete System

### Copy These Files First (Most Important)

1. **package.json** - All dependencies
2. **server/services/comprehensive-codex-builder.ts** - Your 91 emotion variants
3. **README.md** - Hugging Face Spaces config with YAML
4. **Dockerfile** - Container deployment
5. **server/storage.ts** - Data management with auto-loading
6. **shared/schema.ts** - All TypeScript types

### Then Copy These Core Files

- **server/index.ts** - Main server
- **server/routes.ts** - API endpoints
- **client/src/App.tsx** - React app entry
- **client/src/main.tsx** - React bootstrap
- **client/index.html** - HTML template
- **vite.config.ts** - Build configuration
- **tailwind.config.ts** - Styling config
- **tsconfig.json** - TypeScript config

### Copy All Other Files in These Directories

- **server/services/** (all emotion processing services)
- **client/src/components/** (UI components)
- **client/src/pages/** (React pages)
- **client/src/lib/** (utilities)

## After Copying Locally

```bash
npm install
npm run dev
```

Your complete emotion recognition system will be ready with all 91 variants and Hugging Face deployment capability.

## Alternative: Public Repl Method

1. Make your Repl temporarily public in settings
2. Clone with: `git clone https://github.com/replit/[repl-name]`
3. Make private again after cloning

This gives you the complete git history and all files automatically.