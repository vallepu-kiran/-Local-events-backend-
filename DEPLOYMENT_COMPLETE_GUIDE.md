# Complete Railway Deployment Guide

## 🚀 Your Local Events Backend is Ready for Railway!

### What's Been Prepared:
✅ Dockerfile for containerized deployment  
✅ Railway configuration files  
✅ Database config supporting Railway's DATABASE_URL  
✅ Production environment variables template  
✅ Frontend configured for Railway backend  
✅ Health check endpoint ready  

---

## 📋 Step-by-Step Deployment Process

### Step 1: Create Railway Account
1. Go to [railway.app](https://railway.app)
2. Sign up with GitHub (recommended)
3. Verify your account

### Step 2: Deploy from GitHub (Recommended)
1. Push your code to GitHub:
   ```bash
   git remote add origin https://github.com/yourusername/local-events-backend.git
   git push -u origin main
   ```

2. In Railway dashboard:
   - Click "New Project"
   - Select "Deploy from GitHub repo"
   - Choose your repository
   - Railway will auto-deploy!

### Step 3: Add MySQL Database
1. In your Railway project dashboard
2. Click "New" → "Database" → "Add MySQL"
3. Railway automatically creates `DATABASE_URL` environment variable

### Step 4: Configure Environment Variables
In Railway dashboard → Variables tab, add these:

**Required Variables:**
```
NODE_ENV=production
JWT_SECRET=your-super-secure-jwt-secret-here-min-32-chars
JWT_EXPIRES_IN=7d
FRONTEND_URL=https://your-frontend-domain.com,exp://your-expo-app
```

**Optional Variables:**
```
GOOGLE_CLIENT_ID=your-google-oauth-client-id
GOOGLE_CLIENT_SECRET=your-google-oauth-secret
EMAIL_HOST=smtp.gmail.com
EMAIL_PORT=587
EMAIL_USER=your-email@gmail.com
EMAIL_PASS=your-gmail-app-password
DEVELOPER_RECEIVER=your-email@gmail.com
```

### Step 5: Run Database Migrations
Once deployed, run this in Railway dashboard → Deploy → Console:
```bash
npm run migrate
npm run seed
```

### Step 6: Update Frontend
1. Copy your Railway app URL (e.g., `https://your-app-xyz123.up.railway.app`)
2. Update in `sample-app/utils/networkConfig.ts`:
   ```typescript
   const RAILWAY_BACKEND_URL = 'https://your-app-xyz123.up.railway.app';
   ```

### Step 7: Test Your Deployment
Your backend will be available at:
- **Health Check**: `https://your-app-xyz123.up.railway.app/health`
- **API Base**: `https://your-app-xyz123.up.railway.app/api/`

---

## 🔧 Alternative: Deploy with Railway CLI

If you prefer command line:

```bash
# Login to Railway
railway login

# Initialize project
railway init

# Add MySQL database
railway add mysql

# Set environment variables
railway variables set NODE_ENV=production
railway variables set JWT_SECRET=your-jwt-secret

# Deploy
railway up
```

---

## 📱 Frontend Configuration

Your React Native app is already configured to:
- Use Railway backend in production
- Fall back to local development server in dev mode
- Handle both mock and real API responses

To test with Railway backend:
1. Update the `RAILWAY_BACKEND_URL` in `networkConfig.ts`
2. Build a production version of your app
3. The app will automatically use the Railway backend

---

## 🔍 Troubleshooting

**Database Connection Issues:**
- Ensure `DATABASE_URL` is set by Railway
- Check migrations ran successfully
- Verify MySQL service is running

**CORS Issues:**
- Add your frontend domains to `FRONTEND_URL`
- Include both HTTP and HTTPS versions
- Don't forget Expo app URLs

**Environment Variables:**
- Use the `.env.production.template` as reference
- Generate secure JWT secrets (min 32 characters)
- Test with Railway console logs

---

## 🎯 Next Steps

1. **Deploy Backend**: Follow steps above
2. **Update Frontend**: Replace Railway URL
3. **Test Features**: Authentication, events, API calls
4. **Production Build**: Create production mobile app builds
5. **Monitoring**: Set up Railway analytics and logs

Your Local Events app is production-ready! 🚀