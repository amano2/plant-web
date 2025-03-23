from django.shortcuts import render
from django.http import JsonResponse
from django.views.decorators.csrf import csrf_exempt
import cv2
import numpy as np
import os

from django.core.files.storage import default_storage
from django.core.files.base import ContentFile

UPLOAD_FOLDER = 'uploads'
os.makedirs(UPLOAD_FOLDER, exist_ok=True)

@csrf_exempt
def upload_file(request):
    if request.method == 'POST' and request.FILES.get('image'):
        file = request.FILES['image']
        filepath = os.path.join(UPLOAD_FOLDER, file.name)
        
        path = default_storage.save(filepath, ContentFile(file.read()))
        disease_percentage = process_image(default_storage.path(path))
        
        return JsonResponse({'disease_percentage': round(disease_percentage, 2)})
    
    return JsonResponse({'error': 'Invalid request'}, status=400)

def upload_page(request):
    return render(request, 'index.html')

def process_image(filepath):
    image = cv2.imread(filepath, 1)
    if image is None:
        return 0

    b, g, r = cv2.split(image)
    disease = r - g  # Difference between red and green channels

    # Alpha channel calculation (background removal)
    alpha = np.zeros_like(b)
    for i in range(image.shape[0]):
        for j in range(image.shape[1]):
            if image[i, j, 0] > 200 and image[i, j, 1] > 200 and image[i, j, 2] > 200:
                alpha[i, j] = 255
            else:
                alpha[i, j] = 0

    processing_factor = 150  # Keep this dynamic if needed
    count = 0
    total = 0

    # Disease calculation similar to Tkinter
    for i in range(image.shape[0]):
        for j in range(image.shape[1]):
            if alpha[i, j] == 0:  # Only count non-background pixels
                total += 1
                if disease[i, j] < processing_factor:
                    count += 1

    if total == 0:
        return 0
    
    return round((count / total) * 100, 2)  # Match output formatting
