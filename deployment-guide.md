
# Separate Deployment Guide

## Backend Deployment (Node.js Server)

### 1. Prepare Backend
```bash
cd server
npm install
npm run build
```

### 2. Environment Variables for Backend
Set these in your hosting provider:
```
DATABASE_URL=your-postgresql-connection-string
NODE_ENV=production
PORT=3000
ADMIN_USER=your-admin-username
ADMIN_PASS=your-secure-password
SESSION_SECRET=your-long-random-secret
GEMINI_API_KEY=your-gemini-key
UNSPLASH_ACCESS_KEY=your-unsplash-key
SITE_URL=https://your-backend-domain.com
FRONTEND_URL=https://your-frontend-domain.com
```

### 3. Deploy Backend
- Upload the `server` folder
- Install dependencies: `npm install`
- Run: `npm start`
- Ensure port 3000 is accessible

## Frontend Deployment (Static Files)

### 1. Prepare Frontend
```bash
cd client
npm install
```

### 2. Update API URL
Create `client/.env.production`:
```
VITE_API_URL=https://your-backend-domain.com
VITE_SITE_URL=https://your-frontend-domain.com
```

### 3. Build Frontend
```bash
npm run build
```

### 4. Deploy Frontend
- Upload the `client/dist` folder contents to your static hosting
- Configure your web server to serve `index.html` for all routes (SPA routing)

## CORS Configuration
Update the backend CORS settings in `server/index.ts`:
```typescript
app.use(cors({
  origin: [
    'https://your-frontend-domain.com',
    'http://localhost:5173' // for development
  ],
  credentials: true
}));
```

## Local Development Setup

### Backend
```bash
cd server
cp .env.example .env
# Edit .env with your values
npm install
npm run dev
```

### Frontend
```bash
cd client
cp .env.example .env
# Edit .env with your backend URL
npm install
npm run dev
```
