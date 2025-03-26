import os
import cv2
import numpy as np
from django.shortcuts import render
from django.core.files.storage import default_storage
from django.core.files.base import ContentFile
from django.conf import settings
from .models import PlantImage

def process_image(filepath):
    """Processes the uploaded image to detect plant disease and generates a processed version."""
    
    image = cv2.imread(filepath)
    if image is None:
        return 0.0, None  # Return default values if image loading fails

    # Convert to HSV for better color separation
    hsv = cv2.cvtColor(image, cv2.COLOR_BGR2HSV)
    h, s, v = cv2.split(hsv)

    # Apply Contrast Limited Adaptive Histogram Equalization (CLAHE)
    clahe = cv2.createCLAHE(clipLimit=3.0, tileGridSize=(8, 8))
    s_eq = clahe.apply(s)

    # Edge detection using Canny
    edges = cv2.Canny(s_eq, 50, 150)

    # Morphological transformations to refine the mask
    kernel = np.ones((3, 3), np.uint8)
    refined_mask = cv2.morphologyEx(edges, cv2.MORPH_CLOSE, kernel)

    # Calculate disease percentage (example: percentage of non-zero pixels)
    disease_percentage = (np.count_nonzero(refined_mask) / refined_mask.size) * 100

    # Generate a processed image path
    processed_filename = f"processed_{os.path.basename(filepath)}"
    processed_filepath = os.path.join(settings.MEDIA_ROOT, "processed", processed_filename)

    # Ensure the processed directory exists
    os.makedirs(os.path.dirname(processed_filepath), exist_ok=True)

    # Save processed image
    cv2.imwrite(processed_filepath, refined_mask)

    return disease_percentage, f"processed/{processed_filename}"

def upload_image(request):
    """Handles image upload, processes it, and returns the results."""
    
    if request.method == "POST" and request.FILES.get("image"):
        file = request.FILES["image"]

        # Save the original image in the media directory
        file_name = default_storage.save(f"uploads/{file.name}", ContentFile(file.read()))
        file_path = os.path.join(settings.MEDIA_ROOT, file_name)

        # Save image reference in the database
        image_instance = PlantImage(original_image=file_name)
        image_instance.save()

        # Process the image
        disease_percentage, processed_file_path = process_image(file_path)

        # Update the database with processed image details
        image_instance.processed_image = processed_file_path
        image_instance.disease_percentage = disease_percentage
        image_instance.save()

        return render(request, "index.html", {
            "image": image_instance
        })

    return render(request, "index.html")
