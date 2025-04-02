"""
AI-powered Virtual Try-On module for Luxe Hair Collection using Nebius API
"""

import os
import json
import base64
import requests
from typing import Optional, Dict, Any, Tuple
from dotenv import load_dotenv

# Load environment variables
load_dotenv()

class VirtualTryOn:
    """Virtual Try-On system powered by Nebius AI API"""
    
    def __init__(self):
        """Initialize the virtual try-on system with Nebius API credentials"""
        self.api_key = os.getenv('NEBIUS_API_KEY')
        self.api_url = os.getenv('NEBIUS_API_URL', 'https://api.nebius.ai/v1')
        self.image_model = os.getenv('NEBIUS_IMAGE_MODEL', 'stability-ai/stable-diffusion-xl-refiner-1.0')
        
        if not self.api_key:
            raise ValueError("Missing Nebius API key in environment variables")
    
    def process_image(self, user_image_data: str, hair_style_id: str) -> Tuple[bool, str, Optional[str]]:
        """
        Process user image with selected hairstyle using Nebius AI
        
        Args:
            user_image_data: Base64 encoded user image
            hair_style_id: ID of the selected hairstyle/product
            
        Returns:
            Tuple of (success, message, processed_image_data)
        """
        try:
            # Prepare headers for Nebius API
            headers = {
                "Content-Type": "application/json",
                "Authorization": f"Bearer {self.api_key}"
            }
            
            # Get hairstyle reference image
            hairstyle_image = self._get_hairstyle_reference(hair_style_id)
            if not hairstyle_image:
                return False, "Could not find reference hairstyle image", None
            
            # Prepare data payload for image-to-image generation
            data = {
                "model": self.image_model,  # Use model from environment variable
                "prompt": f"Apply this hairstyle to the person, high quality, photorealistic, detailed hair strands, natural lighting",
                "negative_prompt": "unrealistic, cartoon, poorly rendered, bad anatomy, wrong proportions, distorted face",
                "num_inference_steps": 50,
                "init_image": user_image_data,
                "reference_image": hairstyle_image,
                "strength": 0.7,  # Balance between keeping original image and applying new hairstyle
            }
            
            # Make API request to Nebius
            response = requests.post(
                f"{self.api_url}/images/generations",
                headers=headers,
                json=data,
                timeout=60
            )
            
            response.raise_for_status()
            result = response.json()
            
            # Extract generated image data
            if "data" in result and len(result["data"]) > 0:
                generated_image = result["data"][0].get("b64_json", "")
                
                if not generated_image:
                    return False, "No image data in API response", None
                
                return True, "Successfully generated virtual try-on image", generated_image
            else:
                return False, "No data returned from API", None
            
        except requests.exceptions.RequestException as e:
            return False, f"API request error: {str(e)}", None
        except Exception as e:
            return False, f"Error processing image: {str(e)}", None
    
    def _get_hairstyle_reference(self, hairstyle_id: str) -> Optional[str]:
        """Get the base64 encoded reference image for a hairstyle"""
        # In a production app, this would fetch from database or product catalog
        # For now, use a hardcoded mapping of IDs to example images
        try:
            # Get product from database using hairstyle_id
            from app import Product
            product = Product.query.filter_by(id=int(hairstyle_id)).first()
            
            if product and product.image_url:
                # Download image from URL and convert to base64
                response = requests.get(product.image_url)
                response.raise_for_status()
                image_data = base64.b64encode(response.content).decode('utf-8')
                return image_data
                
            return None
        except Exception as e:
            print(f"Error getting hairstyle reference: {e}")
            return None
