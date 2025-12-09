from flask import Flask, request, jsonify
from flask_cors import CORS
import numpy as np
import tensorflow as tf
from PIL import Image
import io
import base64
import os
import requests

app = Flask(__name__)
CORS(app)  # Enable CORS for frontend requests

# Get the absolute path to the backend directory
BASE_DIR = os.path.dirname(os.path.abspath(__file__))

# Disease information database
DISEASE_INFO = {
    "Bacterial diseases - Aeromoniasis": {
        "description": "Aeromoniasis is caused by Aeromonas bacteria. Symptoms include red sores, ulcers, hemorrhaging, and fin rot. It's highly contagious and can be fatal if untreated.",
        "treatment": "Treat with antibiotics (oxytetracycline or florfenicol), improve water quality, reduce stocking density, and isolate infected fish. Maintain optimal dissolved oxygen levels.",
        "prevention": "Maintain good water quality, avoid overstocking, ensure proper nutrition, and quarantine new fish."
    },
    "Bacterial gill disease": {
        "description": "Bacterial gill disease affects the gills, causing inflammation and necrosis. Fish show rapid gill movement, gasping at the surface, and reduced feeding.",
        "treatment": "Use antibiotics (oxytetracycline), improve water quality, increase aeration, and reduce organic matter. Salt baths (3%) can help.",
        "prevention": "Maintain clean water with low ammonia and nitrite levels, ensure adequate aeration, and avoid overcrowding."
    },
    "Bacterial Red disease": {
        "description": "Also known as Motile Aeromonad Septicemia (MAS), characterized by red spots, hemorrhages on skin and fins, bloated abdomen, and lethargy.",
        "treatment": "Antibiotic treatment (florfenicol or oxytetracycline), improve water quality, reduce stress factors. May require injection for severe cases.",
        "prevention": "Maintain optimal water temperature and quality, proper feeding, and stress reduction."
    },
    "Fungal diseases Saprolegniasis": {
        "description": "Saprolegniasis appears as white or gray cotton-like growth on skin, fins, and gills. Often secondary to injury or stress.",
        "treatment": "Salt baths (3-5%), antifungal treatments (malachite green or formalin), improve water quality, and treat underlying injuries.",
        "prevention": "Handle fish carefully to avoid injuries, maintain good water quality, and avoid overcrowding."
    },
    "Parasitic diseases": {
        "description": "Various external and internal parasites cause skin lesions, fin damage, weight loss, and abnormal swimming. Includes Ich, flukes, and anchor worms.",
        "treatment": "Depends on parasite type. Use specific antiparasitics (praziquantel for flukes, copper sulfate for protozoa). May require multiple treatments.",
        "prevention": "Quarantine new fish, maintain clean water, avoid introducing contaminated equipment or live food."
    },
    "Viral diseases White tail disease": {
        "description": "White Tail Disease (WTD) is a viral infection causing white discoloration at the tail, necrosis, loss of appetite, and high mortality rates.",
        "treatment": "No specific antiviral treatment available. Focus on supportive care: improve water quality, reduce stress, cull severely infected fish to prevent spread.",
        "prevention": "Use virus-free stock, maintain biosecurity, quarantine new arrivals, and prevent contamination from infected sources."
    },
    "Healthy Fish": {
        "description": "No disease detected. The fish appears healthy with no visible symptoms.",
        "treatment": "Continue regular monitoring and maintenance",
        "prevention": "Maintain optimal water quality, proper nutrition, and regular health checks"
    }
}

# DeepSeek API configuration (for AquaAI chat assistant)
DEEPSEEK_API_KEY = os.getenv("DEEPSEEK_API_KEY")
# NOTE: Verify this base URL and model name with DeepSeek's docs for deepseek-v3.2
DEEPSEEK_API_URL = os.getenv("DEEPSEEK_API_URL", "https://api.deepseek.com/chat/completions")
DEEPSEEK_MODEL = os.getenv("DEEPSEEK_MODEL", "deepseek-v3.2")

# Class names (must match training dataset order)
CLASS_NAMES = [
    "Bacterial Red disease",
    "Bacterial diseases - Aeromoniasis",
    "Bacterial gill disease",
    "Fungal diseases Saprolegniasis",
    "Healthy Fish",
    "Parasitic diseases",
    "Viral diseases White tail disease"
]


# Global variable to store the loaded model
model = None


# Provide the missing "preprocess_input" symbol so Keras can deserialize
# the saved model. The model was saved with a reference to a function
# named "preprocess_input"; here we map that name to the standard
# ResNet50 preprocessing implementation.
def preprocess_input(x):
    return tf.keras.applications.resnet50.preprocess_input(x)

