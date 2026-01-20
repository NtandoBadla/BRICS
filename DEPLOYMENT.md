# BIFA Platform Deployment Guide

## Overview
This guide covers deploying both frontend and backend to Vercel with proper error handling and CORS configuration.

## Backend Deployment (Option 1: Serverless Functions)

### Step 1: Prepare Backend for Vercel
1. Ensure your `backend/src/index.js` exports the Express app as default
2. Update CORS configuration for production domains
3. Add error handling middleware

### Step 2: Deploy Backend
```bash
# From project root
cd backend
vercel --prod --config ../vercel-backend.json
```

### Step 3: Set Environment Variables
```bash
vercel env add DATABASE_URL
vercel env add JWT_SECRET
vercel env add FOOTBALL_API_KEY
```

## Backend Deployment (Option 2: Separate API Project)

### Step 1: Create Separate Repository
```bash
# Create new repo for backend only
git clone <your-repo> bifa-backend
cd bifa-backend
# Keep only backend files
rm -rf frontend
mv backend/* .
rm -rf backend
```

### Step 2: Update vercel.json
```json
{
  "version": 2,
  "builds": [
    {
      "src": "src/index.js",
      "use": "@vercel/node"
    }
  ],
  "routes": [
    {
      "src": "/(.*)",
      "dest": "src/index.js"
    }
  ]
}
```

### Step 3: Deploy
```bash
vercel --prod
```

## Frontend Deployment

### Step 1: Update Environment Variables
Create `.env.local`:
```env
NEXT_PUBLIC_API_URL=https://your-backend-url.vercel.app
```

### Step 2: Deploy Frontend
```bash
# From project root
cd frontend
vercel --prod
```

## Environment Variables Setup

### Backend Environment Variables
- `DATABASE_URL`: Your Prisma database connection string
- `JWT_SECRET`: Secret key for JWT tokens
- `FOOTBALL_API_KEY`: API key for football data
- `NODE_ENV`: Set to "production"

### Frontend Environment Variables
- `NEXT_PUBLIC_API_URL`: Your backend API URL

## CORS Configuration

Your backend is configured to accept requests from:
- `http://localhost:3000` (development)
- `https://bifa-platform.vercel.app` (production)
- `https://*.vercel.app` (Vercel preview deployments)

Update the CORS origins in `backend/src/index.js` to match your actual domain.

## Testing Deployment

### Health Check
Test your backend deployment:
```bash
curl https://your-backend-url.vercel.app/
```

Expected response:
```json
{
  "message": "BIFA Backend API",
  "status": "running",
  "timestamp": "2024-01-01T00:00:00.000Z",
  "environment": "production"
}
```

### API Endpoints
Test key endpoints:
```bash
# Get competitions
curl https://your-backend-url.vercel.app/api/competitions

# Login test
curl -X POST https://your-backend-url.vercel.app/api/auth/login \
  -H "Content-Type: application/json" \
  -d '{"email":"admin@bifa.com","password":"admin123"}'
```

## Troubleshooting

### Common Issues

1. **CORS Errors**
   - Update CORS origins in backend
   - Ensure credentials are properly configured

2. **Environment Variables Not Loading**
   - Check Vercel dashboard environment variables
   - Ensure variables are set for production environment

3. **Database Connection Issues**
   - Verify DATABASE_URL is correctly set
   - Check Prisma configuration

4. **Function Timeout**
   - Increase maxDuration in vercel.json
   - Optimize database queries

### Error Monitoring

The enhanced error handling system provides:
- User-friendly error messages
- Automatic retry for network errors
- Connection status monitoring
- Detailed error logging

### Performance Optimization

1. **Backend**
   - Use connection pooling for database
   - Implement caching where appropriate
   - Optimize API response sizes

2. **Frontend**
   - Use Next.js Image optimization
   - Implement proper loading states
   - Cache API responses with SWR or React Query

## Monitoring and Maintenance

### Health Checks
The backend includes a health check endpoint at `/` that returns:
- Service status
- Timestamp
- Environment information

### Error Tracking
Consider integrating:
- Sentry for error tracking
- Vercel Analytics for performance monitoring
- Custom logging for API usage

## Security Considerations

1. **Environment Variables**
   - Never commit secrets to git
   - Use Vercel's environment variable system
   - Rotate secrets regularly

2. **CORS**
   - Restrict origins to your actual domains
   - Don't use wildcards in production

3. **Rate Limiting**
   - Implement rate limiting for API endpoints
   - Use Vercel's edge functions for additional protection

## Scaling Considerations

### Database
- Use connection pooling
- Consider read replicas for heavy read workloads
- Monitor query performance

### API
- Implement caching strategies
- Use CDN for static assets
- Consider API versioning for future updates