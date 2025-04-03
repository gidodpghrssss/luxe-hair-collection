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
from llama_index import VectorStoreIndex, SimpleDirectoryReader, ServiceContext, StorageContext, load_index_from_storage
from llama_index.llms.nebius import NebiusLLM
from llama_index.embeddings.nebius import NebiusEmbedding
from llama_index.node_parser import SimpleNodeParser

# Load environment variables
load_dotenv()

class AdminAgent:
    """LlamaIndex-based admin agent for managing the Luxe Hair business"""
    
    def __init__(self):
        """Initialize the admin agent with LlamaIndex and Nebius integration"""
        self.nebius_api_key = os.getenv('NEBIUS_API_KEY')
        
        if not self.nebius_api_key:
            raise ValueError("NEBIUS_API_KEY not found in environment variables")

        # Initialize Nebius LLM
        self.llm = NebiusLLM(
            api_key=self.nebius_api_key,
            model="meta-llama/Meta-Llama-3.1-70B-Instruct-fast"
        )
        
        # Initialize Nebius Embedding
        self.embedding_model = NebiusEmbedding(
            api_key=self.nebius_api_key
        )
        
        # Create service context
        self.service_context = ServiceContext.from_defaults(
            llm=self.llm,
            embed_model=self.embedding_model
        )
        
        # Initialize node parser
        self.node_parser = SimpleNodeParser.from_defaults(
            service_context=self.service_context
        )
        
        # Load or create index
        self.storage_context = StorageContext.from_defaults()
        try:
            self.index = load_index_from_storage(self.storage_context)
        except Exception:
            self.index = VectorStoreIndex([], service_context=self.service_context)
    
    def _setup_knowledge_base(self):
        """Set up the agent's knowledge base using LlamaIndex"""
        # In production (like Render), we won't be able to persist storage between deploys
        # So we'll create the knowledge base each time
        is_production = os.getenv('FLASK_ENV') == 'production'
        storage_dir = os.path.join(os.getcwd(), "storage")
        
        if not is_production and os.path.exists(storage_dir):
            try:
                # Load existing index in development
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
        
        # Save index in development environment only
        if os.getenv('FLASK_ENV') != 'production':
            os.makedirs(storage_dir, exist_ok=True)
            self.index.storage_context.persist(persist_dir=storage_dir)
            print("Created and saved new knowledge base")
        else:
            print("Created in-memory knowledge base (not persisted in production)")
    
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
            Analyzing our current inventory:
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
            Analyzing our recent sales performance:
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

    # ---------- NEW WEBSITE MANAGEMENT FUNCTIONS ----------
    
    def manage_products(self, action: str, product_data: Optional[Dict[str, Any]] = None, product_id: Optional[int] = None) -> Dict[str, Any]:
        """
        Manage website products (create, update, delete, get)
        
        Args:
            action: The action to perform (create, update, delete, get, list)
            product_data: Dictionary with product details (for create/update)
            product_id: Product ID (for update/delete/get)
        
        Returns:
            Dictionary with operation result and product data
        """
        try:
            # Format the AI query based on the action
            if action == "create" and product_data:
                query = f"""
                Create a new product with these details:
                {json.dumps(product_data, indent=2)}
                
                Verify the product details are complete and valid.
                Suggest any additional fields or modifications that would improve this product listing.
                """
                insights = self.query(query, {"action": "create_product", "product_data": product_data})
                return {
                    "success": True,
                    "action": "create",
                    "product_data": product_data,
                    "insights": insights
                }
                
            elif action == "update" and product_data and product_id:
                query = f"""
                Update product #{product_id} with these new details:
                {json.dumps(product_data, indent=2)}
                
                Verify the changes are appropriate and suggest any additional updates.
                """
                insights = self.query(query, {"action": "update_product", "product_id": product_id, "product_data": product_data})
                return {
                    "success": True,
                    "action": "update",
                    "product_id": product_id,
                    "product_data": product_data,
                    "insights": insights
                }
                
            elif action == "delete" and product_id:
                query = f"""
                Analyzing impact of deleting product #{product_id}.
                
                What are potential implications of removing this product?
                Are there any alternative actions to consider?
                """
                insights = self.query(query, {"action": "delete_product", "product_id": product_id})
                return {
                    "success": True,
                    "action": "delete",
                    "product_id": product_id,
                    "insights": insights
                }
                
            elif action == "get" and product_id:
                query = f"""
                Analyzing product #{product_id}.
                
                What are the key selling points for this product?
                How could we improve its marketing or presentation?
                """
                insights = self.query(query, {"action": "get_product", "product_id": product_id})
                return {
                    "success": True,
                    "action": "get",
                    "product_id": product_id,
                    "insights": insights
                }
                
            elif action == "list":
                query = """
                Analyzing our product catalog.
                
                What product categories need expansion?
                Are there any gaps in our catalog?
                What seasonal products should we consider adding?
                """
                insights = self.query(query, {"action": "list_products"})
                return {
                    "success": True,
                    "action": "list",
                    "insights": insights
                }
                
            else:
                return {
                    "success": False,
                    "error": f"Invalid action '{action}' or missing required parameters"
                }
                
        except Exception as e:
            print(f"Error in product management: {e}")
            return {"success": False, "error": str(e)}
    
    def manage_orders(self, action: str, order_data: Optional[Dict[str, Any]] = None, order_id: Optional[int] = None) -> Dict[str, Any]:
        """
        Manage website orders (update status, get details, analyze)
        
        Args:
            action: The action to perform (update, get, list, analyze)
            order_data: Dictionary with order details (for update)
            order_id: Order ID (for update/get)
        
        Returns:
            Dictionary with operation result and order data
        """
        try:
            if action == "update" and order_data and order_id:
                query = f"""
                Update order #{order_id} with new status: {order_data.get('status', 'unknown')}
                
                Is this status change appropriate based on the order history?
                What follow-up actions should be taken after this status change?
                """
                insights = self.query(query, {"action": "update_order", "order_id": order_id, "order_data": order_data})
                return {
                    "success": True,
                    "action": "update",
                    "order_id": order_id,
                    "order_data": order_data,
                    "insights": insights
                }
                
            elif action == "get" and order_id:
                query = f"""
                Analyzing order #{order_id}.
                
                What insights can we gather from this order?
                Are there any potential upsell opportunities?
                """
                insights = self.query(query, {"action": "get_order", "order_id": order_id})
                return {
                    "success": True,
                    "action": "get",
                    "order_id": order_id,
                    "insights": insights
                }
                
            elif action == "list":
                query = """
                Analyzing our recent orders.
                
                What patterns do we see in customer purchasing behavior?
                Are there any shipping or fulfillment issues we should address?
                """
                insights = self.query(query, {"action": "list_orders"})
                return {
                    "success": True,
                    "action": "list",
                    "insights": insights
                }
            
            elif action == "analyze":
                query = """
                Conducting a deep analysis of our order history.
                
                What are our most profitable order combinations?
                Which geographic regions generate the most orders?
                What time periods see the highest order volume?
                """
                insights = self.query(query, {"action": "analyze_orders"})
                return {
                    "success": True,
                    "action": "analyze",
                    "insights": insights
                }
                
            else:
                return {
                    "success": False,
                    "error": f"Invalid action '{action}' or missing required parameters"
                }
                
        except Exception as e:
            print(f"Error in order management: {e}")
            return {"success": False, "error": str(e)}
    
    def manage_users(self, action: str, user_data: Optional[Dict[str, Any]] = None, user_id: Optional[int] = None) -> Dict[str, Any]:
        """
        Manage website users (create, update, delete, get)
        
        Args:
            action: The action to perform (create, update, delete, get, list)
            user_data: Dictionary with user details (for create/update)
            user_id: User ID (for update/delete/get)
        
        Returns:
            Dictionary with operation result and user data
        """
        try:
            if action == "create" and user_data:
                query = f"""
                Creating a new user with these details:
                {json.dumps({k: v for k, v in user_data.items() if k != 'password'}, indent=2)}
                
                Is this user profile complete?
                What user segment does this customer likely belong to?
                """
                insights = self.query(query, {"action": "create_user", "user_data": {k: v for k, v in user_data.items() if k != 'password'}})
                return {
                    "success": True,
                    "action": "create",
                    "user_data": {k: v for k, v in user_data.items() if k != 'password'},
                    "insights": insights
                }
                
            elif action == "update" and user_data and user_id:
                query = f"""
                Updating user #{user_id} with these new details:
                {json.dumps({k: v for k, v in user_data.items() if k != 'password'}, indent=2)}
                
                What implications do these changes have for our user segmentation?
                """
                insights = self.query(query, {"action": "update_user", "user_id": user_id, "user_data": {k: v for k, v in user_data.items() if k != 'password'}})
                return {
                    "success": True,
                    "action": "update",
                    "user_id": user_id,
                    "user_data": {k: v for k, v in user_data.items() if k != 'password'},
                    "insights": insights
                }
                
            elif action == "delete" and user_id:
                query = f"""
                Analyzing impact of deleting user #{user_id}.
                
                What considerations should we take into account before removing this user?
                Are there any regulatory or data protection issues to address?
                """
                insights = self.query(query, {"action": "delete_user", "user_id": user_id})
                return {
                    "success": True,
                    "action": "delete",
                    "user_id": user_id,
                    "insights": insights
                }
                
            elif action == "get" and user_id:
                query = f"""
                Analyzing user #{user_id}.
                
                What purchasing patterns does this user exhibit?
                What personalized recommendations would be appropriate?
                """
                insights = self.query(query, {"action": "get_user", "user_id": user_id})
                return {
                    "success": True,
                    "action": "get",
                    "user_id": user_id,
                    "insights": insights
                }
                
            elif action == "list":
                query = """
                Analyzing our user base.
                
                What are the key user segments in our database?
                How can we improve user engagement and retention?
                """
                insights = self.query(query, {"action": "list_users"})
                return {
                    "success": True,
                    "action": "list",
                    "insights": insights
                }
                
            else:
                return {
                    "success": False,
                    "error": f"Invalid action '{action}' or missing required parameters"
                }
                
        except Exception as e:
            print(f"Error in user management: {e}")
            return {"success": False, "error": str(e)}
    
    def manage_virtual_try_on(self, action: str, data: Optional[Dict[str, Any]] = None) -> Dict[str, Any]:
        """
        Manage the virtual try-on feature
        
        Args:
            action: The action to perform (analyze, statistics, help)
            data: Optional data for the analysis
        
        Returns:
            Dictionary with operation result and insights
        """
        try:
            if action == "analyze" and data:
                query = f"""
                Analyzing virtual try-on usage with the following data:
                {json.dumps(data, indent=2)}
                
                What patterns do we see in virtual try-on usage?
                How does virtual try-on impact purchase decisions?
                """
                insights = self.query(query, {"action": "analyze_try_on", "data": data})
                return {
                    "success": True,
                    "action": "analyze",
                    "data": data,
                    "insights": insights
                }
                
            elif action == "statistics":
                query = """
                Analyzing virtual try-on statistics.
                
                What are the key metrics we should track for virtual try-on?
                How can we improve conversion rates from try-on to purchase?
                """
                insights = self.query(query, {"action": "try_on_statistics"})
                return {
                    "success": True,
                    "action": "statistics",
                    "insights": insights
                }
                
            elif action == "help":
                query = """
                Provide guidance on optimizing our virtual try-on feature.
                
                How can we improve the user experience?
                What technical improvements would be most beneficial?
                How should we market this feature to customers?
                """
                insights = self.query(query, {"action": "try_on_help"})
                return {
                    "success": True,
                    "action": "help",
                    "insights": insights
                }
                
            else:
                return {
                    "success": False,
                    "error": f"Invalid action '{action}' or missing required parameters"
                }
                
        except Exception as e:
            print(f"Error in virtual try-on management: {e}")
            return {"success": False, "error": str(e)}
    
    def generate_marketing_campaign(self, campaign_type: str, target_audience: Optional[str] = None, products: Optional[List[Dict[str, Any]]] = None) -> Dict[str, Any]:
        """
        Generate marketing campaign suggestions
        
        Args:
            campaign_type: Type of campaign (email, social, seasonal, promotion)
            target_audience: Target audience description
            products: List of products to include in the campaign
        
        Returns:
            Dictionary with campaign suggestions
        """
        try:
            # Build the query based on the campaign type
            query = f"""
            Generate a {campaign_type} marketing campaign"""
            
            if target_audience:
                query += f" targeting {target_audience}"
                
            if products:
                query += f" featuring the following products:\n{json.dumps([p.get('name', f'Product #{p.get('id', 'unknown')}') for p in products], indent=2)}"
                
            query += """
            
            Include:
            1. Campaign theme and messaging
            2. Key selling points to emphasize
            3. Call-to-action recommendations
            4. Timing considerations
            5. Success metrics to track
            """
            
            campaign = self.query(query, {
                "campaign_type": campaign_type,
                "target_audience": target_audience,
                "products": products
            })
            
            return {
                "success": True,
                "campaign_type": campaign_type,
                "target_audience": target_audience,
                "campaign_suggestions": campaign
            }
            
        except Exception as e:
            print(f"Error generating marketing campaign: {e}")
            return {"success": False, "error": str(e)}
    
    def analyze_website_performance(self, metrics: Dict[str, Any]) -> Dict[str, Any]:
        """
        Analyze website performance metrics
        
        Args:
            metrics: Dictionary with website performance metrics
        
        Returns:
            Dictionary with analysis and recommendations
        """
        try:
            query = f"""
            Analyze the following website performance metrics:
            {json.dumps(metrics, indent=2)}
            
            What trends can be identified?
            Which pages are performing well/poorly?
            What specific improvements would you recommend?
            How do these metrics compare to industry standards?
            """
            
            analysis = self.query(query, {"metrics": metrics})
            
            return {
                "success": True,
                "analysis": analysis
            }
            
        except Exception as e:
            print(f"Error analyzing website performance: {e}")
            return {"success": False, "error": str(e)}
    
    def get_business_dashboard(self, data: Dict[str, Any]) -> Dict[str, Any]:
        """
        Generate a comprehensive business dashboard with insights
        
        Args:
            data: Dictionary with various business metrics
        
        Returns:
            Dictionary with dashboard insights
        """
        try:
            query = f"""
            Create a comprehensive business dashboard based on these metrics:
            {json.dumps(data, indent=2)}
            
            Provide:
            1. Executive summary of current business state
            2. Key areas of concern that need attention
            3. Growth opportunities to pursue
            4. Actionable recommendations for the next 30 days
            """
            
            dashboard = self.query(query, {"dashboard_data": data})
            
            return {
                "success": True,
                "dashboard": dashboard
            }
            
        except Exception as e:
            print(f"Error generating business dashboard: {e}")
            return {"success": False, "error": str(e)}