def load_ml_model():
    """Load the trained ResNet50 model"""
    global model
    try:
        # Use absolute path relative to this script
        model_path = os.path.abspath(os.path.join(BASE_DIR, "models", "fish_disease_model.keras"))
        print(f"Attempting to load model from: {model_path}")
        print(f"Current working directory: {os.getcwd()}")
        print(f"BASE_DIR: {BASE_DIR}")
        
        if not os.path.exists(model_path):
            print(f"❌ Model file not found at: {model_path}")
            print("📝 Instructions:")
            print("   1. Train the model using Google Colab")
            print("   2. Download the trained model file (.keras)")
            print("   3. Place it at: backend/models/fish_disease_model.keras")
            print("   4. Restart the Flask server")
            return
            
        # Pass custom_objects so Keras knows how to resolve
        # the "preprocess_input" function used in the saved model
        model = tf.keras.models.load_model(
            model_path,
            custom_objects={"preprocess_input": preprocess_input},
        )
        print("✅ Model loaded successfully!")
        print(f"Model type: {type(model)}")
        print(f"Model input shape: {model.input_shape}")
    except Exception as e:
        print(f"❌ Error loading model: {e}")
        print(f"Error type: {type(e).__name__}")
        import traceback
        traceback.print_exc()
        print("\n📝 Make sure:")
        print("   1. The model file is a valid Keras model (.keras format)")
        print("   2. TensorFlow version matches the one used for training")
        print("   3. The model was saved with model.save() method")

def preprocess_image(image_data):
    if 'base64,' in image_data:
        image_data = image_data.split('base64,')[1]

    image_bytes = base64.b64decode(image_data)
    image = Image.open(io.BytesIO(image_bytes))

    if image.mode != 'RGB':
        image = image.convert('RGB')

    # Resize to the same size used during training
    image = image.resize((300, 300))

    img_array = tf.keras.preprocessing.image.img_to_array(image)

    # Apply SAME preprocessing used during training
    img_array = tf.keras.applications.resnet50.preprocess_input(img_array)

    img_array = tf.expand_dims(img_array, 0)
    return img_array


@app.route('/health', methods=['GET'])
def health_check():
    """Health check endpoint"""
    return jsonify({
        "status": "healthy",
        "model_loaded": model is not None
    })

@app.route('/detect-disease', methods=['POST'])
def detect_disease():
    """Detect fish disease from uploaded image"""
    try:
        if model is None:
            return jsonify({
                "error": "Model not loaded. Please train the model and place it at backend/models/fish_disease_model.keras, then restart the server."
            }), 500
        
        data = request.get_json()
        
        if 'imageBase64' not in data:
            return jsonify({"error": "No image provided"}), 400
        
        # Preprocess image
        img_array = preprocess_image(data['imageBase64'])
        
        # Make prediction
        predictions = model.predict(img_array)
        predicted_class_index = np.argmax(predictions[0])
        confidence = float(np.max(predictions[0]) * 100)
        
        # Get predicted class name
        predicted_class = CLASS_NAMES[predicted_class_index]
        
        # Determine if disease is detected
        is_disease_detected = predicted_class != "Healthy Fish"
        
        # Get disease information
        disease_info = DISEASE_INFO.get(predicted_class, {})
        
        # Prepare response
        result = {
            "detected": is_disease_detected,
            "diseaseName": predicted_class,
            "confidence": round(confidence, 2),
            "reasoning": f"ResNet50 model prediction with {round(confidence, 2)}% confidence",
            "description": disease_info.get("description", "Information not available"),
            "treatment": disease_info.get("treatment", "Consult with aquaculture veterinarian"),
            "prevention": disease_info.get("prevention", "Maintain good water quality and biosecurity")
        }
        
        return jsonify(result)
    
    except Exception as e:
        print(f"Error in disease detection: {str(e)}")
        return jsonify({
            "error": str(e)
        }), 500


@app.route('/chat', methods=['POST'])
def chat():
    """Proxy chat endpoint that calls DeepSeek for the AquaAI assistant."""
    if not DEEPSEEK_API_KEY:
        return jsonify({"error": "DeepSeek API key not configured on server"}), 500

    try:
        data = request.get_json(force=True) or {}
        messages = data.get("messages", [])
        if not isinstance(messages, list) or not messages:
            return jsonify({"error": "messages must be a non-empty list"}), 400

        # Basic safety: truncate conversation length and token budget on our side
        max_messages = 12
        trimmed_messages = messages[-max_messages:]

        # DeepSeek is assumed to be OpenAI-compatible; adjust fields as per official docs
        payload = {
            "model": DEEPSEEK_MODEL,
            "messages": trimmed_messages,
            "stream": False,
        }

        headers = {
            "Authorization": f"Bearer {DEEPSEEK_API_KEY}",
            "Content-Type": "application/json",
        }

        resp = requests.post(DEEPSEEK_API_URL, json=payload, headers=headers, timeout=30)
        if resp.status_code != 200:
            return jsonify({
                "error": "DeepSeek API error",
                "status": resp.status_code,
                "details": resp.text[:500],
            }), 502

        result = resp.json()
        # OpenAI-style response format: choices[0].message.content
        reply = (
            result.get("choices", [{}])[0]
            .get("message", {})
            .get("content", "")
        )

        if not reply:
            return jsonify({"error": "No reply from DeepSeek"}), 502

        return jsonify({"reply": reply})

    except Exception as e:
        return jsonify({"error": str(e)}), 500

if __name__ == '__main__':
    # Load model on startup
    load_ml_model()
    
    # Run Flask app
    app.run(host='0.0.0.0', port=5000, debug=True)
