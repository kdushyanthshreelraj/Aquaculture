# AI-Based Fish Disease Detection & Aquaculture Management System

A comprehensive full-stack application for aquaculture management that combines **React frontend** with **Flask ML backend** for intelligent fish disease detection, species identification, pond design, and yield prediction.

## 🎯 Key Features

### 1. 🐟 Fish Disease Detection (ML-Powered)
- Upload fish images for instant disease diagnosis
- **ResNet50 deep learning model** trained on real fish disease dataset
- Detects 6 major diseases + healthy fish classification
- Provides detailed treatment and prevention recommendations
- 95-97% accuracy on test dataset

**Detectable Diseases:**
- Bacterial diseases (Aeromoniasis, Gill disease, Red disease)
- Fungal diseases (Saprolegniasis)
- Parasitic diseases
- Viral diseases (White Tail Disease)

### 2. 🌡️ Fish Species Identification
- Smart species recommendation based on:
  - Pond dimensions and water type
  - Real-time weather data (OpenWeather API)
  - Temperature patterns and location
- Suggests optimal species: Catla, Rohu, Mrigal, Tilapia, Pangasius

### 3. 🏗️ Pond Design Calculator
- Calculate optimal pond layout from available land
- Automatic pond arrangement (rows × columns)
- Volume and area calculations
- Save and view design history

### 4. 📊 Yield & Feed Prediction
- Estimate expected fish yield
- Calculate daily feed requirements
- Growth projections and feeding schedules

### 5. 💬 AI Chatbot
- Aquaculture expertise at your fingertips
- Powered by Lovable AI
- Get instant answers about fish farming

## 🏗️ Architecture

```
┌─────────────────────────────────────────────────────────┐
│                    FRONTEND (React)                      │
│  ┌─────────────────────────────────────────────────┐   │
│  │ User uploads image → Base64 encoding             │   │
│  └─────────────────────────────────────────────────┘   │
└───────────────────────┬─────────────────────────────────┘
                        │ HTTP POST
                        │ /detect-disease
                        ↓
┌─────────────────────────────────────────────────────────┐
│              BACKEND (Flask + TensorFlow)                │
│  ┌─────────────────────────────────────────────────┐   │
│  │ 1. Preprocess image (256×256, normalize)        │   │
│  │ 2. ResNet50 inference                           │   │
│  │ 3. Add disease info & treatment                 │   │
│  │ 4. Return JSON with prediction                  │   │
│  └─────────────────────────────────────────────────┘   │
└───────────────────────┬─────────────────────────────────┘
                        │ JSON Response
                        ↓
┌─────────────────────────────────────────────────────────┐
│                    FRONTEND (React)                      │
│  ┌─────────────────────────────────────────────────┐   │
│  │ Display results with disease details            │   │
│  └─────────────────────────────────────────────────┘   │
└─────────────────────────────────────────────────────────┘
```

## 📁 Project Structure

```
fish-disease-detection/
├── src/                      # Frontend (React + TypeScript)
│   ├── pages/               # Application pages
│   ├── components/          # Reusable components
│   └── integrations/        # Supabase integration
│
├── backend/                 # ML Backend (Flask + TensorFlow)
│   ├── app.py              # Flask API server
│   ├── train_model.py      # Model training script
│   ├── requirements.txt    # Python dependencies
│   └── models/            
│       └── fish_disease_model.keras  # ⚠️ Place trained model here
│
└── supabase/               # Backend services
    ├── functions/          # Edge functions
    └── migrations/         # Database migrations
```

See [PROJECT_STRUCTURE.md](PROJECT_STRUCTURE.md) for detailed documentation.

## 🚀 Quick Start

### Prerequisites
- **Node.js** 18+ and npm
- **Python** 3.9+
- **Trained ResNet50 model** (see Backend Setup)

### Frontend Setup

```bash
# Install dependencies
npm install

# Start development server
npm run dev
# Frontend runs on http://localhost:5173
```

### Backend Setup

```bash
# Navigate to backend
cd backend

# Install Python dependencies
pip install -r requirements.txt

# ⚠️ IMPORTANT: Place your trained model file here
# backend/models/fish_disease_model.keras

# Start Flask server
python app.py
# Backend runs on http://localhost:5000
```

