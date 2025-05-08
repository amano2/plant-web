from django.db import models

class PlantImage(models.Model):
    original_image = models.ImageField(upload_to="uploads/")
    processed_image = models.ImageField(upload_to="processed/", blank=True, null=True)
    disease_percentage = models.FloatField(blank=True, null=True)
    predicted_label = models.CharField(max_length=100, blank=True, null=True)  # NEW FIELD

    def __str__(self):
        return f"Image {self.id} - Disease: {self.predicted_label or 'Unknown'} - {self.disease_percentage}%"
