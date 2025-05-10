import os
import cv2
import numpy as np
import tensorflow as tf # type: ignore
import json

from django.shortcuts import render
from django.core.files.storage import default_storage
from django.core.files.base import ContentFile
from .models import PlantImage
from django.conf import settings

# Load the .keras model once
model = tf.keras.models.load_model(os.path.join(settings.BASE_DIR, 'Models/plant_disease_recognz_model_pwp.keras'))

# Load labels
with open(os.path.join(settings.BASE_DIR, "plant_disease.json"), 'r') as file:
    plant_disease = json.load(file)

def process_image(filepath):
    """Processes the uploaded plant image to detect diseased areas."""

    image = cv2.imread(filepath)
    if image is None:
        return 0.0, None

    b, g, r = cv2.split(image)
    disease = cv2.subtract(r.astype(np.int16), g.astype(np.int16))
    disease = np.clip(disease * 5, 0, 255).astype(np.uint8)
    _, disease_binary = cv2.threshold(disease, 0, 255, cv2.THRESH_BINARY + cv2.THRESH_OTSU)

    alpha = np.zeros_like(b, dtype=np.uint8)
    for i in range(image.shape[0]):
        for j in range(image.shape[1]):
            if image[i, j, 0] > 200 and image[i, j, 1] > 200 and image[i, j, 2] > 200:
                alpha[i, j] = 255
            else:
                alpha[i, j] = 0

    count_diseased = np.count_nonzero((disease_binary == 255) & (alpha == 0))
    total_valid_pixels = np.count_nonzero(alpha == 0)

    if total_valid_pixels == 0:
        return 0.0, None

    disease_percentage = (count_diseased / total_valid_pixels) * 100
    processed_filepath = filepath.replace(".jpg", "_disease.jpg")
    cv2.imwrite(processed_filepath, disease_binary)

    return round(disease_percentage, 2), processed_filepath

def predict_disease(filepath):
    """Run classification using the .keras model."""
    img = tf.keras.utils.load_img(filepath, target_size=(160, 160))
    img_array = tf.keras.utils.img_to_array(img)
    img_array = np.expand_dims(img_array, axis=0)  # Shape (1, 160, 160, 3)
    predictions = model.predict(img_array)
    label_index = np.argmax(predictions)
    predicted_label = plant_disease[label_index]
    return predicted_label

def upload_image(request):
    """Handles image upload, processing, and classification."""
    
    if request.method == "POST" and request.FILES.get("image"):
        file = request.FILES["image"]

        # Save image to the database
        image_instance = PlantImage(original_image=file)
        image_instance.save()

        original_image_path = image_instance.original_image.path
        disease_percentage, processed_filepath = process_image(original_image_path)

        # Predict class label from the original image
        predicted_label = predict_disease(original_image_path)

        # Save results
        image_instance.processed_image = processed_filepath
        image_instance.disease_percentage = disease_percentage
        image_instance.predicted_label = predicted_label  # Ensure this field exists in your model
        image_instance.save()

        return render(request, "index.html", {
            "image": image_instance
        })

    return render(request, "index.html")
