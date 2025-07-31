
# Separate Server and Client Deployment Guide

This guide explains how to deploy the server and client separately on different platforms.

## Prerequisites

1. PostgreSQL database (you can use services like Neon, Supabase, or Railway)
2. Node.js 18+ installed on both deployment platforms
3. Domain names for both frontend and backend (optional but recommended)

## Backend (Server) Deployment

### 1. Prepare Server Files
Copy these files/folders to your backend hosting platform:
```
server/
shared/
migrations/
package.json (root)
package-lock.json (root)
tsconfig.json
drizzle.config.ts
env-setup.js
```

### 2. Environment Variables for Backend
Create a `.env` file in the root directory with:
```env
DATABASE_URL=your-postgresql-connection-string
NODE_ENV=production
PORT=3000
ADMIN_USER=your-admin-username
ADMIN_PASS=your-secure-password
ADMIN_USERNAME=admin
ADMIN_PASSWORD=secure-password-123
SESSION_SECRET=your-very-long-random-session-secret-key-make-it-long-and-random
GEMINI_API_KEY=your-gemini-api-key
UNSPLASH_ACCESS_KEY=your-unsplash-access-key
SITE_URL=https://your-backend-domain.com
FRONTEND_URL=https://your-frontend-domain.com
```

### 3. Backend Installation & Build
```bash
npm install
npm run build:server
```

### 4. Start Backend
```bash
npm run start:server
```

### 5. Backend package.json Scripts
Add these scripts to your root package.json:
```json
{
  "scripts": {
    "build:server": "tsc --project server/tsconfig.json --outDir dist/server",
    "start:server": "node dist/server/index.js"
  }
}
```

## Frontend (Client) Deployment

### 1. Prepare Client Files
Copy these files/folders to your frontend hosting platform:
```
client/
components.json
postcss.config.js
tailwind.config.ts
```

### 2. Environment Variables for Frontend
Create `client/.env.production`:
```env
VITE_API_URL=https://your-backend-domain.com
VITE_SITE_URL=https://your-frontend-domain.com
VITE_NODE_ENV=production
```

### 3. Frontend Installation & Build
```bash
cd client
npm install
npm run build
```

### 4. Deploy Static Files
Upload the contents of `client/dist/` to your static hosting service (Netlify, Vercel, etc.)

### 5. Configure Static Hosting
For SPA routing, configure your hosting to serve `index.html` for all routes:

**Netlify**: Create `client/public/_redirects`:
```
/*    /index.html   200
```

**Vercel**: Create `client/vercel.json`:
```json
{
  "rewrites": [
    { "source": "/(.*)", "destination": "/index.html" }
  ]
}
```

## CORS Configuration

Update your backend to allow your frontend domain. In `server/index.ts`, update CORS settings:

```typescript
app.use(cors({
  origin: [
    'https://your-frontend-domain.com',
    'http://localhost:5173' // for development
  ],
  credentials: true
}));
```

## Database Setup

1. Create a PostgreSQL database on your preferred service
2. Run migrations:
```bash
npm run db:migrate
```

## Local Development with Separate Services

### Backend Development
```bash
cd server
cp .env.example .env
# Edit .env with your values
npm install
npm run dev
```

### Frontend Development
```bash
cd client  
cp .env.example .env
# Edit .env to point to your backend URL
npm install
npm run dev
```

## Recommended Hosting Platforms

### Backend:
- Railway
- Render
- Heroku
- DigitalOcean App Platform
- Replit (recommended)

### Frontend:
- Netlify
- Vercel
- Cloudflare Pages
- GitHub Pages
- Replit (recommended)

### Database:
- Neon (PostgreSQL)
- Supabase
- Railway PostgreSQL
- PlanetScale (MySQL alternative)

## Health Checks

### Backend Health Check
Create `server/routes/health.ts`:
```typescript
import { Router } from 'express';

const router = Router();

router.get('/health', (req, res) => {
  res.json({ 
    status: 'OK', 
    timestamp: new Date().toISOString(),
    environment: process.env.NODE_ENV 
  });
});

export default router;
```

### Frontend Build Verification
Test your frontend build locally:
```bash
cd client
npm run build
npm run preview
```

This setup allows you to deploy and scale your frontend and backend independently.
