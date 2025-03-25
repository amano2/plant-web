import os
import cv2
import numpy as np
from django.shortcuts import render
from django.core.files.storage import default_storage
from django.core.files.base import ContentFile
from .models import PlantImage

def process_image(filepath):
    """ Processes the uploaded plant image to detect diseased areas. """
    
    # Read the image
    image = cv2.imread(filepath)
    if image is None:
        return 0.0, None  # Return 0% if the image is invalid

    # Convert to separate RGB channels
    b, g, r = cv2.split(image)

    # Compute Disease Mask with Contrast Enhancement
    disease = cv2.subtract(r.astype(np.int16), g.astype(np.int16))
    disease = np.clip(disease * 5, 0, 255).astype(np.uint8)  # Amplify contrast

    # Debugging output
    print("Disease Mask Min:", np.min(disease), "Max:", np.max(disease))

    # Apply Otsu's threshold to auto-detect diseased areas
    _, disease_binary = cv2.threshold(disease, 0, 255, cv2.THRESH_BINARY + cv2.THRESH_OTSU)

    # Compute Alpha Mask (Detect Background)
    alpha = np.zeros_like(b, dtype=np.uint8)

    # Reset Alpha to detect new image background correctly
    for i in range(image.shape[0]):
        for j in range(image.shape[1]):
            if image[i, j, 0] > 200 and image[i, j, 1] > 200 and image[i, j, 2] > 200:
                alpha[i, j] = 255  # Mark as background
            else:
                alpha[i, j] = 0  # Mark as plant area

    # Debug: Check alpha mask values
    print("Alpha Min:", np.min(alpha), "Max:", np.max(alpha))

    # Calculate Disease Percentage
    count_diseased = np.count_nonzero((disease_binary == 255) & (alpha == 0))
    total_valid_pixels = np.count_nonzero(alpha == 0)

    # Prevent division by zero
    if total_valid_pixels == 0:
        return 0.0, None  

    disease_percentage = (count_diseased / total_valid_pixels) * 100

    # Save the processed disease image
    processed_filepath = filepath.replace(".jpg", "_disease.jpg")
    cv2.imwrite(processed_filepath, disease_binary)

    return round(disease_percentage, 2), processed_filepath

def upload_image(request):
    """ Handles image upload, processes it, and returns the results. """
    
    if request.method == "POST" and request.FILES.get("image"):
        file = request.FILES["image"]

        # Save image to the database
        image_instance = PlantImage(original_image=file)
        image_instance.save()

        # Get the image path
        original_image_path = image_instance.original_image.path

        # Process the image
        disease_percentage, processed_filepath = process_image(original_image_path)

        # Save the processed image path and disease percentage
        image_instance.processed_image = processed_filepath
        image_instance.disease_percentage = disease_percentage
        image_instance.save()

        return render(request, "index.html", {
            "image": image_instance
        })

    return render(request, "index.html")
