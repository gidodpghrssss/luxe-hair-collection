import os
from PIL import Image
import requests
from io import BytesIO

# Create static directory if it doesn't exist
STATIC_DIR = 'static'
if not os.path.exists(STATIC_DIR):
    os.makedirs(STATIC_DIR)

# Create images directory
IMAGES_DIR = os.path.join(STATIC_DIR, 'images')
if not os.path.exists(IMAGES_DIR):
    os.makedirs(IMAGES_DIR)

# Create placeholder images
image_sizes = {
    'category-wigs.jpg': (800, 600),
    'virtual-try-on.jpg': (1200, 800)
}

for filename, size in image_sizes.items():
    # Create a new image with a gradient background
    img = Image.new('RGB', size)
    pixels = img.load()
    
    # Fill with gradient
    for i in range(size[0]):
        for j in range(size[1]):
            pixels[i, j] = (i % 256, j % 256, (i + j) % 256)
    
    # Save the image
    img.save(os.path.join(IMAGES_DIR, filename))

print("Static images created successfully!")