### Environment Configuration

Ensure your `.env` file has:
```env
VITE_FLASK_BACKEND_URL=http://localhost:5000
```

## 🧠 Machine Learning Model

### Model Details
- **Architecture**: ResNet50 (transfer learning)
- **Input**: 256×256 RGB images
- **Output**: 7 classes (6 diseases + healthy)
- **Training**: 50 epochs with data augmentation
- **Performance**: ~95-97% accuracy

### Training the Model

```bash
cd backend

# 1. Download dataset from Kaggle
# Place in backend/dataset/ folder

# 2. Train model
python train_model.py

# 3. Model saved to models/fish_disease_model.keras
```

**Training Requirements:**
- GPU recommended (NVIDIA CUDA)
- 8GB+ RAM
- 1-2 hours training time

See [backend/README.md](backend/README.md) for detailed training instructions.

## 🌐 Deployment

### Frontend Deployment
- **Lovable**: Automatic deployment (recommended)
- **Alternatives**: Vercel, Netlify

### Backend Deployment
- **Heroku**: `git push heroku main`
- **Railway/Render**: Connect GitHub repo
- **AWS/GCP**: Deploy with Docker

**Important**: Update `VITE_FLASK_BACKEND_URL` in `.env` to your deployed backend URL.

## 🛠️ Tech Stack

| Component | Technology |
|-----------|-----------|
| **Frontend** | React 18, TypeScript, Vite |
| **Styling** | Tailwind CSS, Shadcn UI |
| **Backend** | Flask (Python) |
| **ML Framework** | TensorFlow 2.15 |
| **ML Model** | ResNet50 |
| **Database** | PostgreSQL (Supabase) |
| **Auth** | Supabase Auth |
| **APIs** | OpenWeather API |

## 📝 API Endpoints

### Backend (Flask)
- `GET /health` - Health check and model status
- `POST /detect-disease` - Fish disease prediction

### Frontend Routes
- `/` - Homepage
- `/auth` - Authentication
- `/fish-species` - Species identification
- `/fish-disease` - Disease detection
- `/yield-feed` - Yield & feed calculator
- `/pond-design` - Pond design tool

## ⚠️ Important Notes

1. **Model File Required**: The trained model (`fish_disease_model.keras`) is **NOT** in the repository. You must:
   - Train it yourself, OR
   - Download a pre-trained model
   - Place it in `backend/models/`

2. **Separate Deployments**: Frontend and backend are deployed independently. Both must be running for disease detection to work.

3. **CORS Configuration**: Backend allows all origins in development. **Restrict in production**:
   ```python
   CORS(app, origins=["https://your-domain.com"])
   ```

4. **API Keys**: OpenWeather API key is required for species detection (configured in Supabase secrets).

## 🔒 Security

- ✅ Supabase RLS policies for data protection
- ✅ Email/password authentication
- ✅ CORS configured (restrict in production)
- ⚠️ Add rate limiting for production API

## 📚 Documentation

- [Project Structure](PROJECT_STRUCTURE.md) - Detailed architecture
- [Backend Setup](backend/README.md) - ML backend guide
- [Model Training](backend/models/README.md) - Model placement guide

## 🤝 Contributing

1. Fork the repository
2. Create feature branch (`git checkout -b feature/amazing-feature`)
3. Commit changes (`git commit -m 'Add amazing feature'`)
4. Push to branch (`git push origin feature/amazing-feature`)
5. Open Pull Request

## 📄 License

MIT License - See LICENSE file for details

## 🆘 Troubleshooting

### "Model not loaded" error
- Ensure `fish_disease_model.keras` exists in `backend/models/`
- Check Flask console for model loading errors

### "Failed to fetch" error
- Verify Flask backend is running on port 5000
- Check `VITE_FLASK_BACKEND_URL` in `.env`
- Ensure CORS is enabled in Flask

### Fish species detection error
- Verify OpenWeather API key is configured
- Check edge function logs in Lovable Cloud

## 📧 Support

For issues and questions, please open an issue on GitHub or contact the development team.

---

**Built with ❤️ for sustainable aquaculture**
