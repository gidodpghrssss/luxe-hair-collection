"""
AI-powered Virtual Try-On module for Luxe Hair Collection using Nebius API
"""

import os
import json
import base64
import requests
from typing import Optional, Dict, Any, Tuple, List
from dotenv import load_dotenv

# Load environment variables
load_dotenv()

class VirtualTryOn:
    """Virtual Try-On system powered by Nebius AI API with advanced multi-model workflow"""
    
    def __init__(self):
        """Initialize the virtual try-on system with Nebius API credentials and models"""
        self.api_key = os.getenv('NEBIUS_API_KEY')
        self.api_url = os.getenv('NEBIUS_API_URL', 'https://api.nebius.ai/v1')
        
        # AI models configuration
        self.llm_model = os.getenv('NEBIUS_CHAT_MODEL', 'meta-llama/Meta-Llama-3.1-70B-Instruct')
        self.vision_model = os.getenv('NEBIUS_VISION_MODEL', 'Qwen/Qwen2-VL-72B-Instruct')
        self.image_model = os.getenv('NEBIUS_IMAGE_MODEL', 'stability-ai/sdxl')
        self.verification_model = os.getenv('NEBIUS_VERIFICATION_MODEL', 'Qwen/Qwen2-VL-72B-Instruct')
        
        # Model configurations
        self.image_gen_steps = 30  # Default number of inference steps for SDXL
        
        if not self.api_key:
            raise ValueError("Missing Nebius API key in environment variables")
        
        # Validate API connection
        self._validate_api_connection()
    
    def _validate_api_connection(self):
        """Test connection to Nebius API"""
        try:
            headers = {
                "Content-Type": "application/json",
                "Authorization": f"Bearer {self.api_key}"
            }
            
            test_url = f"{self.api_url}/models"
            response = requests.get(test_url, headers=headers)
            
            if response.status_code != 200:
                print(f"Warning: Nebius API connection test failed with status {response.status_code}")
                print(f"Response: {response.text}")
            else:
                print("Nebius API connection validated successfully")
                
        except Exception as e:
            print(f"Warning: Failed to validate Nebius API connection: {e}")
    
    def analyze_image(self, image_data: str) -> Tuple[bool, str, Optional[Dict]]:
        """
        Analyze an image using the vision model to extract visual features
        
        Args:
            image_data: Base64 encoded image
            
        Returns:
            Tuple of (success, message, analysis_data)
        """
        try:
            headers = {
                "Content-Type": "application/json",
                "Authorization": f"Bearer {self.api_key}"
            }
            
            # Prepare prompt for vision model
            prompt = [
                {
                    "role": "system", 
                    "content": "You are a professional hair stylist assistant. Analyze the image and provide a detailed description of the person's current hairstyle, face shape, and other relevant features. Focus on hair-related details."
                },
                {
                    "role": "user",
                    "content": [
                        {"type": "text", "text": "Analyze this image and describe the person's current hairstyle, face shape, and relevant features in detail:"},
                        {"type": "image_url", "image_url": {"url": f"data:image/jpeg;base64,{image_data}"}}
                    ]
                }
            ]
            
            # Request to vision model
            response = requests.post(
                f"{self.api_url}/chat/completions",
                headers=headers,
                json={
                    "model": self.vision_model,
                    "messages": prompt,
                    "temperature": 0.2,
                    "max_tokens": 800
                },
                timeout=60
            )
            
            response.raise_for_status()
            result = response.json()
            
            if "choices" in result and len(result["choices"]) > 0:
                analysis = result["choices"][0]["message"]["content"]
                return True, "Successfully analyzed image", {"description": analysis}
            else:
                return False, "No analysis data returned from API", None
                
        except Exception as e:
            return False, f"Error analyzing image: {str(e)}", None
    
    def analyze_hairstyle(self, hairstyle_image_data: str) -> Tuple[bool, str, Optional[Dict]]:
        """
        Analyze a hairstyle image using the vision model
        
        Args:
            hairstyle_image_data: Base64 encoded hairstyle image
            
        Returns:
            Tuple of (success, message, analysis_data)
        """
        try:
            headers = {
                "Content-Type": "application/json",
                "Authorization": f"Bearer {self.api_key}"
            }
            
            # Prepare prompt for vision model
            prompt = [
                {
                    "role": "system", 
                    "content": "You are a professional hair stylist assistant. Describe this hairstyle in detail including color, length, texture, style, and any other distinctive features."
                },
                {
                    "role": "user",
                    "content": [
                        {"type": "text", "text": "Describe this hairstyle in detail:"},
                        {"type": "image_url", "image_url": {"url": f"data:image/jpeg;base64,{hairstyle_image_data}"}}
                    ]
                }
            ]
            
            # Request to vision model
            response = requests.post(
                f"{self.api_url}/chat/completions",
                headers=headers,
                json={
                    "model": self.vision_model,
                    "messages": prompt,
                    "temperature": 0.2,
                    "max_tokens": 800
                },
                timeout=60
            )
            
            response.raise_for_status()
            result = response.json()
            
            if "choices" in result and len(result["choices"]) > 0:
                analysis = result["choices"][0]["message"]["content"]
                return True, "Successfully analyzed hairstyle image", {"description": analysis}
            else:
                return False, "No analysis data returned from API", None
                
        except Exception as e:
            return False, f"Error analyzing hairstyle image: {str(e)}", None
    
    def create_merged_description(self, person_analysis: Dict, hairstyle_analysis: Dict) -> Tuple[bool, str, Optional[Dict]]:
        """
        Create a merged description for image generation using LLM
        
        Args:
            person_analysis: Analysis data for the person
            hairstyle_analysis: Analysis data for the hairstyle
            
        Returns:
            Tuple of (success, message, merged_data)
        """
        try:
            headers = {
                "Content-Type": "application/json",
                "Authorization": f"Bearer {self.api_key}"
            }
            
            # Prepare prompt for LLM
            prompt = [
                {
                    "role": "system", 
                    "content": "You are a professional AI image generation expert specializing in virtual hair try-on. Your task is to craft a detailed prompt that will be used to generate a realistic image of a person with a new hairstyle using SDXL."
                },
                {
                    "role": "user",
                    "content": f"""
I need to create a prompt for generating an image of a person with a new hairstyle.

PERSON DESCRIPTION:
{person_analysis['description']}

HAIRSTYLE DESCRIPTION:
{hairstyle_analysis['description']}

Based on these descriptions, create:
1. A detailed generation prompt for SDXL that will realistically show the person with the new hairstyle
2. A negative prompt to avoid common issues
3. A list of key features to preserve from the original image
                    """
                }
            ]
            
            # Request to LLM model
            response = requests.post(
                f"{self.api_url}/chat/completions",
                headers=headers,
                json={
                    "model": self.llm_model,
                    "messages": prompt,
                    "temperature": 0.4,
                    "max_tokens": 1200
                },
                timeout=60
            )
            
            response.raise_for_status()
            result = response.json()
            
            if "choices" in result and len(result["choices"]) > 0:
                merged_description = result["choices"][0]["message"]["content"]
                
                # Parse the merged description to extract prompts
                # This is a simple extraction - in production you'd want more robust parsing
                prompt_parts = merged_description.split("\n\n")
                prompt = ""
                negative_prompt = ""
                
                for part in prompt_parts:
                    if part.lower().startswith("prompt:") or part.lower().startswith("generation prompt:"):
                        prompt = part.split(":", 1)[1].strip()
                    elif part.lower().startswith("negative prompt:"):
                        negative_prompt = part.split(":", 1)[1].strip()
                
                if not prompt:
                    prompt = merged_description  # Fallback to using the whole text
                
                return True, "Successfully created merged description", {
                    "prompt": prompt,
                    "negative_prompt": negative_prompt if negative_prompt else "unrealistic, cartoon, poorly rendered, bad anatomy, wrong proportions, distorted face",
                    "full_description": merged_description
                }
            else:
                return False, "No merged description data returned from API", None
                
        except Exception as e:
            return False, f"Error creating merged description: {str(e)}", None
    
    def generate_image(self, user_image_data: str, merged_data: Dict) -> Tuple[bool, str, Optional[str]]:
        """
        Generate a new image using SDXL based on the merged description
        
        Args:
            user_image_data: Base64 encoded user image
            merged_data: Merged description data
            
        Returns:
            Tuple of (success, message, generated_image_data)
        """
        try:
            headers = {
                "Content-Type": "application/json",
                "Authorization": f"Bearer {self.api_key}"
            }
            
            # Prepare data payload for text-to-image generation
            data = {
                "model": self.image_model,
                "prompt": merged_data["prompt"],
                "negative_prompt": merged_data["negative_prompt"],
                "num_inference_steps": self.image_gen_steps,
                "init_image": user_image_data,
                "strength": 0.65,  # Balance between keeping original image and applying new hairstyle
            }
            
            # Make API request to Nebius for image generation
            response = requests.post(
                f"{self.api_url}/images/generations",
                headers=headers,
                json=data,
                timeout=120  # Longer timeout for image generation
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
            
        except Exception as e:
            return False, f"Error generating image: {str(e)}", None
    
    def verify_image(self, original_image_data: str, generated_image_data: str, merged_data: Dict) -> Tuple[bool, str, Optional[Dict]]:
        """
        Verify the generated image using the vision model
        
        Args:
            original_image_data: Base64 encoded original image
            generated_image_data: Base64 encoded generated image
            merged_data: Merged description data
            
        Returns:
            Tuple of (success, message, verification_data)
        """
        try:
            headers = {
                "Content-Type": "application/json",
                "Authorization": f"Bearer {self.api_key}"
            }
            
            # Prepare prompt for vision model
            prompt = [
                {
                    "role": "system", 
                    "content": "You are a quality assurance expert for AI-generated images. You need to compare an original image and a generated image to verify if the generated image successfully applied a new hairstyle while maintaining the person's identity and facial features."
                },
                {
                    "role": "user",
                    "content": [
                        {"type": "text", "text": "I'm trying to apply this hairstyle description to a person: " + merged_data["prompt"]},
                        {"type": "text", "text": "Here is the original image of the person:"},
                        {"type": "image_url", "image_url": {"url": f"data:image/jpeg;base64,{original_image_data}"}},
                        {"type": "text", "text": "And here is the AI-generated result:"},
                        {"type": "image_url", "image_url": {"url": f"data:image/jpeg;base64,{generated_image_data}"}},
                        {"type": "text", "text": "Please evaluate if the new hairstyle has been successfully applied while preserving the person's identity. Rate the result on a scale of 1-10 and provide a brief explanation of what works well and what could be improved."}
                    ]
                }
            ]
            
            # Request to vision model
            response = requests.post(
                f"{self.api_url}/chat/completions",
                headers=headers,
                json={
                    "model": self.verification_model,
                    "messages": prompt,
                    "temperature": 0.3,
                    "max_tokens": 1000
                },
                timeout=60
            )
            
            response.raise_for_status()
            result = response.json()
            
            if "choices" in result and len(result["choices"]) > 0:
                verification = result["choices"][0]["message"]["content"]
                
                # Extract rating if possible
                rating = 0
                import re
                rating_match = re.search(r'(\d+(\.\d+)?)/10', verification)
                if rating_match:
                    try:
                        rating = float(rating_match.group(1))
                    except:
                        pass
                
                return True, "Successfully verified generated image", {
                    "verification": verification,
                    "rating": rating,
                    "acceptable": rating >= 6.0  # Threshold for acceptability
                }
            else:
                return False, "No verification data returned from API", None
                
        except Exception as e:
            return False, f"Error verifying image: {str(e)}", None
    
    def process_image(self, user_image_data: str, hair_style_id: str) -> Tuple[bool, str, Optional[str]]:
        """
        Process user image with selected hairstyle using the full multi-model workflow
        
        Args:
            user_image_data: Base64 encoded user image
            hair_style_id: ID of the selected hairstyle/product
            
        Returns:
            Tuple of (success, message, processed_image_data)
        """
        try:
            # Step 1: Get hairstyle reference image
            hairstyle_image = self._get_hairstyle_reference(hair_style_id)
            if not hairstyle_image:
                return False, "Could not find reference hairstyle image", None
            
            # Step 2: Analyze user image
            success, message, person_analysis = self.analyze_image(user_image_data)
            if not success or not person_analysis:
                return False, f"Failed to analyze user image: {message}", None
            
            # Step 3: Analyze hairstyle image
            success, message, hairstyle_analysis = self.analyze_hairstyle(hairstyle_image)
            if not success or not hairstyle_analysis:
                return False, f"Failed to analyze hairstyle image: {message}", None
            
            # Step 4: Create merged description
            success, message, merged_data = self.create_merged_description(person_analysis, hairstyle_analysis)
            if not success or not merged_data:
                return False, f"Failed to create merged description: {message}", None
            
            # Step 5: Generate new image
            success, message, generated_image = self.generate_image(user_image_data, merged_data)
            if not success or not generated_image:
                return False, f"Failed to generate image: {message}", None
            
            # Step 6: Verify image quality (optional step)
            success, message, verification = self.verify_image(user_image_data, generated_image, merged_data)
            
            # If verification succeeded and the result is acceptable, return the generated image
            # If verification failed or the result is not acceptable, we still return the image but with a warning
            if success and verification and verification.get("acceptable", False):
                return True, "Successfully generated high-quality virtual try-on image", generated_image
            elif success and verification:
                return True, f"Generated virtual try-on image (Quality rating: {verification.get('rating', 'N/A')}/10)", generated_image
            else:
                # Still return the image even if verification failed
                return True, "Generated virtual try-on image (Verification unavailable)", generated_image
            
        except Exception as e:
            return False, f"Error in virtual try-on process: {str(e)}", None
    
    def _get_hairstyle_reference(self, hairstyle_id: str) -> Optional[str]:
        """Get the base64 encoded reference image for a hairstyle"""
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
