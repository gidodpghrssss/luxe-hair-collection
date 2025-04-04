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
        except:
            # Fallback to default font
            font = ImageFont.load_default()
            
        # Calculate text position
        w, h = draw.textsize(text, font=font)
        x = (size[0] - w) // 2
        y = (size[1] - h) // 2
        
        # Draw text
        draw.text((x, y), text, fill=(255, 255, 255), font=font)
    
    # Save image
    os.makedirs(os.path.dirname(path), exist_ok=True)
    img.save(path)

def main():
    # Create placeholder images
    create_placeholder_image('static/images/category-extensions.jpg', text='Extensions')
    create_placeholder_image('static/images/category-accessories.jpg', text='Accessories')
    
    print("Placeholder images created successfully!")

if __name__ == '__main__':
    main()
