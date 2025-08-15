# Vercel Deployment Guide for Local Events Backend

## 🚀 Vercel vs Railway Comparison

| Feature | Vercel | Railway |
|---------|--------|---------|
| **Type** | Serverless Functions | Containerized Apps |
| **Database** | External (PlanetScale, Supabase) | Built-in MySQL |
| **Cold Starts** | Yes (~1-2s) | No |
| **Cost** | Free tier generous | Free tier limited |
| **Complexity** | Medium (serverless adaptation) | Low (direct deployment) |

---

## ✅ What's Been Prepared for Vercel:

- ✅ Serverless function entry point (`/api/index.js`)
- ✅ Vercel configuration (`vercel.json`)
- ✅ Database connection optimized for serverless
- ✅ Connection pooling for performance
- ✅ Route handling for all API endpoints

---

## 📋 Step-by-Step Vercel Deployment

### Step 1: Set Up Database (Required)
Vercel doesn't provide databases, so you need an external one:

**Option A: PlanetScale (Recommended)**
1. Go to [planetscale.com](https://planetscale.com)
2. Create free account
3. Create new database
4. Get connection string

**Option B: Supabase**
1. Go to [supabase.com](https://supabase.com)
2. Create project
3. Go to Database settings
4. Get PostgreSQL connection string

**Option C: Railway Database Only**
1. Create Railway project
2. Add MySQL database
3. Copy DATABASE_URL
4. Use with Vercel

### Step 2: Deploy to Vercel

**Method A: GitHub Integration (Recommended)**
1. Push code to GitHub:
   ```bash
   git remote add origin https://github.com/yourusername/local-events-backend.git
   git push -u origin main
   ```

2. Go to [vercel.com](https://vercel.com)
3. Import project from GitHub
4. Vercel auto-detects configuration
5. Deploy!

**Method B: Vercel CLI**
```bash
# Install Vercel CLI
npm i -g vercel

# Login and deploy
vercel login
vercel --prod
```

### Step 3: Configure Environment Variables
In Vercel dashboard → Settings → Environment Variables:

**Required Variables:**
```
NODE_ENV=production
DATABASE_URL=mysql://user:pass@host:port/database
JWT_SECRET=your-super-secure-jwt-secret-32-chars-min
JWT_EXPIRES_IN=7d
FRONTEND_URL=https://your-app.vercel.app,exp://your-expo-app
```

**Optional Variables:**
```
GOOGLE_CLIENT_ID=your-google-client-id
GOOGLE_CLIENT_SECRET=your-google-secret
EMAIL_HOST=smtp.gmail.com
EMAIL_PORT=587
EMAIL_USER=your-email@gmail.com
EMAIL_PASS=your-app-password
```

### Step 4: Run Database Migration
After deployment, run migration:

**Option A: Local Migration (if database is accessible)**
```bash
# Set DATABASE_URL locally
export DATABASE_URL="your-production-database-url"
npm run migrate
npm run seed
```

**Option B: Vercel CLI Migration**
```bash
vercel env pull .env.local
npm run vercel:migrate
```

### Step 5: Test Deployment
Your API will be available at:
- **Health Check**: `https://your-app.vercel.app/health`
- **API Base**: `https://your-app.vercel.app/api/`

---

## 🔧 Database Options Detailed

### Option 1: PlanetScale (MySQL - Recommended)
```bash
# Free tier: 1 database, 1GB storage, 1 billion reads
# Connection string format:
DATABASE_URL="mysql://username:password@host:3306/database?ssl={"rejectUnauthorized":true}"
```

### Option 2: Supabase (PostgreSQL)
```bash
# Free tier: 2 projects, 500MB database, 50MB file storage
# You'll need to update TypeORM config for PostgreSQL
DATABASE_URL="postgresql://username:password@host:5432/database"
```

### Option 3: Railway MySQL (Hybrid)
```bash
# Use Railway just for database, Vercel for API
# Best of both worlds approach
DATABASE_URL="mysql://root:password@containers-us-west-x.railway.app:port/railway"
```

---

## ⚡ Performance Optimizations

**Already Implemented:**
- ✅ Single database connection for serverless
- ✅ Connection timeout optimizations
- ✅ Lazy database initialization
- ✅ Reduced cold start overhead

**Additional Optimizations:**
```javascript
// Connection pooling in production
extra: {
  connectionLimit: 1,      // Single connection for serverless
  idleTimeout: 3000,       // Quick cleanup
  acquireTimeout: 10000,   // Fast connection
  reconnect: true          // Auto-reconnect
}
```

---

## 🌐 Frontend Configuration

Update your React Native app:

```typescript
// In utils/networkConfig.ts
const VERCEL_BACKEND_URL = 'https://your-app.vercel.app';

export const getBackendUrl = () => {
  // Use Vercel in production
  if (!__DEV__ && VERCEL_BACKEND_URL !== 'https://your-app.vercel.app') {
    return VERCEL_BACKEND_URL;
  }
  
  // Development logic...
};
```

---

## 🔍 Troubleshooting

**Common Issues:**

1. **Cold Start Delays**
   - First request after inactivity takes 1-2 seconds
   - Implement keep-alive pings if needed

2. **Database Connection Timeouts**
   - Ensure connection limits are set to 1
   - Use connection pooling settings provided

3. **CORS Issues**
   - Add all your domains to `FRONTEND_URL`
   - Include both HTTP/HTTPS and Expo URLs

4. **Function Timeout (30s limit)**
   - Optimize database queries
   - Reduce payload sizes
   - Use pagination

**Debugging:**
```bash
# View function logs
vercel logs your-deployment-url

# Local development
vercel dev
```

---

## 🎯 Pros and Cons

### ✅ Vercel Pros:
- Free tier is very generous
- Excellent performance globally
- Great for React/Next.js integration
- Automatic SSL and CDN
- Easy domain management

### ❌ Vercel Cons:
- Cold starts (1-2 second delay)
- External database required
- 30-second function limit
- More complex serverless setup

### 🏆 Recommendation:
- **Vercel**: Great for frontend-heavy apps with occasional backend calls
- **Railway**: Better for traditional backend-heavy applications

---

## 🚀 Quick Start Commands

```bash
# 1. Set up database (PlanetScale/Supabase)
# 2. Push to GitHub
git add . && git commit -m "Add Vercel deployment"
git push origin main

# 3. Deploy to Vercel
# Go to vercel.com and import from GitHub

# 4. Configure environment variables in Vercel dashboard

# 5. Update frontend with Vercel URL
```

Your Local Events backend is ready for both Railway AND Vercel! Choose the platform that best fits your needs. 🎉