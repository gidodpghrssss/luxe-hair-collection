"""
Customer-facing chatbot for Luxe Hair Collection
Handles customer inquiries and support requests
"""

import os
import json
from typing import Dict, List, Any
from dotenv import load_dotenv

# Load environment variables
load_dotenv()

# Import OpenAI for Nebius compatibility
from openai import OpenAI

# Initialize client
nebius_client = OpenAI(
    api_key=os.getenv('NEBIUS_API_KEY'),
    base_url='https://api.nebius.ai/v1'
)

class CustomerChatbot:
    """Customer-facing chatbot for Luxe Hair Collection"""
    
    def __init__(self):
        """Initialize the chatbot with Nebius integration"""
        self.nebius_api_key = os.getenv('NEBIUS_API_KEY')
        
        if not self.nebius_api_key:
            raise ValueError("NEBIUS_API_KEY not found in environment variables")

    def get_response(self, user_message: str, chat_history: List[Dict[str, str]]) -> str:
        """
        Get AI response to user message with chat history context
        
        Args:
            user_message: The user's message
            chat_history: List of previous messages in chat history
            
        Returns:
            AI response to the user's message
        """
        try:
            # Format chat history
            messages = [
                {"role": "system", "content": "You are a helpful customer support assistant for Luxe Hair Collection"}
            ]
            
            # Add chat history
            for message in chat_history:
                messages.append({
                    "role": "user" if message["role"] == "user" else "assistant",
                    "content": message["content"]
                })
            
            # Add current user message
            messages.append({"role": "user", "content": user_message})
            
            # Get response from Nebius
            response = nebius_client.chat.completions.create(
                model="llama-3-8b-instruct",
                messages=messages
            )
            
            return response.choices[0].message.content
            
        except Exception as e:
            print(f"Error in chatbot response: {str(e)}")
            return "I'm sorry, I encountered an error while processing your message. Please try again later."

    def get_product_recommendations(self, user_query: str, products: List[Dict[str, Any]]) -> str:
        """
        Get product recommendations based on user query
        
        Args:
            user_query: The user's query about products
            products: List of available products
            
        Returns:
            AI-generated product recommendations
        """
        try:
            # Format product information
            product_info = json.dumps(products, indent=2)
            
            # Create query with context
            query = f"""
            Based on the user's query and available products, provide personalized recommendations:
            
            USER QUERY:
            {user_query}
            
            AVAILABLE PRODUCTS:
            {product_info}
            
            Please provide 2-3 relevant product recommendations with reasons why they would be suitable.
            """
            
            # Get response
            response = nebius_client.chat.completions.create(
                model="llama-3-8b-instruct",
                messages=[
                    {"role": "system", "content": "You are a helpful product recommendation assistant for Luxe Hair Collection"},
                    {"role": "user", "content": query}
                ]
            )
            
            return response.choices[0].message.content
            
        except Exception as e:
            print(f"Error in product recommendations: {str(e)}")
            return "I'm sorry, I encountered an error while generating recommendations. Please try again later."

    def handle_order_inquiry(self, order_id: str, order_data: Dict[str, Any]) -> str:
        """
        Handle order status inquiries
        
        Args:
            order_id: The order ID being inquired about
            order_data: Dictionary containing order details
            
        Returns:
            AI-formatted order status response
        """
        try:
            # Format order information
            order_info = json.dumps(order_data, indent=2)
            
            # Create query with context
            query = f"""
            Provide a helpful response about order status:
            
            ORDER ID: {order_id}
            ORDER DETAILS:
            {order_info}
            
            Include:
            1. Current status
            2. Expected delivery timeline
            3. Next steps for the customer
            """
            
            # Get response
            response = nebius_client.chat.completions.create(
                model="llama-3-8b-instruct",
                messages=[
                    {"role": "system", "content": "You are a helpful order status assistant for Luxe Hair Collection"},
                    {"role": "user", "content": query}
                ]
            )
            
            return response.choices[0].message.content
            
        except Exception as e:
            print(f"Error in order inquiry: {str(e)}")
            return "I'm sorry, I encountered an error while checking your order status. Please try again later."

    def _get_product_knowledge(self) -> str:
        """Get knowledge about products"""
        return """
        # Luxe Hair Collection Product Information

        ## Hair Types and Origins
        - Brazilian Hair: Known for being naturally dark, thick, and wavy or curly. Very durable and versatile.
        - Peruvian Hair: Typically has medium thickness, natural luster, and holds styles well. Slightly coarser than Brazilian.
        - Malaysian Hair: Features natural shine, silky texture, and moderate density. Holds curls well and is resistant to frizz.
        - Indian Hair: Known for being naturally silky, lustrous, and relatively thin. Available in various textures.
        - European Hair: Fine texture, soft feel, and typically straight to wavy. Limited availability makes it premium-priced.

        ## Product Categories and Pricing
        1. Wigs:
           - Full Lace Wigs: $300-800 depending on length and hair type
           - Lace Front Wigs: $180-500 depending on length and hair type
           - 360 Lace Wigs: $220-600 depending on length and hair type
           - U-Part Wigs: $150-400 depending on length and hair type

        2. Extensions:
           - Clip-In Extensions: $100-300 for full set depending on length and hair type
           - Tape-In Extensions: $120-350 for full set depending on length and hair type
           - Sew-In Wefts: $80-250 per bundle depending on length and hair type
           - Micro-Link/Bead Extensions: $150-400 for full set depending on length and hair type

        3. Closures and Frontals:
           - 4x4 Lace Closures: $60-150 depending on length and hair type
           - 5x5 HD Lace Closures: $80-180 depending on length and hair type
           - 13x4 Lace Frontals: $100-250 depending on length and hair type
           - 13x6 HD Lace Frontals: $120-280 depending on length and hair type

        ## Hair Textures
        - Straight: Sleek, smooth texture
        - Body Wave: Loose, natural-looking waves
        - Deep Wave: Defined, consistent S-pattern waves
        - Curly: Natural-looking curls, varies from loose to tight
        - Kinky Curly: Tight, coiled curls
        - Water Wave: Glossy, defined waves resembling wet hair
        - Loose Wave: Relaxed, beachy waves

        ## Length Options
        - 8 inches: Above shoulder length
        - 10-12 inches: Shoulder length
        - 14-16 inches: Mid-back length
        - 18-20 inches: Lower back length
        - 22-24 inches: Waist length
        - 26-30 inches: Hip length
        - 32-40 inches: Extra long/thigh length

        ## Color Options
        - Natural black (#1B)
        - Jet black (#1)
        - Dark brown (#2)
        - Medium brown (#4)
        - Light brown (#6)
        - Honey blonde (#27)
        - Platinum blonde (#613)
        - Ombré and balayage options available
        - Custom coloring services available for an additional fee
        """

    def _get_faq_knowledge(self) -> str:
        """Get knowledge about frequently asked questions"""
        return """
        # Frequently Asked Questions

        ## Ordering and Shipping
        
        Q: How long does shipping take?
        A: Domestic shipping typically takes 3-5 business days. International shipping can take 7-14 business days.
        
        Q: Do you ship internationally?
        A: Yes, we ship to most countries worldwide. International shipping costs and delivery times vary by location.
        
        Q: What payment methods do you accept?
        A: We accept all major credit cards, PayPal, and Apple Pay.
        
        Q: Can I track my order?
        A: Yes, you'll receive a tracking number via email once your order ships.
        
        Q: Do you offer rush shipping?
        A: Yes, expedited shipping options are available at checkout for an additional fee.

        ## Product Information
        
        Q: Is your hair 100% human hair?
        A: Yes, all our products are made with 100% human hair with cuticles intact and aligned.
        
        Q: What is the difference between Regular Lace and HD Lace?
        A: HD Lace is thinner, more transparent, and virtually invisible against the skin, creating a more natural-looking hairline. Regular lace is slightly thicker and may require more customization.
        
        Q: How long does the hair last?
        A: With proper care, our hair can last 6-12 months with regular wear, and up to 2 years with minimal heat styling and proper maintenance.
        
        Q: Can I color the hair?
        A: Yes, our hair can be colored. We recommend using a professional stylist for best results. Lighter colors may require multiple processing sessions.
        
        Q: What density should I choose?
        A: 130% density provides a natural look, 150-180% offers fuller volume, and 200%+ provides the most dramatic volume. For first-time wig wearers, we recommend 150% density.

        ## Returns and Exchanges
        
        Q: What is your return policy?
        A: Unworn hair in original packaging can be returned within 30 days. Custom-colored items are final sale.
        
        Q: Can I exchange my purchase?
        A: Yes, exchanges for different lengths, textures, or colors are available within 30 days if the product is in its original condition.
        
        Q: Do I need to pay for return shipping?
        A: Yes, customers are responsible for return shipping costs unless the return is due to a defect or error on our part.
        
        Q: What if I receive damaged hair?
        A: Please contact customer service with photos within 48 hours of receiving your order, and we'll provide a replacement.
        
        Q: Can I cancel my order?
        A: Orders can be canceled within 24 hours of placement. Once processing begins, cancellations are not guaranteed.

        ## Hair Care and Maintenance
        
        Q: How often should I wash the hair?
        A: We recommend washing every 7-10 days or after 6-8 wears, depending on product type and usage.
        
        Q: What products should I use on the hair?
        A: Use sulfate-free, alcohol-free products specifically formulated for human hair extensions or wigs.
        
        Q: Can I use heat styling tools?
        A: Yes, but always use heat protectant and keep styling tools below 365°F (185°C) to maintain hair quality.
        
        Q: How should I store my wig when not in use?
        A: Store on a wig stand or mannequin head in a cool, dry place away from direct sunlight.
        
        Q: How can I prevent tangling?
        A: Brush gently from ends to roots daily, avoid sleeping with wet hair, use silk pillowcases, and apply leave-in conditioner regularly.
        """

    def _get_care_instructions(self) -> str:
        """Get knowledge about hair care instructions"""
        return """
        # Hair Care Instructions

        ## Daily Maintenance

        ### Wigs
        1. Gently detangle your wig daily using a wide-tooth comb or wig brush, starting from the ends and working your way up.
        2. Apply a small amount of leave-in conditioner or lightweight hair oil to the ends if the hair feels dry.
        3. If wearing daily, secure your wig properly with wig clips, combs, or adhesive to prevent shifting.
        4. Remove your wig before sleeping and store it properly on a wig stand.
        5. For lace front or full lace wigs, clean any adhesive residue from the lace with alcohol-free cleanser.

        ### Extensions
        1. Brush extensions 2-3 times daily with a loop brush or extension-specific brush to prevent tangling.
        2. Tie hair in a loose braid or ponytail before sleeping to prevent tangling.
        3. Use a silk or satin pillowcase to reduce friction and breakage.
        4. Apply leave-in conditioner to ends as needed to maintain moisture.
        5. Keep heat styling to a minimum to extend the life of the extensions.

        ## Washing Instructions

        ### Wigs
        1. Frequency: Wash every 7-10 wears or when product buildup becomes visible.
        2. Pre-wash: Gently detangle with a wide-tooth comb before washing.
        3. Washing: Use lukewarm water and sulfate-free shampoo. Apply shampoo in a downward motion, never rubbing or scrubbing.
        4. Conditioning: Apply conditioner from mid-lengths to ends, avoiding the roots/knots. Leave on for 5-10 minutes.
        5. Rinse thoroughly with cool water to seal the cuticle.
        6. Blot excess water with a microfiber towel. Never wring or twist.
        7. Air dry on a wig stand away from direct heat or sunlight.

        ### Extensions
        1. Frequency: Wash clip-ins every 15-20 wears; wash tape-ins, sew-ins, and other semi-permanent extensions every 7-10 days.
        2. Pre-wash: Gently detangle with a loop brush or wide-tooth comb.
        3. Washing: Hold extensions at the attachment area and wash in a downward motion with sulfate-free shampoo.
        4. Conditioning: Apply conditioner from mid-lengths to ends, avoiding bonds or tape tabs. Leave on for 5-10 minutes.
        5. Rinse thoroughly with cool water.
        6. For clip-ins: Lay flat on a clean towel to air dry.
        7. For attached extensions: Apply leave-in conditioner and air dry or blow dry on cool setting.

        ## Deep Conditioning

        1. Frequency: Deep condition every 2-3 weeks to maintain moisture and prevent dryness.
        2. Application: Apply deep conditioner from mid-lengths to ends, avoiding roots/bonds.
        3. Process: Cover with a plastic cap and leave for 20-30 minutes. For enhanced results, apply gentle heat with a bonnet dryer.
        4. Rinse thoroughly with cool water.

        ## Heat Styling

        1. Always apply heat protectant before using any hot tools.
        2. Keep heat settings below 365°F (185°C).
        3. Use heat styling sparingly to extend the life of the hair.
        4. Allow hair to fully dry before using flat irons or curling wands.
        5. Avoid repeatedly styling the same sections to prevent heat damage.

        ## Coloring and Chemical Processing

        1. We recommend professional coloring for best results.
        2. Avoid bleaching hair that has been previously colored.
        3. Perform a strand test before full application.
        4. Use color-safe products after processing.
        5. Deep condition after any chemical service.
        6. Note that chemical processing will void any product warranty.

        ## Storage

        1. Store wigs on a wig stand or mannequin head.
        2. Store clip-in extensions in their original packaging or a storage case.
        3. Keep all hair products in a cool, dry place away from direct sunlight.
        4. For long-term storage, place in a breathable dust bag after ensuring the hair is completely dry.
        """

    def chat(self, user_message: str, session_id: str = None) -> tuple[str, Dict[str, Any]]:
        """
        Process a user message and generate a response
        
        Args:
            user_message: The user's message
            session_id: Optional session identifier for tracking conversation
            
        Returns:
            Tuple of (response_text, metadata)
        """
        try:
            # Create context string from chat history
            context = []
            context_str = ""
            if session_id:
                # Load chat history from database or cache
                # For simplicity, assume we have a function to load chat history
                context = self._load_chat_history(session_id)
                for msg in context:
                    context_str += f"{msg['role']}: {msg['content']}\n"
            
            # Format the prompt
            prompt = f"{context_str}\nUser: {user_message}\nAssistant:" if context_str else f"User: {user_message}\nAssistant:"
            
            # Get response from Nebius
            response = nebius_client.chat.completions.create(
                model="llama-3-8b-instruct",
                messages=[
                    {"role": "system", "content": "You are a helpful customer support assistant for Luxe Hair Collection"},
                    {"role": "user", "content": prompt}
                ]
            )
            
            response_text = response.choices[0].message.content
            
            # Generate metadata about the conversation
            metadata = {
                "timestamp": datetime.now().isoformat(),
                "session_id": session_id,
                "sources": [],
                "sentiment": self._analyze_sentiment(user_message),
                "detected_intent": self._detect_intent(user_message)
            }
            
            return response_text, metadata
            
        except Exception as e:
            print(f"Error in chatbot: {e}")
            return "I'm sorry, I'm having trouble processing your request right now. Please try again or contact our customer service team for assistance.", {
                "error": str(e),
                "timestamp": datetime.now().isoformat(),
                "session_id": session_id
            }

    def _analyze_sentiment(self, message: str) -> str:
        """Simple sentiment analysis of user message"""
        positive_words = ["love", "great", "good", "amazing", "wonderful", "beautiful", "excellent", "happy", "best", "perfect"]
        negative_words = ["bad", "terrible", "hate", "awful", "disappointed", "poor", "issue", "problem", "wrong", "unhappy"]
        
        message_lower = message.lower()
        
        positive_count = sum(1 for word in positive_words if word in message_lower)
        negative_count = sum(1 for word in negative_words if word in message_lower)
        
        if positive_count > negative_count:
            return "positive"
        elif negative_count > positive_count:
            return "negative"
        else:
            return "neutral"

    def _detect_intent(self, message: str) -> str:
        """Simple intent detection from user message"""
        message_lower = message.lower()
        
        # Define intent keywords
        intents = {
            "product_inquiry": ["product", "hair", "wig", "extension", "price", "cost", "color", "texture", "length"],
            "order_status": ["order", "tracking", "shipped", "delivery", "package", "receive", "status"],
            "return_exchange": ["return", "exchange", "refund", "damaged", "wrong", "replace", "money back"],
            "hair_care": ["wash", "condition", "style", "maintain", "care", "brush", "tangle", "dry", "heat"],
            "complaint": ["complaint", "issue", "problem", "unhappy", "disappointed", "manager", "resolved"],
            "greeting": ["hello", "hi", "hey", "greetings", "good morning", "good afternoon", "good evening"]
        }
        
        # Count intent matches
        intent_scores = {intent: 0 for intent in intents}
        for intent, keywords in intents.items():
            intent_scores[intent] = sum(1 for keyword in keywords if keyword in message_lower)
        
        # Return the highest scoring intent
        max_score = max(intent_scores.values())
        if max_score > 0:
            for intent, score in intent_scores.items():
                if score == max_score:
                    return intent
        
        return "general_inquiry"  # Default intent

    def get_product_recommendation(self, user_preferences: Dict[str, Any]) -> Dict[str, Any]:
        """
        Get personalized product recommendations based on user preferences
        
        Args:
            user_preferences: Dictionary of user preferences (hair type, texture, length, etc.)
            
        Returns:
            Dictionary with recommended products and explanation
        """
        try:
            # Format the user preferences as context
            preferences_str = "\n".join([f"- {k}: {v}" for k, v in user_preferences.items()])
            
            # Create recommendation query
            recommendation_query = f"""
            Based on the following customer preferences, recommend the best Luxe Hair Collection products:
            
            {preferences_str}
            
            Provide 2-3 specific product recommendations with explanations for why they would be a good fit.
            For each product, include the product type, texture, length, and why it matches their preferences.
            """
            
            # Get response from Nebius
            response = nebius_client.chat.completions.create(
                model="llama-3-8b-instruct",
                messages=[
                    {"role": "system", "content": "You are a helpful product recommendation assistant for Luxe Hair Collection"},
                    {"role": "user", "content": recommendation_query}
                ]
            )
            
            return {
                "recommendations": response.choices[0].message.content,
                "based_on_preferences": user_preferences,
                "timestamp": datetime.now().isoformat()
            }
            
        except Exception as e:
            print(f"Error getting product recommendations: {e}")
            return {
                "error": str(e),
                "message": "Unable to generate recommendations at this time"
            }

# Example usage
if __name__ == "__main__":
    chatbot = CustomerChatbot()
    
    # Example conversation
    context = []
    while True:
        user_input = input("You: ")
        if user_input.lower() in ["quit", "exit"]:
            break
            
        response = chatbot.get_response(user_input, context)
        print(f"Chatbot: {response}")
        
        # Update context
        context.append({"role": "user", "content": user_input})
        context.append({"role": "assistant", "content": response})
        
        # Keep only last 5 messages
        context = context[-10:]
