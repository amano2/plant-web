from django.db import models

class PlantImage(models.Model):
    original_image = models.ImageField(upload_to="uploads/")
    processed_image = models.ImageField(upload_to="processed/", blank=True, null=True)
    disease_percentage = models.FloatField(blank=True, null=True)

    def __str__(self):
        return f"Image {self.id} - Disease Percentage: {self.disease_percentage}%"
