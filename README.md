# 🌿 Plant Disease Detection Web App

A Django-based web application that detects plant diseases from uploaded leaf images using a pre-trained deep learning model.

## 🚀 Features

- Upload plant leaf images and detect diseases
- Shows disease-affected area percentage using image processing (OpenCV)
- Classifies disease type using a `.keras` model
- Displays disease name, cause, and cure (from JSON)
- Stores and displays original and processed images
- Downloadable reports (optional)

## 🧠 Tech Stack

- **Backend**: Django, TensorFlow, OpenCV, NumPy
- **Frontend**: HTML, CSS, Javascript
- **Model**: Pre-Trained Keras model "tf.keras.applications.MobileNetV2" (mid-weight cnn) for plant disease classification
