# Review Session Application

A full-stack review session management application with Django backend and React frontend.

## Features

- **Admin Dashboard**: Manage questions and review sessions
- **Reviewer Dashboard**: Conduct review sessions with students
- **Review Sessions**: Interactive flashcard-style question review
- **Timer Functionality**: Track time spent on review sessions
- **Score Tracking**: Generate detailed review reports
- **3D Background**: Modern UI with Three.js animations

## Tech Stack

### Backend
- Django
- Django REST Framework
- SQLite Database

### Frontend
- React
- Vite
- Three.js (for 3D backgrounds)
- React Router

## Project Structure

```
.
├── backend/          # Django backend
│   ├── config/       # Django project settings
│   ├── core/         # Core app (questions, sessions)
│   └── users/        # User management
└── frontend/         # React frontend
    └── src/
        ├── components/
        ├── pages/
        └── context/
```

## Setup Instructions

### Backend Setup

1. Navigate to the backend directory:
   ```bash
   cd backend
   ```

2. Create a virtual environment:
   ```bash
   python -m venv venv
   source venv/bin/activate  # On Windows: venv\Scripts\activate
   ```

3. Install dependencies:
   ```bash
   pip install django djangorestframework django-cors-headers
   ```

4. Copy `.env.example` to `.env` and configure your environment variables:
   ```bash
   cp .env.example .env
   ```

5. Run migrations:
   ```bash
   python manage.py migrate
   ```

6. Create a superuser:
   ```bash
   python manage.py createsuperuser
   ```

7. Run the development server:
   ```bash
   python manage.py runserver
   ```

### Frontend Setup

1. Navigate to the frontend directory:
   ```bash
   cd frontend
   ```

2. Install dependencies:
   ```bash
   npm install
   ```

3. Run the development server:
   ```bash
   npm run dev
   ```

4. Open your browser and navigate to `http://localhost:5173`

## Environment Variables

Create a `.env` file in the backend directory with the following variables:

```
SECRET_KEY=your-secret-key-here
DEBUG=True
ALLOWED_HOSTS=localhost,127.0.0.1
```

## Deployment

Ready to deploy your application? **100% FREE hosting available!** 🎉

### 🆓 Free Hosting (Recommended for Personal Projects)
👉 **[FREE_HOSTING_GUIDE.md](./FREE_HOSTING_GUIDE.md)** - Deploy free using Vercel + Render + Supabase

**No credit card required. Free forever.**
- ✅ Free frontend on Vercel (100GB bandwidth/month)
- ✅ Free backend on Render (spins down after 15 min inactivity)
- ✅ Free PostgreSQL on Supabase (500MB)

### 📚 Additional Guides
- **[VERCEL_DEPLOYMENT_GUIDE.md](./VERCEL_DEPLOYMENT_GUIDE.md)** - Comprehensive deployment guide with all options
- **[FREE_HOSTING_QUICK_REF.md](./FREE_HOSTING_QUICK_REF.md)** - Quick reference with visual diagram

### What's Included
All configuration files are ready:
- ✅ `frontend/vercel.json` - Vercel configuration
- ✅ `backend/Procfile` - Render configuration
- ✅ `backend/requirements.txt` - Python dependencies with production packages
- ✅ `backend/runtime.txt` - Python version
- ✅ `.env.example` files for both frontend and backend

## License

MIT License
