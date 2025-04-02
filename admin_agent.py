"""
Admin AI Agent using LlamaIndex and Nebius API for Luxe Hair Collection
This agent assists with inventory management, offers, user data, and analytics
"""

import os
import json
from typing import Dict, List, Any, Optional
from datetime import datetime, timedelta
import pandas as pd
from dotenv import load_dotenv

# LlamaIndex imports
from llama_index.llms.nebius import NebiusLLM
from llama_index.core import SimpleDirectoryReader, VectorStoreIndex
from llama_index.core.schema import Document
from llama_index.core.node_parser import SimpleNodeParser
from llama_index.core import StorageContext, load_index_from_storage
from llama_index.core import ServiceContext

# Load environment variables
load_dotenv()

class AdminAgent:
    """LlamaIndex-based admin agent for managing the Luxe Hair business"""
    
    def __init__(self):
        """Initialize the admin agent with LlamaIndex and Nebius integration"""
        self.nebius_api_key = os.getenv('NEBIUS_API_KEY')
        self.nebius_chat_model = os.getenv('NEBIUS_CHAT_MODEL', 'llama-3-8b-instruct')
        
        if not self.nebius_api_key:
            raise ValueError("Missing Nebius API key in environment variables")
        
        # Initialize Nebius LLM
        self.llm = NebiusLLM(
            api_key=self.nebius_api_key,
            model=self.nebius_chat_model
        )
        
        # Set up service context
        self.service_context = ServiceContext.from_defaults(llm=self.llm)
        
        # Initialize knowledge base
        self._setup_knowledge_base()
    
    def _setup_knowledge_base(self):
        """Set up the agent's knowledge base using LlamaIndex"""
        # Check if we have a persisted index
        storage_dir = "./storage"
        if os.path.exists(storage_dir):
            try:
                # Load existing index
                storage_context = StorageContext.from_defaults(persist_dir=storage_dir)
                self.index = load_index_from_storage(storage_context, service_context=self.service_context)
                print("Loaded existing knowledge base")
            except Exception as e:
                print(f"Error loading existing index: {e}")
                self._create_new_knowledge_base(storage_dir)
        else:
            self._create_new_knowledge_base(storage_dir)
    
    def _create_new_knowledge_base(self, storage_dir: str):
        """Create a new knowledge base with business knowledge"""
        # Create business knowledge documents
        documents = [
            Document(text=self._get_hair_product_knowledge(), metadata={"source": "product_knowledge"}),
            Document(text=self._get_business_operations_knowledge(), metadata={"source": "operations"}),
            Document(text=self._get_customer_service_knowledge(), metadata={"source": "customer_service"})
        ]
        
        # Parse nodes
        parser = SimpleNodeParser.from_defaults()
        nodes = parser.get_nodes_from_documents(documents)
        
        # Create index
        self.index = VectorStoreIndex(nodes, service_context=self.service_context)
        
        # Save index
        os.makedirs(storage_dir, exist_ok=True)
        self.index.storage_context.persist(persist_dir=storage_dir)
        print("Created and saved new knowledge base")
    
    def _get_hair_product_knowledge(self) -> str:
        """Get knowledge about hair products"""
        return """
        # Hair Product Knowledge

        ## Hair Types
        - Brazilian Hair: Known for being naturally dark, thick, and wavy or curly. Very durable and versatile.
        - Peruvian Hair: Typically has medium thickness, natural luster, and holds styles well. Slightly coarser than Brazilian.
        - Malaysian Hair: Features natural shine, silky texture, and moderate density. Holds curls well and is resistant to frizz.
        - Indian Hair: Known for being naturally silky, lustrous, and relatively thin. Available in various textures.
        - European Hair: Fine texture, soft feel, and typically straight to wavy. Limited availability makes it premium-priced.
        - Synthetic Hair: Made from artificial fibers, less expensive but less durable and cannot be heat-styled like human hair.

        ## Product Categories
        - Wigs: Full head coverings available in various styles, densities, and attachment methods (lace front, full lace, etc.)
        - Extensions: Additional hair for length or volume, attached via clips, tape, fusion, or sew-in methods.
        - Closures: Hair pieces covering a small section (usually 4x4 or 5x5 inches) used to close off an install.
        - Frontals: Cover the entire hairline from ear to ear (13x4 or 13x6 inches), allowing for versatile styling.
        - 360 Frontals: Encircle the entire perimeter of the head for all-around styling freedom.
        - Clip-ins: Temporary extensions attached with pressure clips for easy installation and removal.

        ## Quality Indicators
        - Cuticle Direction: All cuticles should face the same direction to prevent tangling.
        - Shedding Test: Quality hair should have minimal shedding when gently pulled or brushed.
        - Chemical Processing: Virgin hair has had no chemical processing and is highest quality.
        - Weft Construction: Hand-tied wefts are thinner and more durable than machine-made.
        - Color Consistency: Natural hair should have consistent color throughout.
        - Tangle Resistance: Quality hair should not tangle excessively when properly maintained.

        ## Maintenance
        - Washing: Use sulfate-free shampoo every 7-10 days.
        - Conditioning: Deep condition extensions once a month.
        - Detangling: Use a wide-tooth comb, starting from the ends.
        - Heat Protection: Always apply heat protectant before styling.
        - Storage: Store wigs on stands and extensions in airtight containers.
        - Nighttime Care: Use silk or satin cap/pillowcase to reduce friction.
        """
    
    def _get_business_operations_knowledge(self) -> str:
        """Get knowledge about business operations"""
        return """
        # Business Operations Knowledge

        ## Inventory Management
        - Reorder Points: Set automatic reorder notifications when stock reaches 30% of original inventory.
        - Seasonal Planning: Increase stock of straight and wavy textures during summer, curly during winter.
        - Product Lifecycle: Track each product's lifecycle phase to inform marketing and pricing strategies.
        - Supplier Relations: Maintain relationships with at least three suppliers for each hair type.
        - Quality Control: Implement batch testing for all new inventory arrivals.
        - Storage Conditions: Store hair products in climate-controlled environments to maintain quality.

        ## Pricing Strategy
        - Price Tiers: Maintain good-better-best pricing tiers for each product category.
        - Competitive Analysis: Review competitor pricing quarterly.
        - Bundle Pricing: Offer discounts on complementary product bundles.
        - Length-Based Pricing: Increase prices proportionally with hair length.
        - Special Collections: Premium pricing for limited edition or specialty collections.
        - Loyalty Discounts: Implement tiered discounts for repeat customers.

        ## Marketing
        - Customer Segmentation: Target marketing based on purchase history and browsing behavior.
        - Content Calendar: Maintain consistent posting schedule for social media and email campaigns.
        - Influencer Collaboration: Partner with micro-influencers in the beauty niche.
        - User-Generated Content: Encourage and showcase customer photos/videos.
        - Email Automation: Set up automated flows for abandoned carts, post-purchase, and re-engagement.
        - Seasonal Promotions: Align major sales with popular shopping seasons.

        ## Customer Analytics
        - Retention Rate: Monitor the percentage of customers who make repeat purchases.
        - Average Order Value: Track and work to increase the average transaction amount.
        - Customer Lifetime Value: Calculate the total value of a customer relationship.
        - Acquisition Channels: Identify which channels bring the highest quality customers.
        - Purchase Frequency: Analyze time between purchases to optimize marketing timing.
        - Product Affinity: Identify which products are commonly purchased together.
        """
    
    def _get_customer_service_knowledge(self) -> str:
        """Get knowledge about customer service"""
        return """
        # Customer Service Knowledge

        ## Common Customer Questions
        - "What's the difference between closures and frontals?": Closures cover a small portion of the head (typically 4x4 or 5x5 inches) while frontals cover the entire hairline from ear to ear.
        - "How long do hair extensions last?": With proper care, premium human hair extensions can last 6-12 months with regular wear.
        - "Can I color the hair?": Yes, real human hair products can be colored. Professional coloring is recommended for best results.
        - "How do I determine the right hair density?": 130% density provides a natural look, 150-180% offers fuller volume, and 200%+ provides the most dramatic volume.
        - "What's the return policy?": Unworn hair in original packaging can be returned within 30 days. Custom-colored items are final sale.
        - "How do I measure for the right wig cap size?": Measure around the head from the hairline at the forehead, around the back, and back to the starting point.

        ## Order Issues
        - Shipping Delays: Provide tracking information and contact shipping partners for updates.
        - Color Discrepancies: Offer color correction services or exchanges for significant differences.
        - Damaged Products: Request photos and offer immediate replacements for verified damage.
        - Installation Problems: Connect customers with educational resources or recommend local stylists.
        - Missing Items: Verify order details and expedite shipment of missing products.
        - Customs Issues: Provide documentation to assist with international shipping challenges.

        ## Customer Satisfaction
        - Follow-up Schedule: Check in with customers 3 days after purchase, 2 days after delivery, and 2 weeks after installation.
        - Feedback Collection: Gather detailed product feedback through post-purchase surveys.
        - Loyalty Program: Reward repeat customers with points, exclusive offers, and early access to new products.
        - Education Focus: Provide detailed installation and maintenance guides with every purchase.
        - Personalized Recommendations: Use purchase history to suggest complementary or replacement products.
        - VIP Services: Offer virtual consultations for customers making large purchases.
        """
    
    def query(self, user_query: str, business_data: Optional[Dict[str, Any]] = None) -> str:
        """
        Process a business query using LlamaIndex and Nebius integration
        
        Args:
            user_query: The user's question or instruction
            business_data: Optional dictionary of business data for context
            
        Returns:
            AI response with analysis and recommendations
        """
        try:
            # Format business data as context if provided
            context = ""
            if business_data:
                context = f"\nBUSINESS DATA:\n{json.dumps(business_data, indent=2)}\n\n"
            
            # Create a query engine
            query_engine = self.index.as_query_engine(
                service_context=self.service_context,
                similarity_top_k=3
            )
            
            # Format the full query with business context
            full_query = f"""
            As an AI business assistant for Luxe Hair Collection, analyze the following query:
            
            {context}
            
            USER QUERY: {user_query}
            
            Provide detailed analysis and actionable recommendations based on the hair business context.
            """
            
            # Query the index
            response = query_engine.query(full_query)
            return str(response)
            
        except Exception as e:
            print(f"Error in admin agent query: {e}")
            return f"I encountered an error analyzing your query. Please try again or rephrase your question. Error: {str(e)}"
    
    def analyze_inventory(self, products: List[Dict[str, Any]]) -> Dict[str, Any]:
        """
        Analyze inventory data and provide recommendations
        
        Args:
            products: List of product dictionaries with inventory data
            
        Returns:
            Dictionary with inventory analysis and recommendations
        """
        try:
            # Convert to DataFrame for analysis
            df = pd.DataFrame(products)
            
            # Basic inventory analytics
            low_stock_threshold = 5
            low_stock_items = df[df['stock'] <= low_stock_threshold][['name', 'stock', 'category']].to_dict('records')
            
            # Get recommendations from the AI
            inventory_query = f"""
            Analyze our current inventory:
            - We have {len(products)} total products
            - {len(low_stock_items)} products are low in stock (5 or fewer units)
            
            What specific inventory actions should we take?
            Which products should we restock first?
            Are there any seasonal considerations for our inventory planning?
            """
            
            insights = self.query(inventory_query, {"products": products, "low_stock_items": low_stock_items})
            
            return {
                "low_stock_items": low_stock_items,
                "total_products": len(products),
                "total_stock_value": sum(p['price'] * p['stock'] for p in products),
                "insights": insights
            }
        except Exception as e:
            print(f"Error analyzing inventory: {e}")
            return {"error": str(e)}
    
    def analyze_sales(self, orders: List[Dict[str, Any]], products: List[Dict[str, Any]]) -> Dict[str, Any]:
        """
        Analyze sales data and provide recommendations
        
        Args:
            orders: List of order dictionaries
            products: List of product dictionaries
            
        Returns:
            Dictionary with sales analysis and recommendations
        """
        try:
            # Calculate recent orders (last 30 days)
            recent_orders = [o for o in orders if datetime.strptime(o['order_date'], "%Y-%m-%d %H:%M:%S") > 
                             (datetime.now() - timedelta(days=30))]
            
            # Calculate product popularity
            product_sales = {}
            for order in orders:
                for item in order['items']:
                    product_id = item['product_id']
                    if product_id in product_sales:
                        product_sales[product_id] += item['quantity']
                    else:
                        product_sales[product_id] = item['quantity']
            
            # Get top selling products
            top_products = sorted(
                [{"product_id": k, "quantity": v} for k, v in product_sales.items()],
                key=lambda x: x["quantity"],
                reverse=True
            )[:5]
            
            # Add product details to top products
            for tp in top_products:
                for p in products:
                    if p['id'] == tp['product_id']:
                        tp['name'] = p['name']
                        tp['category'] = p['category']
                        break
            
            # Get recommendations from the AI
            sales_query = f"""
            Analyze our recent sales performance:
            - Total orders in the last 30 days: {len(recent_orders)}
            - Total revenue in the last 30 days: ${sum(o['total_amount'] for o in recent_orders)}
            
            What sales trends can be identified?
            Which product categories are performing best?
            What pricing or promotional strategies should we consider?
            """
            
            insights = self.query(sales_query, {
                "recent_orders": recent_orders,
                "top_products": top_products
            })
            
            return {
                "total_sales": sum(o['total_amount'] for o in orders),
                "recent_sales": sum(o['total_amount'] for o in recent_orders),
                "top_products": top_products,
                "insights": insights
            }
        except Exception as e:
            print(f"Error analyzing sales: {e}")
            return {"error": str(e)}
