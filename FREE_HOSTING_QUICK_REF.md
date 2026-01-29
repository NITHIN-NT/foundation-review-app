# 🚀 Free Hosting Quick Reference

## Your 100% Free Stack

```
┌─────────────────────────────────────────────────────────┐
│                                                         │
│                    USER'S BROWSER                       │
│                                                         │
└─────────────────┬───────────────────────────────────────┘
                  │
                  │ HTTPS
                  ▼
┌─────────────────────────────────────────────────────────┐
│                                                         │
│              VERCEL (Frontend) - FREE                   │
│         React App + Vite Build + Global CDN            │
│                                                         │
│  ✅ 100GB bandwidth/month                              │
│  ✅ Unlimited deployments                              │
│  ✅ Automatic HTTPS                                    │
│  ✅ Auto-deploy from Git                               │
│                                                         │
└─────────────────┬───────────────────────────────────────┘
                  │
                  │ API Calls (HTTPS)
                  ▼
┌─────────────────────────────────────────────────────────┐
│                                                         │
│              RENDER (Backend) - FREE                    │
│         Django API + Gunicorn + Whitenoise             │
│                                                         │
│  ✅ 750 hours/month free                               │
│  ✅ Automatic HTTPS                                    │
│  ✅ Auto-deploy from Git                               │
│  ⚠️  Spins down after 15 min (cold start ~30 sec)     │
│                                                         │
└─────────────────┬───────────────────────────────────────┘
                  │
                  │ SQL Queries
                  ▼
┌─────────────────────────────────────────────────────────┐
│                                                         │
│            SUPABASE (Database) - FREE                   │
│              PostgreSQL + Connection Pool               │
│                                                         │
│  ✅ 500MB database storage                             │
│  ✅ 2GB bandwidth/month                                │
│  ✅ Unlimited API requests                             │
│  ✅ 7-day automatic backups                            │
│                                                         │
└─────────────────────────────────────────────────────────┘
```

## 📋 Setup Checklist

### Step 1: Deploy Backend to Render (10 min)
- [ ] Create Render account at [render.com](https://render.com)
- [ ] Create new Web Service
- [ ] Connect GitHub repository
- [ ] Set root directory to `backend`
- [ ] Select **FREE** plan
- [ ] Add environment variables
- [ ] Deploy and wait for completion
- [ ] Run migrations in Shell tab
- [ ] Copy your Render URL

### Step 2: Deploy Frontend to Vercel (5 min)
- [ ] Create Vercel account at [vercel.com](https://vercel.com)
- [ ] Import GitHub repository
- [ ] Set root directory to `frontend`
- [ ] Add `VITE_API_URL` environment variable (your Render URL)
- [ ] Deploy and wait for completion
- [ ] Copy your Vercel URL

### Step 3: Update CORS (2 min)
- [ ] Go to Render dashboard
- [ ] Update `CORS_ALLOWED_ORIGINS` to include Vercel URL
- [ ] Wait for auto-redeploy

### Step 4: Test (3 min)
- [ ] Visit your Vercel URL
- [ ] Test login
- [ ] Test all features
- [ ] Check browser console for errors

**Total Time: ~20 minutes**

## 🔗 Your URLs

After deployment, you'll have:

```
Frontend: https://your-app.vercel.app
Backend:  https://your-app.onrender.com
Database: Supabase (already configured)
```

## ⚡ Optional: Keep Backend Warm

To reduce cold starts, set up a free uptime monitor:

### UptimeRobot (Recommended)
1. Sign up at [uptimerobot.com](https://uptimerobot.com)
2. Add new HTTP(s) monitor
3. URL: Your Render backend URL
4. Interval: 5 minutes
5. Done! Backend stays warm

## 💰 Cost Breakdown

| Service | Cost | What You Get |
|---------|------|--------------|
| Vercel | $0 | 100GB bandwidth, unlimited deployments |
| Render | $0 | 750 hours/month, auto HTTPS, Git deploy |
| Supabase | $0 | 500MB DB, 2GB bandwidth, backups |
| UptimeRobot | $0 | 50 monitors, 5-min checks |
| **TOTAL** | **$0/month** | **Everything you need!** |

## 🎯 What This Gives You

✅ **Professional deployment** with automatic HTTPS  
✅ **Auto-deploy** on every git push  
✅ **Global CDN** for fast frontend delivery  
✅ **Managed database** with automatic backups  
✅ **Zero cost** - completely free forever  
✅ **Perfect for** personal projects, portfolios, demos  

## ⚠️ Limitations to Know

| Limitation | Impact | Workaround |
|------------|--------|------------|
| Cold starts (15 min) | First request slow (~30 sec) | Use uptime monitor |
| 512MB RAM | May limit concurrent users | Optimize code, upgrade if needed |
| 500MB database | Storage limit | Clean old data, upgrade if needed |
| 100GB bandwidth | Traffic limit | Optimize assets, rarely hit |

## 🚀 Ready to Deploy?

Follow the complete guide: **[FREE_HOSTING_GUIDE.md](./FREE_HOSTING_GUIDE.md)**

## 📊 Need Better Performance?

If cold starts are unacceptable, check: **[HOSTING_COMPARISON.md](./HOSTING_COMPARISON.md)**

---

**Questions?** All guides are in your project folder! 📚
