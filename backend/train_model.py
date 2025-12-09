import numpy as np
import pandas as pd
import matplotlib.pyplot as plt
from PIL import Image
import tensorflow as tf
from tensorflow import keras
from tensorflow.keras import layers, models
from tensorflow.keras.models import Sequential, load_model
from tensorflow.keras.layers import Dense, Dropout, GlobalAveragePooling2D
from tensorflow.keras.preprocessing import image_dataset_from_directory
from tensorflow.keras.applications.resnet50 import preprocess_input
from sklearn.metrics import (
    accuracy_score,
    f1_score,
    recall_score,
    precision_score,
    confusion_matrix
)
import seaborn as sns
import os
from tensorflow.keras.applications import ResNet50

# CONFIGURATION
BATCH_SIZE = 32
IMAGE_SIZE = 300   # Bigger images → higher accuracy
CHANNELS = 3
EPOCHS = 40
PATH = 'dataset/'

print("Loading training dataset...")
dataset = image_dataset_from_directory(
    PATH + 'Train/',
    seed=42,
    shuffle=True,
    image_size=(IMAGE_SIZE, IMAGE_SIZE),
    batch_size=BATCH_SIZE
)

class_names = dataset.class_names
print(f"Classes found: {class_names}")

# TRAIN-VALIDATION SPLIT
TRAIN_SIZE = 0.9
train_batches = int(len(dataset) * TRAIN_SIZE)

train_ds = dataset.take(train_batches)
validation_ds = dataset.skip(train_batches)

# STRONG IMPROVED DATA AUGMENTATION
data_augmentation = tf.keras.Sequential([
    layers.RandomFlip("horizontal", seed=42),
    layers.RandomFlip("vertical", seed=42),
    layers.RandomRotation(0.3),
    layers.RandomZoom(0.3),
    layers.RandomContrast(0.2),
    layers.RandomBrightness(0.2)
])

train_ds = train_ds.map(
    lambda x, y: (data_augmentation(x, training=True), y)
).prefetch(buffer_size=tf.data.AUTOTUNE)

validation_ds = validation_ds.prefetch(buffer_size=tf.data.AUTOTUNE)

# MODEL ARCHITECTURE
input_shape = (IMAGE_SIZE, IMAGE_SIZE, CHANNELS)
n_classes = len(class_names)

print("Building ResNet50 model with fine-tuning...")

base_model = ResNet50(
    include_top=False,
    weights='imagenet',
    input_shape=input_shape
)

# ENABLE FINE-TUNING (Unfreeze from layer 140 onwards)
base_model.trainable = True
for layer in base_model.layers[:140]:
    layer.trainable = False

# BUILD FINAL MODEL
model = Sequential([
    layers.Lambda(preprocess_input, input_shape=input_shape),
    base_model,
    GlobalAveragePooling2D(),
    Dense(256, activation='relu'),
    Dropout(0.4),
    Dense(n_classes, activation='softmax')
])

# COMPILE WITH LOW LR
model.compile(
    optimizer=tf.keras.optimizers.Adam(learning_rate=1e-5),
    loss='sparse_categorical_crossentropy',
    metrics=['accuracy']
)

print("\nModel Summary:")
model.summary()

# CALLBACKS
callbacks = [
    tf.keras.callbacks.ModelCheckpoint(
        filepath='models/fish_disease_model.keras',
        save_best_only=True,
        monitor='val_accuracy',
        verbose=1
    ),
    tf.keras.callbacks.EarlyStopping(
        monitor='val_loss',
        patience=8,
        restore_best_weights=True
    ),
    tf.keras.callbacks.ReduceLROnPlateau(
        monitor='val_loss',
        factor=0.2,
        patience=3,
        min_lr=1e-7,
        verbose=1
    )
]

# TRAIN MODEL
print("\nStarting Training...")
history = model.fit(
    train_ds,
    validation_data=validation_ds,
    epochs=EPOCHS,
    batch_size=BATCH_SIZE,
    callbacks=callbacks,
    verbose=1
)

# SAVE FINAL MODEL
model.save('models/fish_disease_model.keras')
print("Final model saved!")

# -------------------------
#       EVALUATION
# -------------------------

print("\nEvaluating on test set...")

test_dataset = image_dataset_from_directory(
    PATH + 'Test/',
    seed=42,
    shuffle=False,
    image_size=(IMAGE_SIZE, IMAGE_SIZE),
    batch_size=BATCH_SIZE
).prefetch(buffer_size=tf.data.AUTOTUNE)

all_predictions = []
all_labels = []

for images, labels in test_dataset:
    predictions = model.predict(images)
    predicted_classes = np.argmax(predictions, axis=1)
    all_predictions.extend(predicted_classes)
    all_labels.extend(labels.numpy())

accuracy = accuracy_score(all_labels, all_predictions)
f1 = f1_score(all_labels, all_predictions, average='weighted')
recall = recall_score(all_labels, all_predictions, average='weighted')
precision = precision_score(all_labels, all_predictions, average='weighted')

print("\nTest Set Metrics:")
print(f"Accuracy:  {accuracy:.4f}")
print(f"F1 Score:  {f1:.4f}")
print(f"Recall:    {recall:.4f}")
print(f"Precision: {precision:.4f}")

# -------------------------
# CONFUSION MATRIX PLOT
# -------------------------

conf_matrix = confusion_matrix(all_labels, all_predictions)
plt.figure(figsize=(12, 10))
sns.heatmap(conf_matrix, annot=True, fmt='d', cmap='Blues',
            xticklabels=class_names, yticklabels=class_names)
plt.xlabel("Predicted Labels")
plt.ylabel("True Labels")
plt.title("Confusion Matrix")
plt.tight_layout()
plt.savefig('models/confusion_matrix.png', dpi=300)
print("Confusion matrix saved!")

# -------------------------
# TRAINING CURVES
# -------------------------

acc = history.history['accuracy']
val_acc = history.history['val_accuracy']
loss = history.history['loss']
val_loss = history.history['val_loss']

plt.figure(figsize=(14, 6))

plt.subplot(1, 2, 1)
plt.plot(acc, label="Training Accuracy")
plt.plot(val_acc, label="Validation Accuracy")
plt.legend()
plt.title("Training vs Validation Accuracy")

plt.subplot(1, 2, 2)
plt.plot(loss, label="Training Loss")
plt.plot(val_loss, label="Validation Loss")
plt.legend()
plt.title("Training vs Validation Loss")

plt.tight_layout()
plt.savefig('models/training_curves.png', dpi=300)
print("Training curves saved!")

print("\nTraining complete!")
