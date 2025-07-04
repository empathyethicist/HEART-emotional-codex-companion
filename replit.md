# Emotional Codex Companion

## Overview

The Emotional Codex Companion is an advanced empathy system development tool designed to process, analyze, and catalog human emotional expressions. The application serves as a comprehensive platform for emotion recognition, cultural context analysis, and symbolic interpretation using a sophisticated emotion codex system.

## System Architecture

### Frontend Architecture
- **Framework**: React 18 with TypeScript and Vite
- **UI Library**: Shadcn/UI components with Radix UI primitives
- **Styling**: Tailwind CSS with custom design tokens
- **State Management**: TanStack Query for server state management
- **Routing**: Wouter for lightweight client-side routing
- **Form Handling**: React Hook Form with Zod validation

### Backend Architecture
- **Runtime**: Node.js with Express.js server
- **Language**: TypeScript with ES modules
- **Database**: PostgreSQL with Drizzle ORM
- **Database Provider**: Neon Database (serverless PostgreSQL)
- **Session Management**: PostgreSQL-based session storage
- **API Design**: RESTful endpoints with structured error handling

### Data Storage Solutions
- **Primary Database**: PostgreSQL via Neon Database
- **ORM**: Drizzle ORM with type-safe schema definitions
- **Migrations**: Drizzle Kit for database schema management
- **Session Storage**: PostgreSQL-based session persistence
- **In-Memory Fallback**: MemStorage class for development/testing

## Key Components

### Emotion Processing Engine
The core emotion processing system consists of:
- **Emotion Codex Service**: Processes emotion input using a comprehensive emotion taxonomy
- **SAL Detector**: Symbolic Ambiguity Layer for metaphor and symbolic content analysis
- **Cultural Overlay Service**: Applies cultural context to emotion interpretation
- **EMID Generator**: Creates unique emotion identifiers (format: USR009-EMOTION-TIMESTAMP-ID)

### Database Schema
Three primary entities:
1. **Emotion Entries**: Core emotion taxonomy with variants, triggers, and intensity ranges
2. **CMOP Entries**: Codex Mapping Output Packets storing processed emotion data
3. **Processing Sessions**: Session tracking for analytics and user experience

### User Interface Components
- **Emotion Input**: Multi-mode emotion processing with cultural context selection
- **Codex Browser**: Interactive exploration of the emotion taxonomy
- **Manual Entry**: Admin interface for extending the emotion codex
- **Export Panel**: Data export in multiple formats (JSON, YAML, TXT)
- **Analytics Sidebar**: Real-time processing statistics and activity feed

## Data Flow

1. **Input Processing**: User submits emotional expression text
2. **Emotion Matching**: System searches emotion codex for pattern matches
3. **SAL Analysis**: Symbolic content detection and archetype identification
4. **Cultural Context**: Application of cultural interpretation layers
5. **CMOP Generation**: Creation of structured emotion output packet
6. **Storage**: Persistence of processed data with unique EMID
7. **Export/Analytics**: Data visualization and export capabilities

## External Dependencies

### Core Dependencies
- **@neondatabase/serverless**: Serverless PostgreSQL connection
- **drizzle-orm**: Type-safe database ORM
- **@tanstack/react-query**: Server state management
- **@radix-ui/***: Accessible UI component primitives
- **react-hook-form**: Form state management
- **zod**: Runtime type validation

### Development Tools
- **Vite**: Build tool and development server
- **TypeScript**: Type safety and developer experience
- **Tailwind CSS**: Utility-first styling
- **ESLint**: Code quality and consistency

## Deployment Strategy

### Build Process
- **Frontend**: Vite builds React app to `dist/public`
- **Backend**: ESBuild bundles server code to `dist/index.js`
- **Database**: Drizzle migrations applied via `db:push` command

### Environment Configuration
- **DATABASE_URL**: PostgreSQL connection string (required)
- **NODE_ENV**: Environment designation (development/production)
- **Session Configuration**: PostgreSQL-based session persistence

### Hosting Requirements
- Node.js runtime environment
- PostgreSQL database access
- Static file serving capability
- Environment variable support

## User Preferences

Preferred communication style: Simple, everyday language.

## Recent Changes

- Added comprehensive emotion variant expansion system (JOY-002, ANG-003, etc.)
- Created VariantExpander service for generating detailed emotion sub-categories
- Added API endpoint for mass variant creation with intensity ranges and triggers
- Enhanced Manual Entry UI with "Expand Variants" functionality
- Implemented micro-variant generation with sub-categories and blendable relationships

## Changelog

- July 04, 2025. Initial setup and comprehensive emotion processing system
- July 04, 2025. Added variant expansion capabilities for detailed emotion categorization