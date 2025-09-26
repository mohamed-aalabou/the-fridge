# The Fridge - Backend Setup Guide

This guide will help you set up the Cloudflare-native backend for The Fridge notes app.

## Prerequisites

1. **Cloudflare Account** - You already have this configured
2. **Node.js** - Version 18 or higher
3. **pnpm** - Package manager (already installed)

## Environment Variables

Your `.env` file should contain:

```bash
# Cloudflare Configuration
CLOUDFLARE_ACCOUNT_ID=981528d72fe3547bd91983230520b3dc
CLOUDFLARE_API_TOKEN=NxjNDToKnI-vUqUlVUsR6HyWU0HX1g88BS58s0ew
CLOUDFLARE_D1_DATABASE_ID=42f861b9-3287-4b88-9082-e368469c2b46
CLOUDFLARE_KV_NAMESPACE_ID=a6bf9cbedf1d4a76bc9fc7956ece9ccd

# Frontend API Configuration
NEXT_PUBLIC_API_URL=http://localhost:8787
```

## Setup Steps

### 1. Install Dependencies

```bash
pnpm install
```

### 2. Set up Cloudflare D1 Database

```bash
# Apply database migrations
pnpm run worker:db:migrate

# For local development
pnpm run worker:db:local
```

### 3. Start Development Servers

**Terminal 1 - Backend (Cloudflare Worker):**

```bash
pnpm run worker:dev
```

**Terminal 2 - Frontend (Next.js):**

```bash
pnpm run dev
```

### 4. Access the Application

- **Frontend**: http://localhost:3000
- **Backend API**: http://localhost:8787
- **Health Check**: http://localhost:8787/health

## Architecture Overview

```
Frontend (Next.js) ←→ Cloudflare Workers ←→ D1 Database
                           ↕
                    Durable Objects (WebSockets)
                           ↕
                    Cloudflare KV (Caching)
```

### Components:

1. **Cloudflare Workers** - Serverless API endpoints
2. **D1 Database** - SQLite database for persistent storage
3. **Durable Objects** - Real-time WebSocket connections
4. **Cloudflare KV** - Caching layer for performance

### Real-time Features:

- ✅ **Note Creation** - Instant sync across all clients
- ✅ **Note Updates** - Real-time content updates
- ✅ **Position Updates** - Live position synchronization
- ✅ **Note Deletion** - Immediate removal from all clients

## API Endpoints

### Notes API

- `GET /api/notes` - Get all notes
- `GET /api/notes/:id` - Get specific note
- `POST /api/notes` - Create new note
- `PUT /api/notes/:id` - Update note
- `PATCH /api/notes/:id/position` - Update note position
- `DELETE /api/notes/:id` - Delete note

### WebSocket

- `WS /ws` - Real-time updates

### Health Check

- `GET /health` - Service health status

## Deployment

### Deploy to Cloudflare

```bash
# Deploy the worker
pnpm run worker:deploy

# Update your .env with the production URL
NEXT_PUBLIC_API_URL=https://your-worker.your-subdomain.workers.dev
```

### Update Frontend for Production

After deployment, update your `.env` file with the production API URL:

```bash
NEXT_PUBLIC_API_URL=https://the-fridge-backend-prod.your-subdomain.workers.dev
```

## Troubleshooting

### Common Issues:

1. **Database not found**: Run `pnpm run worker:db:migrate`
2. **WebSocket connection failed**: Check if the worker is running
3. **CORS errors**: The worker includes CORS headers for all origins
4. **Notes not syncing**: Check WebSocket connection status in the UI

### Debug Commands:

```bash
# Check worker logs
wrangler tail

# Test API endpoints
curl http://localhost:8787/health
curl http://localhost:8787/api/notes
```

## Features Implemented

- ✅ **Real-time synchronization** via WebSockets
- ✅ **Persistent storage** with D1 database
- ✅ **Caching** with Cloudflare KV
- ✅ **Optimistic updates** for better UX
- ✅ **Connection status** indicators
- ✅ **Error handling** and retry logic
- ✅ **CORS support** for development

## Next Steps

1. Test the real-time functionality by opening multiple browser tabs
2. Verify notes persist after page refresh
3. Check position updates sync across clients
4. Deploy to production when ready

The backend is now fully integrated with your frontend! 🎉
