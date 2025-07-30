# MVP Generator AI

## Overview

This is a full-stack web application that generates comprehensive MVP (Minimum Viable Product) plans using AI. The application allows users to input their startup ideas and receive detailed business plans, tech stacks, monetization strategies, and roadmaps powered by Google's Gemini AI.

## User Preferences

Preferred communication style: Simple, everyday language.

## System Architecture

### Frontend Architecture
- **Framework**: React 18 with TypeScript
- **Routing**: Wouter for client-side routing
- **UI Components**: Radix UI primitives with shadcn/ui design system
- **Styling**: Tailwind CSS with custom CSS variables for theming
- **State Management**: TanStack Query (React Query) for server state
- **Form Handling**: React Hook Form with Zod validation
- **Build Tool**: Vite with React plugin

### Backend Architecture
- **Runtime**: Node.js with Express.js
- **Language**: TypeScript with ES modules
- **Database**: PostgreSQL with Drizzle ORM
- **AI Integration**: Google Gemini AI for MVP plan generation
- **Session Management**: Express sessions with PostgreSQL store
- **Development**: Hot reloading with Vite middleware integration

### Database Design
- **ORM**: Drizzle ORM with type-safe queries
- **Database**: PostgreSQL (configured for Neon serverless)
- **Schema**: Centralized in `/shared/schema.ts` for type sharing
- **Tables**:
  - `analytics` - Page views and user interaction tracking
  - `mvp_generations` - AI-generated MVP plans
  - `blog_posts` - SEO content management
  - `contacts` - Contact form submissions
  - `admin_settings` - Administrative configuration
  - `api_keys` - API key management for services

## Key Components

### AI MVP Generator
- **Service**: `/server/services/gemini.ts` handles AI integration
- **Features**: Generates comprehensive startup plans including tech stacks, features, monetization, and timelines
- **Input**: Business idea, industry, target audience, budget
- **Output**: Structured MVP plan with actionable recommendations

### Analytics System
- **Service**: `/server/services/analytics.ts` tracks user behavior
- **Features**: Page view tracking, user session management, admin dashboard metrics
- **Privacy**: IP and session-based tracking without personal data storage

### Content Management
- **Blog System**: Full CRUD operations for SEO content
- **Admin Panel**: Protected admin interface for content and analytics management
- **SEO Optimization**: Meta tags, structured data, and sitemap generation

### Authentication
- **Admin Auth**: Simple username/password authentication for admin features
- **Session Management**: Express sessions with PostgreSQL storage
- **Security**: Environment-based credentials with session validation

## Data Flow

1. **User Interaction**: Users submit startup ideas through React forms
2. **Validation**: Zod schemas validate input on both client and server
3. **AI Processing**: Gemini AI processes ideas and generates comprehensive plans
4. **Data Storage**: Results stored in PostgreSQL with full audit trail
5. **Analytics**: User interactions tracked for insights and optimization
6. **Response**: Structured MVP plans returned to users with export capabilities

## External Dependencies

### AI Services
- **Google Gemini AI**: Primary AI service for MVP generation
- **Fallback Support**: Multiple API key rotation for reliability

### Database Services
- **Neon Database**: Serverless PostgreSQL hosting
- **Connection Pooling**: Built-in connection management

### Development Tools
- **Replit Integration**: Custom plugins for development environment
- **Error Handling**: Runtime error overlay for debugging

### UI Libraries
- **Radix UI**: Comprehensive component primitives
- **Lucide Icons**: Consistent icon system
- **Tailwind CSS**: Utility-first styling framework

## Deployment Strategy

### Build Process
- **Frontend**: Vite builds optimized React bundle to `/dist/public`
- **Backend**: esbuild compiles TypeScript server to `/dist/index.js`
- **Assets**: Static assets served from build directory

### Environment Configuration
- **Database**: `DATABASE_URL` for PostgreSQL connection
- **AI Services**: `GEMINI_API_KEY` for AI integration
- **Admin**: `ADMIN_USER` and `ADMIN_PASS` for admin access
- **Sessions**: `SESSION_SECRET` for session encryption

### Production Setup
- **Server**: Express serves React app and API endpoints
- **Database**: Automatic migration support with Drizzle
- **Monitoring**: Built-in request logging and error tracking
- **Security**: CORS, session security, and environment-based configuration

The application follows a modern full-stack pattern with clear separation between client and server code, shared type definitions, and comprehensive error handling throughout the stack.