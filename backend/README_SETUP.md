# Backend Setup Guide

## Quick Start

### 1. Install Python Dependencies
```bash
cd backend
pip install -r requirements.txt
```

### 2. Train the Model

**Option A: Using Google Colab (Recommended)**
1. Open `train_model.py` in Google Colab
2. Upload your dataset to Colab
3. Run all cells to train the model
4. Download the generated `fish_disease_model.keras` file
5. Place it in `backend/models/fish_disease_model.keras`

**Option B: Local Training**
```bash
python train_model.py
```

### 3. Verify Model File
Make sure the model file exists at:
```
backend/models/fish_disease_model.keras
```

### 4. Run Flask Server
```bash
python app.py
```

The server will start on `http://localhost:5000`

## Verify Setup

### Check Health Endpoint
```bash
curl http://localhost:5000/health
```

Expected response:
```json
{
  "status": "healthy",
  "model_loaded": true
}
```

### Test Disease Detection
Use the frontend Disease Detection page at `/disease-detection`

## Troubleshooting

### Model Not Loading
- Ensure the file is exactly at `backend/models/fish_disease_model.keras`
- Check that the file is a valid Keras model (.keras format)
- Verify TensorFlow version matches (2.15.0)
- Check console output for detailed error messages

### CORS Errors
- Make sure Flask server is running
- Verify `VITE_FLASK_BACKEND_URL=http://localhost:5000` in frontend `.env` file

### Port Already in Use
- Change port in `app.py`: `app.run(host='0.0.0.0', port=5001, debug=True)`
- Update `VITE_FLASK_BACKEND_URL` in frontend `.env` accordingly

## Project Structure

```
backend/
├── app.py                    # Flask application
├── train_model.py           # Model training script
├── requirements.txt         # Python dependencies
├── models/
│   ├── fish_disease_model.keras   # Trained model (you need to add this)
│   └── README.md
└── README_SETUP.md          # This file
```
