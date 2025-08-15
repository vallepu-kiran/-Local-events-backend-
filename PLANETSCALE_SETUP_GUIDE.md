# PlanetScale MySQL Setup for Vercel

## 🌟 Why PlanetScale + Vercel?
- ✅ **Free MySQL database** (1GB, 1 billion reads)
- ✅ **Serverless-native** - no connection limits
- ✅ **Global edge network** - ultra-fast
- ✅ **Git-like workflow** for database schema
- ✅ **Zero configuration** - just works with Vercel

---

## 📋 Step-by-Step Setup

### Step 1: Create PlanetScale Account
1. Go to [planetscale.com](https://planetscale.com)
2. Sign up with GitHub (recommended)
3. Verify your email

### Step 2: Create Database
1. Click "New database"
2. Name: `local-events-db`
3. Region: Choose closest to your users
4. Click "Create database"

### Step 3: Create Branch (like Git for databases)
1. PlanetScale creates a `main` branch automatically
2. Click on your database
3. You'll see the `main` branch is ready

### Step 4: Get Connection String
1. In your database dashboard
2. Click "Connect"
3. Select "General" tab
4. Copy the connection string:
   ```
   mysql://username:password@aws.connect.psdb.cloud/database?ssl={"rejectUnauthorized":true}
   ```

### Step 5: Test Connection Locally
```bash
# Add to your .env file
DATABASE_URL="mysql://username:password@aws.connect.psdb.cloud/local-events-db?ssl={\"rejectUnauthorized\":true}"

# Test connection
npm run migrate
```

### Step 6: Deploy Schema
```bash
# Run your migrations on PlanetScale
npm run migrate
npm run seed
```

### Step 7: Add to Vercel
1. Go to Vercel dashboard
2. Project Settings → Environment Variables
3. Add: `DATABASE_URL` = `your-planetscale-connection-string`
4. Redeploy your Vercel app

---

## 🔧 Code Changes for PlanetScale

### Already Compatible! ✅
Your existing TypeORM MySQL code works perfectly with PlanetScale. No changes needed!

### Connection String Format:
```javascript
// PlanetScale connection string format:
DATABASE_URL="mysql://username:password@aws.connect.psdb.cloud/database?ssl={\"rejectUnauthorized\":true}"

// Your existing database config will automatically use this!
```

---

## 🎯 Alternative: Railway Database Only

If you prefer Railway's simplicity:

### Step 1: Create Railway Database
```bash
# Create Railway account at railway.app
# Create new project
# Add MySQL database service only (no app deployment)
```

### Step 2: Get DATABASE_URL
```bash
# Railway automatically provides:
DATABASE_URL="mysql://root:password@containers-us-west-x.railway.app:port/railway"
```

### Step 3: Use with Vercel
```bash
# Add this DATABASE_URL to Vercel environment variables
# Deploy your API to Vercel
# Database runs on Railway, API on Vercel
```

**Cost**: $5/month for Railway database vs Free PlanetScale

---

## 🚀 Quick Setup Commands

### Option A: PlanetScale (Free)
```bash
# 1. Create account at planetscale.com
# 2. Create database 'local-events-db'
# 3. Get connection string
# 4. Add to Vercel environment variables:
DATABASE_URL="mysql://user:pass@aws.connect.psdb.cloud/local-events-db?ssl={\"rejectUnauthorized\":true}"
```

### Option B: Railway Database ($5/month)
```bash
# 1. Create Railway account
# 2. Add MySQL database service
# 3. Copy DATABASE_URL
# 4. Add to Vercel environment variables
```

---

## 🔍 Comparison

| Feature | PlanetScale | Railway MySQL |
|---------|-------------|---------------|
| **Cost** | Free (1GB) | $5/month |
| **Setup** | 5 minutes | 2 minutes |
| **Performance** | Excellent | Very Good |
| **Scaling** | Automatic | Manual |
| **Branching** | Git-like schema | Traditional |
| **Global** | Edge network | Single region |

---

## 🎉 Recommendation

**Start with PlanetScale** (free tier) and upgrade to Railway if you need more storage later.

Your Local Events app will have:
- ✅ **Free MySQL database** (PlanetScale)
- ✅ **Free API hosting** (Vercel)
- ✅ **Global performance**
- ✅ **Zero monthly costs**

Ready to set up PlanetScale? It takes just 5 minutes! 🚀