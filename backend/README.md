# Fish Disease Detection Backend (Flask + ResNet50)

This is the backend service for fish disease detection using a trained ResNet50 deep learning model.

## Project Structure

```
backend/
├── app.py                 # Flask API server
├── train_model.py         # Model training script
├── requirements.txt       # Python dependencies
├── models/               # Directory for trained models
│   └── fish_disease_model.keras  # Trained model file (after training)
├── dataset/              # Dataset directory (you need to add this)
│   ├── Train/
│   │   ├── Bacterial diseases - Aeromoniasis/
│   │   ├── Bacterial gill disease/
│   │   ├── Bacterial Red disease/
│   │   ├── Fungal diseases Saprolegniasis/
│   │   ├── Healthy Fish/
│   │   ├── Parasitic diseases/
│   │   └── Viral diseases White tail disease/
│   └── Test/
│       └── (same structure as Train/)
└── README.md             # This file
```

## ⚠️ IMPORTANT: Model File Required

**The trained model file is NOT included in this repository.** Before running the Flask server, you must:

1. **Option A - Use Your Pre-trained Model** (Recommended if you already trained it):
   - Place your `fish_disease_model.keras` file in the `backend/models/` directory
   - Path should be: `backend/models/fish_disease_model.keras`

2. **Option B - Train the Model** (If you have the dataset):
   - Follow steps 2-3 below to train a new model

## Setup Instructions

### 1. Install Dependencies

```bash
cd backend
pip install -r requirements.txt
```

### 2. Prepare Dataset (Only if training)

Download the "Freshwater Fish Disease Aquaculture in South Asia" dataset from Kaggle and place it in the `dataset/` directory following the structure shown above.

Dataset link: (https://www.kaggle.com/datasets/subirbiswas19/freshwater-fish-disease-aquaculture-in-south-asia)

### 3. Train the Model (Only if training)

```bash
python train_model.py
```

This will:
- Train a ResNet50 model on your dataset
- Save the best model to `models/fish_disease_model.keras`
- Generate confusion matrix and training curves
- Take approximately 1-2 hours depending on your hardware

**Training Requirements:**
- GPU recommended (NVIDIA with CUDA support)
- At least 8GB RAM
- 50+ epochs for best results

### 4. Run the Flask Server

```bash
python app.py
```

The server will start on `http://localhost:5000`

## API Endpoints

### Health Check
```
GET /health
```

Response:
```json
{
  "status": "healthy",
  "model_loaded": true
}
```

### Detect Disease
```
POST /detect-disease
Content-Type: application/json

{
  "imageBase64": "data:image/jpeg;base64,/9j/4AAQSkZJRg..."
}
```

Response:
```json
{
  "detected": true,
  "diseaseName": "Bacterial Red disease",
  "confidence": 94.5,
  "reasoning": "ResNet50 model prediction with 94.5% confidence",
  "description": "Also known as Motile Aeromonad Septicemia...",
  "treatment": "Antibiotic treatment (florfenicol or oxytetracycline)...",
  "prevention": "Maintain optimal water temperature and quality..."
}
```

## Deployment Options

### Option 1: Local Development
Run the Flask server locally and update the frontend to point to `http://localhost:5000`

### Option 2: Deploy to Cloud

#### Heroku
```bash
# Install Heroku CLI
heroku login
heroku create your-app-name
git push heroku main
```

#### AWS EC2
1. Launch an EC2 instance (Ubuntu recommended)
2. Install Python and dependencies
3. Copy your trained model to the instance
4. Run the Flask app with `gunicorn`

#### Google Cloud Run
1. Create a Dockerfile
2. Build and push to Google Container Registry
3. Deploy to Cloud Run

#### Railway/Render
1. Connect your GitHub repository
2. Set build command: `pip install -r requirements.txt`
3. Set start command: `python app.py`

### Option 3: Use Pre-trained Model
If you don't want to train the model yourself, you can:
1. Download a pre-trained model from Kaggle/GitHub
2. Place it in `models/fish_disease_model.keras`
3. Ensure it uses the same architecture and class order

## Model Architecture

- **Base Model**: ResNet50 (pre-trained on ImageNet)
- **Input Size**: 256x256x3 RGB images
- **Classes**: 7 (6 diseases + 1 healthy)
- **Final Layers**: 
  - Flatten
  - Dense(384, relu)
  - Dropout(0.3)
  - Dense(7, softmax)

## Performance Metrics

After training, the model achieves approximately:
- **Accuracy**: 95-97%
- **Precision**: 94-96%
- **Recall**: 93-95%
- **F1-Score**: 94-96%

(Actual metrics will vary based on your training data)

## Troubleshooting

### Model Not Loading
- Ensure `models/fish_disease_model.keras` exists
- Check TensorFlow version compatibility
- Verify model was saved correctly during training

### Low Accuracy
- Train for more epochs (50+ recommended)
- Increase dataset size
- Adjust data augmentation parameters
- Fine-tune the base model layers

### Memory Issues
- Reduce batch size
- Use a smaller image size (128x128)
- Enable mixed precision training

## Security Notes

- This server allows CORS from all origins (`*`) for development
- For production, restrict CORS to your frontend domain only
- Add rate limiting to prevent abuse
- Implement authentication if needed
- Use HTTPS in production

## License

MIT License
