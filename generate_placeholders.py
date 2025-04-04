import os
from PIL import Image, ImageDraw, ImageFont

def create_placeholder_image(path, size=(800, 600), text=None):
    """Create a placeholder image with optional text"""
    # Create image
    img = Image.new('RGB', size, color=(128, 128, 128))
    draw = ImageDraw.Draw(img)
    
    # Add text if provided
    if text:
        try:
            # Try to use a system font
            font = ImageFont.truetype("arial.ttf", 40)
            # Get text size using getbbox
            bbox = draw.textbbox((0, 0), text, font=font)
            w = bbox[2] - bbox[0]
            h = bbox[3] - bbox[1]
        except:
            # Fallback to default font
            font = ImageFont.load_default()
            # Get text size using getbbox
            bbox = draw.textbbox((0, 0), text, font=font)
            w = bbox[2] - bbox[0]
            h = bbox[3] - bbox[1]
            
        # Calculate text position
        x = (size[0] - w) // 2
        y = (size[1] - h) // 2
        
        # Draw text
        draw.text((x, y), text, fill=(255, 255, 255), font=font)
    
    # Save image
    os.makedirs(os.path.dirname(path), exist_ok=True)
    img.save(path)

def main():
    # Create placeholder images for all missing static files
    create_placeholder_image('static/images/category-extensions.jpg', text='Extensions')
    create_placeholder_image('static/images/category-wigs.jpg', text='Wigs')
    create_placeholder_image('static/images/virtual-try-on.jpg', text='Virtual Try-On')
    create_placeholder_image('static/images/category-accessories.jpg', text='Accessories')
    create_placeholder_image('static/images/hero-bg.jpg', text='Hero Background')
    
    print("All placeholder images created successfully!")

if __name__ == '__main__':
    main()
