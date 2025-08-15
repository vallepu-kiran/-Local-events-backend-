# Railway Deployment Guide

## Prerequisites
1. Railway account (free at https://railway.app)
2. Railway CLI installed (`npm i -g @railway/cli`)

## Step 1: Login and Create Project
```bash
# Login to Railway
railway login

# Initialize Railway project
railway init

# Select "Deploy from GitHub repo" or "Empty Project"
```

## Step 2: Add Database
```bash
# Add MySQL database
railway add

# Select "Database" -> "MySQL"
```

## Step 3: Configure Environment Variables
In Railway dashboard, add these environment variables:

### Required Environment Variables:
```
NODE_ENV=production
PORT=5000

# Database (will be auto-filled by Railway MySQL)
DATABASE_URL=mysql://username:password@host:port/database

# JWT Configuration  
JWT_SECRET=your-super-secret-jwt-key-here
JWT_EXPIRES_IN=7d

# Frontend URLs (update with your actual domains)
FRONTEND_URL=https://your-app-domain.com,exp://your-expo-app

# Google OAuth (optional)
GOOGLE_CLIENT_ID=your-google-client-id
GOOGLE_CLIENT_SECRET=your-google-client-secret
GOOGLE_CALLBACK_URL=https://your-railway-domain.up.railway.app/api/auth/google/callback

# Email Configuration (optional)
EMAIL_HOST=smtp.gmail.com
EMAIL_PORT=587
EMAIL_USER=your-email@gmail.com
EMAIL_PASS=your-app-password

# Firebase (optional - for push notifications)
FIREBASE_PROJECT_ID=your-project-id
FIREBASE_PRIVATE_KEY=your-private-key
FIREBASE_CLIENT_EMAIL=your-service-account-email

# File Upload
UPLOAD_PATH=uploads
MAX_FILE_SIZE=5242880
```

## Step 4: Deploy
```bash
# Deploy to Railway
railway up

# Or connect to GitHub and enable auto-deploy
railway link
```

## Step 5: Database Setup
After first deployment, run database migrations:
```bash
# Connect to Railway environment and run migrations
railway run npm run migrate
railway run npm run seed
```

## Important Notes:
- Railway automatically sets up SSL/HTTPS
- Database URL is automatically provided by Railway MySQL
- The app will be accessible at: `https://your-app-name.up.railway.app`
- Health check endpoint: `/health`

## Environment Variables in Railway Dashboard:
1. Go to your Railway project
2. Click on your service
3. Go to "Variables" tab
4. Add all the environment variables listed above

## Connecting Frontend:
Update your React Native app's API configuration to use:
```
https://your-app-name.up.railway.app
```