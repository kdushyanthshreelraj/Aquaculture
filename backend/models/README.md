# Models Directory

This directory should contain your trained machine learning model.

## Required File

Place your trained model file here:
- **File name:** `fish_disease_model.keras`
- **Full path:** `backend/models/fish_disease_model.keras`

## Training the Model

1. Navigate to the backend directory:
   ```bash
   cd backend
   ```

2. Install dependencies:
   ```bash
   pip install -r requirements.txt
   ```

3. Run the training script with your dataset:
   ```bash
   python train_model.py
   ```

4. The trained model will be saved to `models/fish_disease_model.keras`

## Important Notes

- The `.gitignore` file is configured to ignore `.keras` files to avoid committing large model files
- Make sure the model file exists before running the Flask application
- The model should be trained using the ResNet50 architecture as specified in `train_model.py`
- Model input size: 256x256 pixels, 3 channels (RGB)

## Model Classes

The model should be trained to detect these 7 classes:
1. Bacterial diseases - Aeromoniasis
2. Bacterial gill disease
3. Bacterial Red disease
4. Fungal diseases Saprolegniasis
5. Healthy Fish
6. Parasitic diseases
7. Viral diseases White tail disease
