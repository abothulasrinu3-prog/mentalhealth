# MindCare AI - Mental Health Tracker

A complete full-stack mental health tracking platform with AI-powered insights, mood tracking, journaling, and machine learning predictions.

![MindCare AI](https://img.shields.io/badge/MindCare-AI-blue)
![React](https://img.shields.io/badge/React-18-61DAFB?logo=react)
![Node.js](https://img.shields.io/badge/Node.js-18-339933?logo=node.js)
![MongoDB](https://imIg.shields.io/badge/MongoDB-7.0-47A248?logo=mongodb)
![Python](https://img.shields.io/badge/Python-3.10-3776AB?logo=python)

## ✨ Features

### Core Features
- **🔐 Authentication** - JWT-based secure login and registration
- **📊 Dashboard** - Overview of mood, stress, sleep, and wellness metrics
- **😊 Mood Tracking** - Log daily emotions with intensity and comprehensive wellness metrics
- **📔 Journal** - Private journaling with sentiment analysis and search
- **📈 Analytics** - Charts and trends for mood, sleep, and stress patterns
- **🤖 AI Suggestions** - Personalized wellness recommendations based on your data
- **🧠 ML Predictions** - Machine learning predictions for stress/anxiety risk
- **🆘 Emergency Support** - India-focused crisis resources and helplines
- **🫁 Breathing Exercises** - Guided breathing techniques with animations

### Advanced Features
- **Dark/Light Mode** - Full theme support
- **Responsive Design** - Mobile-first, works on all devices
- **Streak Tracking** - Track your consistency
- **Real-time Charts** - Interactive Recharts visualizations
- **Sentiment Analysis** - Basic sentiment detection in journal entries
- **Wellness Score** - Personalized wellness scoring algorithm

## 🏗️ Architecture

```
mindcare-ai/
├── client/                 # React + Vite Frontend
│   ├── src/
│   │   ├── components/    # Reusable UI components
│   │   ├── pages/         # Page components
│   │   ├── context/       # React Context (Auth, Theme)
│   │   ├── services/      # API services
│   │   └── utils/         # Utility functions
│   └── public/            # Static assets
├── server/                 # Node.js + Express Backend
│   ├── src/
│   │   ├── controllers/   # Route controllers
│   │   ├── models/        # MongoDB schemas
│   │   ├── routes/        # API routes
│   │   ├── middleware/    # Auth & validation
│   │   └── config/        # Database config
│   └── package.json
└── ml-service/             # Python Flask ML Microservice
    ├── app.py             # Flask API
    ├── train_model.py     # ML model training
    ├── requirements.txt   # Python dependencies
    └── model/             # Trained models
```

## 🚀 Quick Start

### Prerequisites
- Node.js 18+
- MongoDB 5.0+ (local or Atlas)
- Python 3.10+ (for ML service)

### 1. Clone and Setup

```bash
cd mindcare-ai
```

### 2. Backend Setup

```bash
cd server
npm install

# Create .env file
cp .env.example .env
# Edit .env with your MongoDB URI and JWT secret

# Start server
npm run dev

# Optional: start the local load balancer after frontend/API/ML are running
npm run load-balancer
```

### 3. Frontend Setup

```bash
cd client
npm install

# Create .env file
cp .env.example .env

# Start development server
npm run dev
```

### 4. ML Service Setup (Optional)

```bash
cd ml-service

# Create virtual environment
python -m venv venv

# Activate virtual environment
# Windows:
venv\Scripts\activate
# Mac/Linux:
source venv/bin/activate

# Install dependencies
pip install -r requirements.txt

# Train the model
python train_model.py

# Start Flask server
python app.py
```

## 📱 Usage

1. **Register** a new account at `http://localhost:5173/register`
2. **Log in** with your credentials
3. **Track your mood** daily with the Mood Tracker
4. **Write journal entries** to process your thoughts
5. **View analytics** to understand your patterns
6. **Get AI suggestions** based on your data
7. **Practice breathing exercises** when feeling stressed

## ⚖️ Local Load Balancer

The project includes a lightweight Node.js reverse proxy for running the complete website behind one URL:

```bash
cd server
npm run load-balancer
```

- Complete website: `http://localhost:8080`
- Load balancer health: `http://localhost:8080/lb-health`
- API traffic: `/api/*` and `/health` route to the backend
- ML traffic: `/ml/*` routes to the Flask ML service, for example `/ml/health`
- Frontend traffic: all other paths route to the Vite frontend

You can scale targets with comma-separated environment variables:

```env
FRONTEND_TARGETS=http://127.0.0.1:5173,http://127.0.0.1:5174
API_TARGETS=http://127.0.0.1:5000,http://127.0.0.1:5002
ML_TARGETS=http://127.0.0.1:5001,http://127.0.0.1:5003
LOAD_BALANCER_PORT=8080
```

## ☁️ Deployment

### Frontend on Vercel

Deploy the `client` folder as a Vite project:

- Root directory: `client`
- Install command: `npm install`
- Build command: `npm run build`
- Output directory: `dist`
- Production env vars:

```env
VITE_API_URL=https://mentalhealth-api.onrender.com/api
VITE_ML_SERVICE_URL=https://mentalhealth-ml.onrender.com
```

### Backend and ML on Render

The repository includes `render.yaml` for a Render Blueprint with two web services:

- `mentalhealth-api` from `server`
- `mentalhealth-ml` from `ml-service`

Required Render secret env vars:

```env
MONGO_URI=your_mongodb_atlas_connection_string
CLIENT_URL=your_vercel_production_url
ALLOWED_ORIGINS=your_vercel_production_url
```

Optional nutrition and wearable provider keys can be added in Render later.

## 🔗 API Endpoints

### Authentication
- `POST /api/auth/register` - Register new user
- `POST /api/auth/login` - Login user
- `GET /api/auth/me` - Get current user

### Mood
- `POST /api/mood/add` - Add mood entry
- `GET /api/mood/history` - Get mood history
- `GET /api/mood/today` - Get today's mood

### Journal
- `POST /api/journal/add` - Add journal entry
- `GET /api/journal/list` - Get journal entries
- `GET /api/journal/search` - Search journal entries

### Analytics
- `GET /api/analytics/summary` - Get wellness summary
- `GET /api/analytics/mood-trends` - Get mood trends
- `GET /api/analytics/wellness-score` - Get wellness score

### Suggestions
- `POST /api/suggestions/generate` - Generate AI suggestions
- `GET /api/suggestions/list` - Get suggestions

### ML Service
- `POST /predict` - Get mental wellness prediction

## 🧠 Machine Learning

The ML service includes:
- **Random Forest Classifier**
- **Logistic Regression**
- **Decision Tree**
- **K-Nearest Neighbors**
- **Naive Bayes**
- **Support Vector Machine**

Models predict mental wellness risk levels (low/medium/high) based on:
- Sleep hours
- Stress level
- Exercise duration
- Screen time
- Social interaction
- Mood score
- Water intake

## 🛡️ Security Features

- Password hashing with bcrypt
- JWT authentication
- Protected API routes
- Rate limiting
- Helmet security headers
- CORS configuration
- Input validation

## 📝 Environment Variables

### Server (.env)
```
PORT=5000
MONGO_URI=mongodb://localhost:27017/mindcare_ai
JWT_SECRET=your_secret_key
JWT_EXPIRE=7d
ML_SERVICE_URL=http://localhost:5001
NODE_ENV=development
CLIENT_URL=http://localhost:5173
EDAMAM_APP_ID=
EDAMAM_APP_KEY=
FATSECRET_CLIENT_ID=
FATSECRET_CLIENT_SECRET=
SPOONACULAR_API_KEY=
GOOGLE_FIT_CLIENT_ID=
GOOGLE_FIT_CLIENT_SECRET=
GOOGLE_FIT_REDIRECT_URI=
```

### Client (.env)
```
VITE_API_URL=http://localhost:5000/api
VITE_ML_SERVICE_URL=http://localhost:5001
```

### ML Service (.env)
```
FLASK_APP=app.py
FLASK_ENV=development
PORT=5001
MODEL_PATH=./model/best_model.pkl
```

## Live Integrations

This project now supports server-side readiness checks for live external providers:

- `Edamam` for nutrition analysis
- `FatSecret` for nutrition lookup via OAuth 2.0
- `Spoonacular` for recipe and meal idea search
- `Google Fit` as the practical web wearable integration

Important notes:

- `Health Connect` is Android-only and cannot be connected directly from this web app.
- `T2 Mood Tracker`, `Moodscope`, and `Ginger.io` were not wired because a public official developer API could not be verified from their official sites.
- The Nutrition Tracker falls back to the local estimator when live API keys are not configured.

## 🚀 Deployment

### Frontend (Vercel)
```bash
cd client
npm run build
vercel --prod
```

### Backend (Render/Railway)
```bash
cd server
# Set environment variables in dashboard
# Deploy with Git integration
```

### ML Service (Render/Heroku)
```bash
cd ml-service
# Create Procfile with: web: gunicorn app:app
# Deploy with environment variables
```

### MongoDB (Atlas)
1. Create cluster at mongodb.com
2. Get connection string
3. Update MONGO_URI in server .env

## ⚠️ Disclaimer

**MindCare AI is for self-tracking and wellness support only. It is NOT a substitute for professional medical, psychiatric, or psychological diagnosis or treatment.**

If you are experiencing a mental health crisis:
- Call Tele-MANAS at 14416 or 1800-891-4416 in India
- Call 112 for immediate emergency response in India
- Visit your nearest emergency room

## 📄 License

MIT License - feel free to use this project for personal or commercial purposes.

## 🙏 Acknowledgments

- Icons by [Lucide](https://lucide.dev)
- Charts by [Recharts](https://recharts.org)
- Styling by [Tailwind CSS](https://tailwindcss.com)
- ML powered by [scikit-learn](https://scikit-learn.org)

---

Built with ❤️ for better mental health awareness.
