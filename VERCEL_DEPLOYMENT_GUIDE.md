# Vercel Deployment Guide - Review Session Application

This guide will walk you through deploying your Django + React application to Vercel.

## Overview

Your application consists of:
- **Frontend**: React + Vite application
- **Backend**: Django REST API with PostgreSQL (Supabase)
- **Database**: PostgreSQL hosted on Supabase

## Important Notes

> [!WARNING]
> Vercel is primarily designed for frontend applications and serverless functions. For Django applications, you have two main options:
> 1. **Deploy only the frontend to Vercel** and host the Django backend elsewhere (Railway, Render, DigitalOcean, etc.)
> 2. **Deploy both frontend and backend to Vercel** using serverless functions (requires significant configuration)

This guide covers **both approaches**.

---

## Option 1: Frontend on Vercel + Backend Elsewhere (Recommended)

This is the **recommended approach** as it's simpler and more reliable for Django applications.

### Step 1: Deploy Backend to Railway/Render

#### Using Railway (Recommended)

1. **Create a Railway account** at [railway.app](https://railway.app)

2. **Install Railway CLI** (optional):
   ```bash
   npm install -g @railway/cli
   ```

3. **Create `requirements.txt`** in the `backend` directory:
   ```bash
   cd backend
   pip freeze > requirements.txt
   ```

4. **Create `Procfile`** in the `backend` directory:
   ```
   web: gunicorn config.wsgi --bind 0.0.0.0:$PORT
   ```

5. **Create `runtime.txt`** in the `backend` directory:
   ```
   python-3.11
   ```

6. **Update `backend/config/settings.py`** for production:
   ```python
   import os
   from pathlib import Path
   from dotenv import load_dotenv
   import dj_database_url

   BASE_DIR = Path(__file__).resolve().parent.parent
   load_dotenv(BASE_DIR / '.env')

   SECRET_KEY = os.getenv('SECRET_KEY', 'django-insecure-o_6=1w_!&n7xd#oxhak6a=_oj55+vlhnt#3fn-k2sw$7po-_(4')
   DEBUG = os.getenv('DEBUG', 'False') == 'True'
   ALLOWED_HOSTS = os.getenv('ALLOWED_HOSTS', '').split(',')

   # ... rest of settings ...

   # CORS settings for production
   CORS_ALLOWED_ORIGINS = os.getenv('CORS_ALLOWED_ORIGINS', 'http://localhost:5173').split(',')

   # Static files
   STATIC_URL = '/static/'
   STATIC_ROOT = os.path.join(BASE_DIR, 'staticfiles')

   # Whitenoise for static files
   MIDDLEWARE.insert(1, 'whitenoise.middleware.WhiteNoiseMiddleware')
   STATICFILES_STORAGE = 'whitenoise.storage.CompressedManifestStaticFilesStorage'
   ```

7. **Add required packages** to `requirements.txt`:
   ```bash
   pip install gunicorn whitenoise dj-database-url psycopg2-binary
   pip freeze > requirements.txt
   ```

8. **Deploy to Railway**:
   - Go to [railway.app](https://railway.app)
   - Click "New Project" → "Deploy from GitHub repo"
   - Select your repository
   - Set the root directory to `backend`
   - Add environment variables:
     - `SECRET_KEY`: Generate a new one
     - `DEBUG`: `False`
     - `ALLOWED_HOSTS`: Your Railway domain (e.g., `your-app.up.railway.app`)
     - `DB_NAME`, `DB_USER`, `DB_PASSWORD`, `DB_HOST`, `DB_PORT`: Your Supabase credentials
     - `CORS_ALLOWED_ORIGINS`: Your Vercel frontend URL (add after frontend deployment)
   - Deploy!

9. **Note your backend URL** (e.g., `https://your-app.up.railway.app`)

#### Using Render

1. Go to [render.com](https://render.com)
2. Create a new "Web Service"
3. Connect your GitHub repository
4. Configure:
   - **Root Directory**: `backend`
   - **Build Command**: `pip install -r requirements.txt && python manage.py collectstatic --noinput && python manage.py migrate`
   - **Start Command**: `gunicorn config.wsgi:application`
   - **Environment Variables**: Same as Railway above
5. Deploy!

### Step 2: Deploy Frontend to Vercel

1. **Update frontend API configuration**

   Create or update `frontend/src/config.js`:
   ```javascript
   const API_BASE_URL = import.meta.env.VITE_API_URL || 'http://localhost:8000';
   
   export { API_BASE_URL };
   ```

2. **Update all API calls** to use this config:
   ```javascript
   import { API_BASE_URL } from './config';
   
   // Example:
   axios.get(`${API_BASE_URL}/api/questions/`)
   ```

3. **Create `vercel.json`** in the `frontend` directory:
   ```json
   {
     "buildCommand": "npm run build",
     "outputDirectory": "dist",
     "framework": "vite",
     "rewrites": [
       {
         "source": "/(.*)",
         "destination": "/index.html"
       }
     ]
   }
   ```

4. **Deploy to Vercel**:
   
   **Option A: Using Vercel CLI**
   ```bash
   # Install Vercel CLI
   npm install -g vercel
   
   # Navigate to frontend directory
   cd frontend
   
   # Login to Vercel
   vercel login
   
   # Deploy
   vercel
   ```

   **Option B: Using Vercel Dashboard**
   - Go to [vercel.com](https://vercel.com)
   - Click "Add New Project"
   - Import your GitHub repository
   - Configure:
     - **Framework Preset**: Vite
     - **Root Directory**: `frontend`
     - **Build Command**: `npm run build`
     - **Output Directory**: `dist`
   - Add environment variable:
     - `VITE_API_URL`: Your backend URL (e.g., `https://your-app.up.railway.app`)
   - Deploy!

5. **Update backend CORS settings**:
   - Go back to your backend hosting (Railway/Render)
   - Update `CORS_ALLOWED_ORIGINS` environment variable to include your Vercel URL
   - Example: `https://your-app.vercel.app,http://localhost:5173`

---

## Option 2: Full Stack on Vercel (Advanced)

This approach deploys both frontend and backend to Vercel using serverless functions.

> [!CAUTION]
> This approach has limitations:
> - Django admin may not work properly
> - Cold starts can be slow
> - Some Django features may not work in serverless environment
> - More complex setup and debugging

### Prerequisites

1. **Install required packages**:
   ```bash
   cd backend
   pip install django djangorestframework django-cors-headers psycopg2-binary python-dotenv
   pip freeze > requirements.txt
   ```

### Step 1: Configure Django for Vercel

1. **Create `vercel.json`** in the **root** directory:
   ```json
   {
     "version": 2,
     "builds": [
       {
         "src": "frontend/package.json",
         "use": "@vercel/static-build",
         "config": {
           "distDir": "dist"
         }
       },
       {
         "src": "backend/config/wsgi.py",
         "use": "@vercel/python"
       }
     ],
     "routes": [
       {
         "src": "/api/(.*)",
         "dest": "backend/config/wsgi.py"
       },
       {
         "src": "/admin/(.*)",
         "dest": "backend/config/wsgi.py"
       },
       {
         "src": "/static/(.*)",
         "dest": "backend/config/wsgi.py"
       },
       {
         "src": "/(.*)",
         "dest": "frontend/dist/$1"
       }
     ],
     "env": {
       "DJANGO_SETTINGS_MODULE": "config.settings"
     }
   }
   ```

2. **Update `backend/config/settings.py`**:
   ```python
   import os
   from pathlib import Path
   from dotenv import load_dotenv

   BASE_DIR = Path(__file__).resolve().parent.parent
   load_dotenv(BASE_DIR / '.env')

   SECRET_KEY = os.getenv('SECRET_KEY', 'your-secret-key')
   DEBUG = os.getenv('DEBUG', 'False') == 'True'
   ALLOWED_HOSTS = ['*']  # Vercel handles this

   # ... rest of settings ...

   # CORS settings
   CORS_ALLOW_ALL_ORIGINS = True  # Or specify your domains

   # Static files
   STATIC_URL = '/static/'
   STATIC_ROOT = os.path.join(BASE_DIR, 'staticfiles')

   # Database - ensure using environment variables
   DATABASES = {
       'default': {
           'ENGINE': 'django.db.backends.postgresql',
           'NAME': os.getenv('DB_NAME'),
           'USER': os.getenv('DB_USER'),
           'PASSWORD': os.getenv('DB_PASSWORD'),
           'HOST': os.getenv('DB_HOST'),
           'PORT': os.getenv('DB_PORT', '5432'),
       }
   }
   ```

3. **Create `backend/vercel_app.py`**:
   ```python
   from config.wsgi import application
   
   app = application
   ```

### Step 2: Update Frontend Build

1. **Update `frontend/package.json`** to add build script:
   ```json
   {
     "scripts": {
       "dev": "vite",
       "build": "vite build",
       "preview": "vite preview"
     }
   }
   ```

2. **Update API URLs** in frontend to use relative paths:
   ```javascript
   // Instead of http://localhost:8000/api/...
   // Use /api/...
   const API_BASE_URL = '/api';
   ```

### Step 3: Deploy to Vercel

1. **Using Vercel CLI**:
   ```bash
   # Install Vercel CLI
   npm install -g vercel
   
   # Login
   vercel login
   
   # Deploy from root directory
   vercel
   ```

2. **Using Vercel Dashboard**:
   - Go to [vercel.com](https://vercel.com)
   - Import your GitHub repository
   - Add environment variables:
     - `SECRET_KEY`: Your Django secret key
     - `DEBUG`: `False`
     - `DB_NAME`, `DB_USER`, `DB_PASSWORD`, `DB_HOST`, `DB_PORT`: Supabase credentials
   - Deploy!

3. **Run migrations** (one-time setup):
   ```bash
   # You'll need to run migrations manually
   # Connect to your database and run:
   python manage.py migrate
   ```

---

## Post-Deployment Checklist

- [ ] Frontend is accessible at your Vercel URL
- [ ] API endpoints are working (test `/api/questions/` or similar)
- [ ] CORS is configured correctly (no CORS errors in browser console)
- [ ] Database migrations are applied
- [ ] Environment variables are set correctly
- [ ] Static files are loading properly
- [ ] Authentication is working
- [ ] Test all major features (login, review sessions, etc.)

---

## Troubleshooting

### CORS Errors

If you see CORS errors in the browser console:
1. Check that `CORS_ALLOWED_ORIGINS` includes your frontend URL
2. Ensure `corsheaders` middleware is first in `MIDDLEWARE` list
3. Verify the backend is receiving requests (check logs)

### Static Files Not Loading

1. Run `python manage.py collectstatic` before deployment
2. Check `STATIC_ROOT` and `STATIC_URL` settings
3. Ensure whitenoise is installed and configured

### Database Connection Issues

1. Verify all database environment variables are set correctly
2. Check that your Supabase database allows connections from your hosting provider
3. Test database connection locally with the same credentials

### 500 Internal Server Error

1. Check backend logs for detailed error messages
2. Ensure `DEBUG=False` in production
3. Verify all required packages are in `requirements.txt`
4. Check that migrations are applied

---

## Recommended Approach Summary

**For production deployment**, I recommend:

1. ✅ **Frontend on Vercel** - Fast, reliable, great DX
2. ✅ **Backend on Railway** - Easy Django deployment, great for databases
3. ✅ **Database on Supabase** - Already configured, managed PostgreSQL

This gives you:
- Fast frontend delivery via Vercel's CDN
- Reliable Django backend on Railway
- Managed PostgreSQL database on Supabase
- Easy scaling and monitoring
- Better debugging and logs

---

## Next Steps

1. Choose your deployment approach (Option 1 recommended)
2. Create necessary configuration files
3. Set up your backend hosting (if using Option 1)
4. Deploy frontend to Vercel
5. Test thoroughly
6. Set up custom domain (optional)
7. Configure CI/CD for automatic deployments

---

## Additional Resources

- [Vercel Documentation](https://vercel.com/docs)
- [Railway Documentation](https://docs.railway.app)
- [Render Documentation](https://render.com/docs)
- [Django Deployment Checklist](https://docs.djangoproject.com/en/stable/howto/deployment/checklist/)
- [Vite Deployment Guide](https://vitejs.dev/guide/static-deploy.html)

---

## Support

If you encounter issues:
1. Check the troubleshooting section above
2. Review deployment logs in Vercel/Railway dashboard
3. Test API endpoints directly using Postman or curl
4. Check browser console for frontend errors

Good luck with your deployment! 🚀
