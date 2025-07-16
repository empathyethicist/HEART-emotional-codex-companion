# Hugging Face Spaces Deployment Guide

## Deployment Steps

### 1. Create a new Hugging Face Space
1. Go to https://huggingface.co/new-space
2. Choose a name: `emotional-codex-companion`
3. Select **Docker** as the SDK
4. Set visibility to **Public**
5. Click "Create Space"

### 2. Upload Project Files
Upload these files to your Hugging Face Space repository:

**Required Files:**
- `README.md` (with YAML frontmatter for configuration)
- `Dockerfile` (container configuration)
- All source code files (server/, client/, shared/ directories)
- `package.json` and `package-lock.json`
- `.dockerignore` (to optimize build)

### 3. Repository Structure
```
your-space/
├── README.md              # Space configuration
├── Dockerfile            # Container setup
├── .dockerignore         # Build optimization
├── package.json          # Dependencies
├── server/               # Backend code
├── client/               # Frontend code
├── shared/               # Shared schemas
├── tailwind.config.ts    # Styling
├── vite.config.ts        # Build config
└── tsconfig.json         # TypeScript config
```

### 4. Space Configuration (README.md)
The YAML frontmatter configures your space:

```yaml
---
title: Emotional Codex Companion
emoji: 🧠
colorFrom: blue
colorTo: purple
sdk: docker
app_port: 7860
suggested_storage: small
---
```

### 5. Environment Setup
The Dockerfile automatically:
- Installs Node.js 20
- Installs dependencies
- Builds the React frontend
- Starts the Express server on port 7860

### 6. Features Showcased
Your deployed space will demonstrate:
- **91+ Individual Emotion Codes**: Complete emotion taxonomy
- **Professional Analysis**: Research-grade emotion recognition
- **Cultural Context**: Multi-cultural emotion interpretation
- **Real-time Processing**: Instant emotion analysis
- **Interactive Codex**: Browse comprehensive emotion database

### 7. Access Your Deployed App
Once deployed, your app will be available at:
`https://huggingface.co/spaces/your-username/emotional-codex-companion`

## Key Features for Users

### Emotion Codex Browser
- Browse 91 individual emotion reference codes
- Filter by emotion families (JOY, SADNESS, ANGER, FEAR, GRIEF, LOVE, SHAME)
- View detailed triggers and intensity ranges

### Professional Analysis
- Submit emotional text for analysis
- Receive CMOP packets with emotion identification
- Cultural context analysis
- Symbolic interpretation

### Research Applications
Perfect for:
- Clinical psychology research
- Empathy system development  
- Cultural emotion studies
- AI training datasets
- Academic demonstrations

## Deployment Benefits

✅ **Global Accessibility**: Available worldwide via Hugging Face
✅ **No Setup Required**: Users can access immediately
✅ **Professional Showcase**: Demonstrates advanced emotion AI capabilities
✅ **Research Tool**: Comprehensive emotion recognition for academic use
✅ **Community Sharing**: Easy to share with researchers and developers

## Technical Specifications

- **Framework**: React 18 + TypeScript
- **Backend**: Node.js + Express  
- **Database**: In-memory storage with 91 emotion variants
- **Port**: 7860 (Hugging Face Spaces standard)
- **Build**: Optimized production build with Vite
- **Container**: Secure Docker deployment