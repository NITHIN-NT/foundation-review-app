# 100% Free Hosting Guide

Deploy your Review Session Application completely free using Vercel (frontend) and Render (backend).

## 🎯 Free Hosting Stack

| Component | Service | Free Tier | Limitations |
|-----------|---------|-----------|-------------|
| **Frontend** | Vercel | ✅ Forever Free | 100GB bandwidth/month |
| **Backend** | Render | ✅ Forever Free | Spins down after 15 min inactivity |
| **Database** | Supabase | ✅ Forever Free | 500MB storage, 2GB transfer |

**Total Cost**: $0/month forever! 🎉

---

## 🚀 Step 1: Deploy Backend to Render (Free)

Render offers a **completely free tier** for web services (with some limitations).

### 1.1 Create Render Account
1. Go to [render.com](https://render.com)
2. Sign up with GitHub (recommended)
3. Verify your email

### 1.2 Create Web Service
1. Click **"New +"** → **"Web Service"**
2. Connect your GitHub repository
3. Select your repository from the list

### 1.3 Configure Service

**Basic Settings:**
- **Name**: `review-app-backend` (or any name you prefer)
- **Region**: Choose closest to you (e.g., Singapore, Oregon)
- **Branch**: `main`
- **Root Directory**: `backend`
- **Runtime**: `Python 3`

**Build & Deploy:**
- **Build Command**: 
  ```bash
  pip install -r requirements.txt && python manage.py collectstatic --noinput
  ```
- **Start Command**:
  ```bash
  gunicorn config.wsgi:application
  ```

### 1.4 Select Free Plan
- Scroll down to **"Instance Type"**
- Select **"Free"** (this is important!)
- Free tier includes:
  - ✅ 512 MB RAM
  - ✅ Shared CPU
  - ✅ Automatic HTTPS
  - ⚠️ Spins down after 15 minutes of inactivity (cold starts ~30 seconds)

### 1.5 Add Environment Variables

Click **"Advanced"** → **"Add Environment Variable"** and add:

```bash
PYTHON_VERSION=3.11.0
SECRET_KEY=<generate-new-secret-key>
DEBUG=False
ALLOWED_HOSTS=<your-render-url>
DB_NAME=postgres
DB_USER=postgres.cvfkqikpqyqddggcbtqz
DB_PASSWORD=N1th1nrajn7
DB_HOST=aws-1-ap-south-1.pooler.supabase.com
DB_PORT=6543
CORS_ALLOWED_ORIGINS=http://localhost:5173
```

**Generate SECRET_KEY:**
```bash
python -c 'from django.core.management.utils import get_random_secret_key; print(get_random_secret_key())'
```

**For ALLOWED_HOSTS**, use your Render URL (e.g., `review-app-backend.onrender.com`)

### 1.6 Deploy
1. Click **"Create Web Service"**
2. Wait for deployment (first deploy takes ~5-10 minutes)
3. **Copy your Render URL** (e.g., `https://review-app-backend.onrender.com`)

### 1.7 Run Migrations

After deployment completes:
1. In Render dashboard, go to your service
2. Click **"Shell"** tab (left sidebar)
3. Run:
   ```bash
   python manage.py migrate
   python manage.py createsuperuser
   ```

---

## 🌐 Step 2: Deploy Frontend to Vercel (Free)

Vercel offers **unlimited free hosting** for personal projects.

### 2.1 Create Vercel Account
1. Go to [vercel.com](https://vercel.com)
2. Sign up with GitHub
3. Authorize Vercel to access your repositories

### 2.2 Import Project
1. Click **"Add New..."** → **"Project"**
2. Find your repository and click **"Import"**

### 2.3 Configure Project

**Framework Preset**: Vite (auto-detected)

**Build and Output Settings:**
- **Root Directory**: `frontend`
- **Build Command**: `npm run build` (auto-detected)
- **Output Directory**: `dist` (auto-detected)
- **Install Command**: `npm install` (auto-detected)

### 2.4 Add Environment Variable

Click **"Environment Variables"** and add:

**Key**: `VITE_API_URL`  
**Value**: Your Render URL (e.g., `https://review-app-backend.onrender.com`)

### 2.5 Deploy
1. Click **"Deploy"**
2. Wait for deployment (~2-3 minutes)
3. **Copy your Vercel URL** (e.g., `https://review-app.vercel.app`)

---

## 🔧 Step 3: Update CORS Settings

### 3.1 Update Render Environment Variables
1. Go to Render dashboard → Your service
2. Click **"Environment"** (left sidebar)
3. Find `CORS_ALLOWED_ORIGINS` and update to:
   ```bash
   https://review-app.vercel.app,http://localhost:5173
   ```
   *(Replace with your actual Vercel URL)*
4. Click **"Save Changes"**
5. Service will automatically redeploy

---

## ✅ Step 4: Test Your Deployment

1. Visit your Vercel URL: `https://review-app.vercel.app`
2. First load might be slow (Render cold start ~30 seconds)
3. Test login functionality
4. Test all features

---

## ⚠️ Important: Render Free Tier Limitations

### Cold Starts
- **Issue**: Free tier spins down after 15 minutes of inactivity
- **Impact**: First request after inactivity takes ~30 seconds to wake up
- **Solutions**:
  - Use a free uptime monitor (see below)
  - Upgrade to paid tier ($7/month) for always-on service
  - Accept the cold starts (fine for personal projects)

### Keep Your App Awake (Optional)

Use a free uptime monitoring service to ping your backend every 10-14 minutes:

#### Option 1: UptimeRobot (Recommended)
1. Sign up at [uptimerobot.com](https://uptimerobot.com) (free)
2. Add new monitor:
   - **Monitor Type**: HTTP(s)
   - **URL**: Your Render URL
   - **Monitoring Interval**: 5 minutes (free tier)
3. This keeps your app warm most of the time

#### Option 2: Cron-job.org
1. Sign up at [cron-job.org](https://cron-job.org) (free)
2. Create new cron job:
   - **URL**: Your Render URL
   - **Interval**: Every 10 minutes
3. Enable the job

#### Option 3: GitHub Actions (Advanced)
Create `.github/workflows/keep-alive.yml`:

```yaml
name: Keep Render Alive

on:
  schedule:
    - cron: '*/10 * * * *'  # Every 10 minutes
  workflow_dispatch:

jobs:
  ping:
    runs-on: ubuntu-latest
    steps:
      - name: Ping Render
        run: curl https://your-render-url.onrender.com/api/
```

---

## 🎨 Alternative Free Backend Options

If Render's cold starts are unacceptable, consider these alternatives:

### Option A: Railway (Free $5 Credit/Month)
- **Pros**: No cold starts, better performance
- **Cons**: $5 credit runs out (~500 hours/month)
- **Good for**: Active development, testing
- See [QUICK_START_DEPLOY.md](./QUICK_START_DEPLOY.md) for Railway setup

### Option B: Fly.io (Free Tier)
- **Pros**: 3 shared VMs free, no cold starts
- **Cons**: More complex setup
- **Free Tier**: 3GB persistent storage, 160GB bandwidth

### Option C: PythonAnywhere (Free Tier)
- **Pros**: Always-on, no cold starts
- **Cons**: Limited to 1 web app, 512MB storage
- **Good for**: Simple Django apps

---

## 💾 Database: Supabase (Free Forever)

Your database is already configured with Supabase free tier:

**Free Tier Includes:**
- ✅ 500MB database storage
- ✅ 2GB bandwidth
- ✅ Unlimited API requests
- ✅ Automatic backups (7 days)
- ✅ Connection pooling

**When to Upgrade:**
- Database exceeds 500MB
- Need more than 2GB bandwidth/month
- Need longer backup retention

---

## 📊 Free Tier Summary

### What You Get (100% Free)

| Service | Free Tier Details |
|---------|------------------|
| **Vercel** | Unlimited bandwidth (100GB soft limit), unlimited deployments, automatic HTTPS, global CDN |
| **Render** | 750 hours/month free (enough for 1 always-on service with uptime monitor), automatic HTTPS, auto-deploy from Git |
| **Supabase** | 500MB database, 2GB bandwidth, unlimited API requests, 7-day backups |

### Limitations

| Service | Limitation | Workaround |
|---------|-----------|------------|
| **Render** | Spins down after 15 min | Use uptime monitor |
| **Render** | 512MB RAM | Optimize Django settings |
| **Supabase** | 500MB storage | Clean up old data, upgrade if needed |
| **Vercel** | 100GB bandwidth | Optimize assets, use CDN |

---

## 🔍 Monitoring Your Free Services

### Vercel Analytics (Free)
1. Go to Vercel dashboard → Your project
2. Click **"Analytics"** tab
3. View page views, performance, etc.

### Render Logs (Free)
1. Go to Render dashboard → Your service
2. Click **"Logs"** tab
3. View real-time application logs

### Supabase Monitoring (Free)
1. Go to Supabase dashboard
2. Click **"Database"** → **"Logs"**
3. Monitor queries and performance

---

## 🚨 Troubleshooting Free Tier Issues

### Render Service Won't Start
**Check:**
- Build logs for errors
- Environment variables are correct
- `requirements.txt` includes all dependencies
- `Procfile` or start command is correct

### Slow First Load (Cold Start)
**This is normal for Render free tier!**
- First request after 15 min: ~30 seconds
- Subsequent requests: Fast
- **Solution**: Use uptime monitor or upgrade to paid tier

### Database Connection Errors
**Check:**
- Supabase credentials are correct
- `DB_HOST` and `DB_PORT` are correct
- Supabase allows connections from Render
- Database hasn't exceeded 500MB limit

### CORS Errors
**Check:**
- `CORS_ALLOWED_ORIGINS` includes your Vercel URL
- No trailing slash in CORS origins
- Render service has redeployed after CORS update

---

## 🎯 Optimization Tips for Free Tier

### Backend (Render)
1. **Reduce cold start time**:
   - Minimize dependencies in `requirements.txt`
   - Use lightweight packages
   
2. **Optimize memory usage**:
   - Set `DEBUG=False` in production
   - Use database connection pooling (already configured)

3. **Cache static files**:
   - Whitenoise handles this (already configured)

### Frontend (Vercel)
1. **Reduce bundle size**:
   - Remove unused dependencies
   - Use code splitting (Vite does this automatically)
   
2. **Optimize images**:
   - Use WebP format
   - Compress images before uploading

3. **Enable caching**:
   - Vercel handles this automatically

### Database (Supabase)
1. **Monitor storage**:
   - Regularly check database size
   - Clean up old sessions/data
   
2. **Optimize queries**:
   - Add indexes for frequently queried fields
   - Use select_related/prefetch_related in Django

---

## 📈 When to Consider Upgrading

### Render ($7/month)
Upgrade when:
- Cold starts are unacceptable
- Need more than 512MB RAM
- Need guaranteed uptime

### Supabase ($25/month)
Upgrade when:
- Database exceeds 500MB
- Need more than 2GB bandwidth
- Need longer backup retention

### Vercel ($20/month)
Upgrade when:
- Need team collaboration
- Exceed 100GB bandwidth
- Need advanced analytics

---

## 🎉 Success Checklist

- [ ] Backend deployed to Render (free tier)
- [ ] Frontend deployed to Vercel (free tier)
- [ ] Database connected (Supabase free tier)
- [ ] CORS configured correctly
- [ ] Migrations run successfully
- [ ] Superuser created
- [ ] All features tested
- [ ] Uptime monitor configured (optional)
- [ ] Custom domain added (optional)

---

## 📚 Quick Reference

### Your Free Stack
```
Frontend:  https://your-app.vercel.app (Vercel)
Backend:   https://your-app.onrender.com (Render)
Database:  Supabase PostgreSQL
```

### Useful Commands

**View Render logs:**
```bash
# In Render dashboard → Logs tab
```

**Run Django commands on Render:**
```bash
# In Render dashboard → Shell tab
python manage.py migrate
python manage.py createsuperuser
python manage.py collectstatic
```

**Redeploy on Render:**
```bash
# Just push to GitHub, auto-deploys
git push origin main
```

**Redeploy on Vercel:**
```bash
# Just push to GitHub, auto-deploys
git push origin main
```

---

## 🆘 Need Help?

1. Check [Render Documentation](https://render.com/docs)
2. Check [Vercel Documentation](https://vercel.com/docs)
3. Review logs in Render/Vercel dashboards
4. Test API endpoints with Postman/curl

---

**Total Setup Time**: ~20-30 minutes  
**Total Cost**: $0/month forever! 🎉

Good luck with your free deployment! 🚀
