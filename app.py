import os
import json
import base64
from datetime import datetime, timedelta
from flask import Flask, render_template, redirect, url_for, flash, request, jsonify, session
from flask_sqlalchemy import SQLAlchemy
from flask_login import LoginManager, UserMixin, login_user, logout_user, login_required, current_user
from werkzeug.security import generate_password_hash, check_password_hash
from dotenv import load_dotenv
# Handle Shopify import with try/except
try:
    from ShopifyAPI import shopify
except ImportError:
    try:
        import shopify
    except ImportError:
        print("Warning: Shopify API could not be imported. Some features may not work.")
        shopify = None

# Import Nebius components
from openai import OpenAI

# Initialize client
nebius_client = OpenAI(
    api_key=os.getenv('NEBIUS_API_KEY'),
    base_url='https://api.nebius.ai/v1'
)

import pandas as pd
import numpy as np
import matplotlib.pyplot as plt
from io import BytesIO
import base64

# Import our custom modules
from virtual_try_on import VirtualTryOn
from admin_agent import AdminAgent
from chatbot import CustomerChatbot

# Load environment variables
load_dotenv()

app = Flask(__name__)
app.config['SECRET_KEY'] = os.getenv('SECRET_KEY', 'default_secret_key')

# Handle Render PostgreSQL connection
if 'DATABASE_URL' in os.environ:
    # Handle Render PostgreSQL connection string
    database_url = os.environ['DATABASE_URL']
    # Ensure it's properly formatted for psycopg2
    if database_url.startswith("postgres://"):
        database_url = database_url.replace("postgres://", "postgresql://", 1)
    app.config['SQLALCHEMY_DATABASE_URI'] = database_url
else:
    app.config['SQLALCHEMY_DATABASE_URI'] = os.getenv('DATABASE_URL', 'sqlite:///luxe_hair.db')

app.config['SQLALCHEMY_TRACK_MODIFICATIONS'] = False

# Initialize database
db = SQLAlchemy(app)

# Initialize login manager
login_manager = LoginManager()
login_manager.init_app(app)
login_manager.login_view = 'login'

# Shopify API setup
shopify_api_key = os.getenv('SHOPIFY_API_KEY')
shopify_api_secret = os.getenv('SHOPIFY_API_SECRET')
shopify_shop_url = os.getenv('SHOPIFY_SHOP_URL')

# Nebius API setup
nebius_api_key = os.getenv('NEBIUS_API_KEY')
nebius_api_url = os.getenv('NEBIUS_API_URL', 'https://api.nebius.ai/v1')
nebius_chat_model = os.getenv('NEBIUS_CHAT_MODEL', 'llama-3-8b-instruct')
nebius_embeddings_model = os.getenv('NEBIUS_EMBEDDINGS_MODEL', 'text-embedding-3-small')

# Initialize Llama Index with Nebius only if API key is available
llm = None
embedding_model = None
service_context = None

if nebius_api_key:
    try:
        llm = nebius_client
        embedding_model = nebius_client
        service_context = None  # Removed service context initialization
        
        print("Nebius API initialized successfully")
    except Exception as e:
        print(f"Error initializing Nebius API: {e}")
else:
    print("Warning: Nebius API key not provided. AI features will not be available.")

# Initialize VirtualTryOn, AdminAgent, and CustomerChatbot
virtual_try_on = None
admin_agent = None
chatbot = None

if nebius_api_key and service_context:
    try:
        print("Initializing AI components...")
        if os.getenv('ENABLE_VIRTUAL_TRY_ON', 'true').lower() == 'true':
            try:
                virtual_try_on = VirtualTryOn()
                print("✅ Virtual Try-On initialized successfully")
            except Exception as e:
                print(f"❌ Error initializing Virtual Try-On: {e}")
        
        if os.getenv('ENABLE_ADMIN_AGENT', 'true').lower() == 'true':
            try:
                admin_agent = AdminAgent()
                print("✅ Admin Agent initialized successfully")
            except Exception as e:
                print(f"❌ Error initializing Admin Agent: {e}")
        
        if os.getenv('ENABLE_CHATBOT', 'true').lower() == 'true':
            try:
                chatbot = CustomerChatbot()
                print("✅ Customer Chatbot initialized successfully")
            except Exception as e:
                print(f"❌ Error initializing Customer Chatbot: {e}")
        
    except Exception as e:
        print(f"Error during AI components initialization: {e}")
else:
    print("AI components initialization skipped: Nebius API key or service context not available")

# Database Models
class User(db.Model, UserMixin):
    id = db.Column(db.Integer, primary_key=True)
    email = db.Column(db.String(100), unique=True, nullable=False)
    password = db.Column(db.String(200), nullable=False)
    name = db.Column(db.String(100))
    is_admin = db.Column(db.Boolean, default=False)
    phone = db.Column(db.String(20))
    address = db.Column(db.String(200))
    created_at = db.Column(db.DateTime, default=datetime.utcnow)
    orders = db.relationship('Order', backref='customer', lazy=True)
    chats = db.relationship('ChatHistory', backref='user', lazy=True)

class Product(db.Model):
    id = db.Column(db.Integer, primary_key=True)
    shopify_id = db.Column(db.String(100), unique=True)
    name = db.Column(db.String(100), nullable=False)
    description = db.Column(db.Text)
    price = db.Column(db.Float, nullable=False)
    sale_price = db.Column(db.Float)
    image_url = db.Column(db.String(200))
    category = db.Column(db.String(50))
    tags = db.Column(db.String(200))
    stock = db.Column(db.Integer, default=0)
    created_at = db.Column(db.DateTime, default=datetime.utcnow)
    updated_at = db.Column(db.DateTime, default=datetime.utcnow, onupdate=datetime.utcnow)
    order_items = db.relationship('OrderItem', backref='product', lazy=True)

class Order(db.Model):
    id = db.Column(db.Integer, primary_key=True)
    user_id = db.Column(db.Integer, db.ForeignKey('user.id'), nullable=False)
    order_date = db.Column(db.DateTime, default=datetime.utcnow)
    status = db.Column(db.String(20), default='pending')
    total_amount = db.Column(db.Float, nullable=False)
    shipping_address = db.Column(db.String(200))
    tracking_number = db.Column(db.String(100))
    shopify_order_id = db.Column(db.String(100))
    items = db.relationship('OrderItem', backref='order', lazy=True)

class OrderItem(db.Model):
    id = db.Column(db.Integer, primary_key=True)
    order_id = db.Column(db.Integer, db.ForeignKey('order.id'), nullable=False)
    product_id = db.Column(db.Integer, db.ForeignKey('product.id'), nullable=False)
    quantity = db.Column(db.Integer, nullable=False)
    price = db.Column(db.Float, nullable=False)

class ChatHistory(db.Model):
    id = db.Column(db.Integer, primary_key=True)
    user_id = db.Column(db.Integer, db.ForeignKey('user.id'), nullable=False)
    session_id = db.Column(db.String(100))
    user_message = db.Column(db.Text, nullable=False)
    bot_response = db.Column(db.Text, nullable=False)
    metadata = db.Column(db.Text)
    timestamp = db.Column(db.DateTime, default=datetime.utcnow)

class AdminAction(db.Model):
    id = db.Column(db.Integer, primary_key=True)
    admin_id = db.Column(db.Integer, db.ForeignKey('user.id'), nullable=False)
    action_type = db.Column(db.String(50), nullable=False)
    details = db.Column(db.Text)
    timestamp = db.Column(db.DateTime, default=datetime.utcnow)

@login_manager.user_loader
def load_user(user_id):
    return User.query.get(int(user_id))

# Helper Functions
def sync_shopify_products():
    """Sync products from Shopify to local database"""
    try:
        session = shopify.Session(shopify_shop_url, '2023-07', shopify_api_secret)
        shopify.ShopifyResource.activate_session(session)
        
        # Get all products from Shopify
        shopify_products = shopify.Product.find()
        
        for shopify_product in shopify_products:
            # Check if product already exists in database
            product = Product.query.filter_by(shopify_id=str(shopify_product.id)).first()
            
            # Get the first variant for price
            variant = shopify_product.variants[0]
            price = float(variant.price)
            
            # Get sale price if compare_at_price exists and is higher than price
            sale_price = None
            if variant.compare_at_price and float(variant.compare_at_price) > price:
                sale_price = price
                price = float(variant.compare_at_price)
            
            # Get image URL
            image_url = None
            if shopify_product.images and len(shopify_product.images) > 0:
                image_url = shopify_product.images[0].src
            
            # Get tags
            tags = shopify_product.tags if hasattr(shopify_product, 'tags') else ""
            
            # Get or create product
            if product:
                # Update existing product
                product.name = shopify_product.title
                product.description = shopify_product.body_html
                product.price = price
                product.sale_price = sale_price
                product.image_url = image_url
                product.tags = tags
                product.stock = variant.inventory_quantity
                product.updated_at = datetime.utcnow()
            else:
                # Create new product
                product = Product(
                    shopify_id=str(shopify_product.id),
                    name=shopify_product.title,
                    description=shopify_product.body_html,
                    price=price,
                    sale_price=sale_price,
                    image_url=image_url,
                    category=shopify_product.product_type,
                    tags=tags,
                    stock=variant.inventory_quantity
                )
                db.session.add(product)
            
        db.session.commit()
        shopify.ShopifyResource.clear_session()
        return True
    except Exception as e:
        print(f"Error syncing Shopify products: {e}")
        return False

def get_nebius_response(prompt, system_message="You are a helpful assistant for Luxe Hair Collection, specializing in premium hair products."):
    try:
        NEBIUS_API_KEY = os.getenv("NEBIUS_API_KEY")
        if not NEBIUS_API_KEY:
            raise ValueError("NEBIUS_API_KEY not found in environment variables")

        # Create a chat message history
        messages = [
            {"role": "system", "content": system_message},
            {"role": "user", "content": prompt}
        ]

        # Get response
        response = nebius_client.chat.create(
            model="llama-3-8b-instruct",
            messages=messages
        )
        return response.choices[0].message.content
    except Exception as e:
        print(f"Error in get_nebius_response: {str(e)}")
        return "I'm sorry, I encountered an error while processing your request. Please try again later."

def admin_ai_query(query, data_context=None):
    """Process admin AI queries through Nebius LLM"""
    try:
        # Build context from data if provided
        context = ""
        if data_context:
            context = f"\nCONTEXT INFORMATION:\n{json.dumps(data_context, indent=2)}\n\n"
        
        prompt = f"""You are an AI business assistant for Luxe Hair Collection, 
        a premium brand selling high-quality hair products.
        
        Current date: {datetime.now().strftime('%Y-%m-%d')}
        
        {context}
        
        USER QUERY: {query}
        
        Please provide a detailed analysis and actionable recommendations.
        """
        
        return get_nebius_response(prompt, system_message="You are an expert business operations assistant for a premium hair products company.")
    except Exception as e:
        print(f"Error in admin AI query: {e}")
        return "I encountered an error processing your query. Please try again later."

def generate_sales_chart():
    """Generate sales chart for admin dashboard"""
    try:
        # Get orders grouped by date
        orders = Order.query.all()
        
        # Convert to DataFrame
        order_data = []
        for order in orders:
            order_data.append({
                'date': order.order_date.strftime('%Y-%m-%d'),
                'amount': order.total_amount
            })
        
        df = pd.DataFrame(order_data)
        if df.empty:
            return None
            
        # Group by date and sum amounts
        df['date'] = pd.to_datetime(df['date'])
        daily_sales = df.groupby(df['date'].dt.date)['amount'].sum().reset_index()
        
        # Sort by date
        daily_sales = daily_sales.sort_values('date')
        
        # Create plot
        plt.figure(figsize=(10, 5))
        plt.plot(daily_sales['date'], daily_sales['amount'], marker='o')
        plt.title('Daily Sales')
        plt.xlabel('Date')
        plt.ylabel('Sales Amount ($)')
        plt.grid(True, linestyle='--', alpha=0.7)
        plt.tight_layout()
        
        # Convert plot to base64 string
        buffer = BytesIO()
        plt.savefig(buffer, format='png')
        buffer.seek(0)
        image_png = buffer.getvalue()
        buffer.close()
        
        chart = base64.b64encode(image_png).decode('utf-8')
        return chart
    except Exception as e:
        print(f"Error generating sales chart: {e}")
        return None

# Routes - Customer Side
@app.route('/')
def home():
    featured_products = Product.query.filter(Product.tags.contains('featured')).limit(8).all()
    return render_template('customer/index.html', products=featured_products)

@app.route('/shop')
def shop():
    category = request.args.get('category', '')
    search = request.args.get('search', '')
    
    query = Product.query
    
    if category:
        query = query.filter_by(category=category)
    
    if search:
        query = query.filter(Product.name.ilike(f'%{search}%') | 
                             Product.description.ilike(f'%{search}%') |
                             Product.tags.ilike(f'%{search}%'))
    
    products = query.all()
    categories = db.session.query(Product.category).distinct().all()
    categories = [c[0] for c in categories if c[0]]
    
    return render_template('customer/shop.html', 
                          products=products, 
                          categories=categories,
                          current_category=category,
                          search_term=search)

@app.route('/product/<int:product_id>')
def product_detail(product_id):
    product = Product.query.get_or_404(product_id)
    related_products = Product.query.filter(
        Product.category == product.category,
        Product.id != product.id
    ).limit(4).all()
    
    return render_template('customer/product_detail.html', 
                          product=product,
                          related_products=related_products)

@app.route('/virtual-try-on')
def virtual_try_on():
    products = Product.query.all()
    return render_template('customer/virtual_try_on.html', products=products)

@app.route('/chat')
@login_required
def chat():
    return render_template('customer/chat.html')

@app.route('/api/chat', methods=['POST'])
def chat_api():
    data = request.json
    user_message = data.get('message', '')
    session_id = data.get('session_id', '')
    
    if not user_message:
        return jsonify({'error': 'No message provided'}), 400
    
    # Generate a session ID if not provided
    if not session_id:
        session_id = f"session_{datetime.utcnow().timestamp()}"
    
    try:
        # Process message using CustomerChatbot
        if chatbot:
            response, metadata = chatbot.chat(user_message, session_id)
        else:
            # Fallback if chatbot is not initialized
            response = "I'm sorry, our AI chatbot is currently unavailable. Please try again later or contact customer support."
            metadata = {}
        
        # Save chat history if user is logged in
        if current_user.is_authenticated:
            chat_history = ChatHistory(
                user_id=current_user.id,
                session_id=session_id,
                user_message=user_message,
                bot_response=response,
                metadata=json.dumps(metadata) if metadata else None
            )
            db.session.add(chat_history)
            db.session.commit()
        
        return jsonify({
            'response': response,
            'session_id': session_id,
            'metadata': metadata
        })
    except Exception as e:
        app.logger.error(f"Error in chat API: {str(e)}")
        return jsonify({'error': str(e)}), 500

@app.route('/login', methods=['GET', 'POST'])
def login():
    if current_user.is_authenticated:
        return redirect(url_for('home'))
        
    if request.method == 'POST':
        email = request.form.get('email')
        password = request.form.get('password')
        
        user = User.query.filter_by(email=email).first()
        
        if user and check_password_hash(user.password, password):
            login_user(user)
            flash('Login successful!', 'success')
            
            next_page = request.args.get('next')
            if next_page:
                return redirect(next_page)
            elif user.is_admin:
                return redirect(url_for('admin_dashboard'))
            else:
                return redirect(url_for('home'))
        else:
            flash('Invalid email or password', 'danger')
    
    return render_template('customer/login.html')

@app.route('/register', methods=['GET', 'POST'])
def register():
    if current_user.is_authenticated:
        return redirect(url_for('home'))
        
    if request.method == 'POST':
        email = request.form.get('email')
        password = request.form.get('password')
        name = request.form.get('name')
        
        user_exists = User.query.filter_by(email=email).first()
        
        if user_exists:
            flash('Email already exists', 'danger')
            return redirect(url_for('register'))
        
        hashed_password = generate_password_hash(password)
        new_user = User(email=email, password=hashed_password, name=name)
        
        db.session.add(new_user)
        db.session.commit()
        
        flash('Registration successful! Please login.', 'success')
        return redirect(url_for('login'))
    
    return render_template('customer/register.html')

@app.route('/logout')
@login_required
def logout():
    logout_user()
    flash('You have been logged out', 'info')
    return redirect(url_for('home'))

@app.route('/profile')
@login_required
def profile():
    orders = Order.query.filter_by(user_id=current_user.id).order_by(Order.order_date.desc()).all()
    return render_template('customer/profile.html', orders=orders)

@app.route('/cart')
def cart():
    # Get cart from session
    cart_items = session.get('cart', [])
    cart_total = 0
    products = []
    
    for item in cart_items:
        product = Product.query.get(item['product_id'])
        if product:
            quantity = item['quantity']
            price = product.sale_price if product.sale_price else product.price
            subtotal = price * quantity
            cart_total += subtotal
            
            products.append({
                'id': product.id,
                'name': product.name,
                'price': price,
                'quantity': quantity,
                'subtotal': subtotal,
                'image_url': product.image_url
            })
    
    return render_template('customer/cart.html', cart_items=products, cart_total=cart_total)

@app.route('/add-to-cart', methods=['POST'])
def add_to_cart():
    product_id = request.form.get('product_id', type=int)
    quantity = request.form.get('quantity', 1, type=int)
    
    if not product_id:
        flash('Invalid product', 'danger')
        return redirect(url_for('shop'))
    
    product = Product.query.get_or_404(product_id)
    
    # Initialize cart if it doesn't exist
    if 'cart' not in session:
        session['cart'] = []
    
    # Check if product already in cart
    cart = session['cart']
    product_in_cart = False
    
    for item in cart:
        if item['product_id'] == product_id:
            item['quantity'] += quantity
            product_in_cart = True
            break
    
    if not product_in_cart:
        cart.append({'product_id': product_id, 'quantity': quantity})
    
    session['cart'] = cart
    flash(f'{product.name} added to cart!', 'success')
    
    return redirect(url_for('cart'))

@app.route('/update-cart', methods=['POST'])
def update_cart():
    product_id = request.form.get('product_id', type=int)
    quantity = request.form.get('quantity', 1, type=int)
    
    if not product_id:
        return jsonify({'error': 'Invalid product'}), 400
    
    if 'cart' not in session:
        return jsonify({'error': 'Cart is empty'}), 400
    
    cart = session['cart']
    
    for item in cart:
        if item['product_id'] == product_id:
            if quantity <= 0:
                cart.remove(item)
            else:
                item['quantity'] = quantity
            break
    
    session['cart'] = cart
    
    return jsonify({'success': True})

@app.route('/checkout', methods=['GET', 'POST'])
@login_required
def checkout():
    if 'cart' not in session or not session['cart']:
        flash('Your cart is empty', 'info')
        return redirect(url_for('shop'))
    
    if request.method == 'POST':
        # Process checkout
        cart_items = session.get('cart', [])
        total_amount = 0
        
        # Calculate total amount
        for item in cart_items:
            product = Product.query.get(item['product_id'])
            if product:
                price = product.sale_price if product.sale_price else product.price
                total_amount += price * item['quantity']
        
        # Create order
        order = Order(
            user_id=current_user.id,
            total_amount=total_amount,
            shipping_address=request.form.get('address'),
            status='pending'
        )
        
        db.session.add(order)
        db.session.flush()  # Get order ID without committing
        
        # Add order items
        for item in cart_items:
            product = Product.query.get(item['product_id'])
            if product:
                price = product.sale_price if product.sale_price else product.price
                order_item = OrderItem(
                    order_id=order.id,
                    product_id=product.id,
                    quantity=item['quantity'],
                    price=price
                )
                db.session.add(order_item)
        
        db.session.commit()
        
        # Clear cart
        session.pop('cart', None)
        
        flash('Order placed successfully!', 'success')
        return redirect(url_for('order_confirmation', order_id=order.id))
    
    # Get cart items for display
    cart_items = session.get('cart', [])
    cart_total = 0
    products = []
    
    for item in cart_items:
        product = Product.query.get(item['product_id'])
        if product:
            quantity = item['quantity']
            price = product.sale_price if product.sale_price else product.price
            subtotal = price * quantity
            cart_total += subtotal
            
            products.append({
                'id': product.id,
                'name': product.name,
                'price': price,
                'quantity': quantity,
                'subtotal': subtotal
            })
    
    return render_template('customer/checkout.html', 
                          cart_items=products, 
                          cart_total=cart_total,
                          user=current_user)

@app.route('/order-confirmation/<int:order_id>')
@login_required
def order_confirmation(order_id):
    order = Order.query.get_or_404(order_id)
    
    # Ensure user can only view their own orders
    if order.user_id != current_user.id and not current_user.is_admin:
        flash('Unauthorized access', 'danger')
        return redirect(url_for('home'))
    
    return render_template('customer/order_confirmation.html', order=order)

# Routes - Admin Side
@app.route('/admin')
@login_required
def admin_dashboard():
    if not current_user.is_admin:
        flash('Access denied: Admin privileges required', 'danger')
        return redirect(url_for('home'))
    
    # Get counts for dashboard
    product_count = Product.query.count()
    user_count = User.query.count()
    order_count = Order.query.count()
    
    # Get recent orders
    recent_orders = Order.query.order_by(Order.order_date.desc()).limit(5).all()
    
    # Generate sales chart
    sales_chart = generate_sales_chart()
    
    return render_template('admin/dashboard.html', 
                          product_count=product_count,
                          user_count=user_count,
                          order_count=order_count,
                          recent_orders=recent_orders,
                          sales_chart=sales_chart)

@app.route('/admin/products')
@login_required
def admin_products():
    if not current_user.is_admin:
        flash('Access denied: Admin privileges required', 'danger')
        return redirect(url_for('home'))
    
    products = Product.query.all()
    return render_template('admin/products.html', products=products)

@app.route('/admin/sync-products')
@login_required
def admin_sync_products():
    if not current_user.is_admin:
        flash('Access denied: Admin privileges required', 'danger')
        return redirect(url_for('home'))
    
    success = sync_shopify_products()
    
    if success:
        flash('Products synchronized successfully!', 'success')
    else:
        flash('Error synchronizing products', 'danger')
    
    return redirect(url_for('admin_products'))

@app.route('/admin/orders')
@login_required
def admin_orders():
    if not current_user.is_admin:
        flash('Access denied: Admin privileges required', 'danger')
        return redirect(url_for('home'))
    
    orders = Order.query.order_by(Order.order_date.desc()).all()
    return render_template('admin/orders.html', orders=orders)

@app.route('/admin/users')
@login_required
def admin_users():
    if not current_user.is_admin:
        flash('Access denied: Admin privileges required', 'danger')
        return redirect(url_for('home'))
    
    users = User.query.all()
    return render_template('admin/users.html', users=users)

@app.route('/admin/ai-dashboard')
@login_required
def admin_ai_assistant():
    if not current_user.is_admin:
        flash('Access denied. Admin privileges required.', 'danger')
        return redirect(url_for('home'))
    
    # Get AI statistics for the dashboard
    monthly_interactions = ChatHistory.query.filter(
        ChatHistory.timestamp >= (datetime.utcnow() - timedelta(days=30))
    ).count()
    
    try_on_count = db.session.query(AdminAction).filter(
        AdminAction.action_type == 'virtual_try_on',
        AdminAction.timestamp >= (datetime.utcnow() - timedelta(days=30))
    ).count()
    
    # Calculate chat success rate (simplified example)
    chat_success_rate = 95  # Default value
    
    # Calculate AI-driven sales (simplified)
    ai_driven_sales = 12500  # Default value
    
    # Get recent AI reports (simplified)
    ai_reports = [
        {
            'id': 1, 
            'name': 'Monthly Inventory Analysis', 
            'created_at': (datetime.utcnow() - timedelta(days=2)).strftime('%Y-%m-%d')
        },
        {
            'id': 2, 
            'name': 'Customer Demographics Report', 
            'created_at': (datetime.utcnow() - timedelta(days=5)).strftime('%Y-%m-%d')
        },
        {
            'id': 3, 
            'name': 'Product Performance Analysis', 
            'created_at': (datetime.utcnow() - timedelta(days=10)).strftime('%Y-%m-%d')
        }
    ]
    
    # Get recent AI activities
    ai_activities = [
        {
            'action': 'Inventory Analysis', 
            'timestamp': (datetime.utcnow() - timedelta(hours=3)).strftime('%Y-%m-%d %H:%M'), 
            'success': True
        },
        {
            'action': 'Customer Segmentation', 
            'timestamp': (datetime.utcnow() - timedelta(days=1)).strftime('%Y-%m-%d %H:%M'), 
            'success': True
        },
        {
            'action': 'Sales Forecast Generation', 
            'timestamp': (datetime.utcnow() - timedelta(days=2)).strftime('%Y-%m-%d %H:%M'), 
            'success': False
        },
        {
            'action': 'Marketing Campaign Analysis', 
            'timestamp': (datetime.utcnow() - timedelta(days=3)).strftime('%Y-%m-%d %H:%M'), 
            'success': True
        }
    ]
    
    return render_template(
        'admin/ai_dashboard.html',
        monthly_interactions=monthly_interactions,
        try_on_count=try_on_count,
        chat_success_rate=chat_success_rate,
        ai_driven_sales=ai_driven_sales,
        ai_reports=ai_reports,
        ai_activities=ai_activities
    )

@app.route('/admin/view-ai-report/<int:report_id>')
@login_required
def view_ai_report(report_id):
    if not current_user.is_admin:
        flash('Access denied. Admin privileges required.', 'danger')
        return redirect(url_for('home'))
    
    # In a real implementation, fetch the report from the database
    # For now, return a placeholder
    return f"Viewing AI Report #{report_id}"

@app.route('/admin/download-ai-report/<int:report_id>')
@login_required
def download_ai_report(report_id):
    if not current_user.is_admin:
        flash('Access denied. Admin privileges required.', 'danger')
        return redirect(url_for('home'))
    
    # In a real implementation, generate and return the report file
    # For now, return a placeholder
    return f"Downloading AI Report #{report_id}"

@app.route('/admin/update-order-status', methods=['POST'])
@login_required
def update_order_status():
    if not current_user.is_admin:
        return jsonify({"error": "Unauthorized"}), 403
    
    order_id = request.form.get('order_id', type=int)
    status = request.form.get('status')
    
    if not order_id or not status:
        return jsonify({"error": "Invalid data"}), 400
    
    order = Order.query.get_or_404(order_id)
    order.status = status
    
    if status == 'shipped' and not order.tracking_number:
        order.tracking_number = f"LH-{order.id}-{int(datetime.utcnow().timestamp())}"
    
    db.session.commit()
    
    # Log admin action
    admin_action = AdminAction(
        admin_id=current_user.id,
        action_type='update_order',
        details=json.dumps({
            "order_id": order_id,
            "new_status": status
        })
    )
    db.session.add(admin_action)
    db.session.commit()
    
    flash(f'Order #{order.id} status updated to {status}', 'success')
    return redirect(url_for('admin_orders'))

@app.route('/admin/analyze-inventory', methods=['GET'])
@login_required
def analyze_inventory():
    """Analyze inventory using the AdminAgent"""
    if not current_user.is_admin:
        return jsonify({"error": "Unauthorized"}), 403
    
    try:
        # Get all products from database
        products = Product.query.all()
        products_data = [p.to_dict() for p in products]
        
        # Use AdminAgent if available
        if admin_agent:
            analysis = admin_agent.analyze_inventory(products_data)
        else:
            # Basic fallback analysis if AdminAgent is not available
            low_stock = [p for p in products_data if p.get('stock', 0) <= 5]
            analysis = {
                "low_stock_items": low_stock,
                "total_products": len(products_data),
                "total_stock_value": sum(p.get('price', 0) * p.get('stock', 0) for p in products_data),
                "insights": "AI analysis unavailable. Please check manually."
            }
        
        return jsonify(analysis)
        
    except Exception as e:
        print(f"Error analyzing inventory: {e}")
        return jsonify({
            "error": str(e),
            "message": "Error analyzing inventory"
        }), 500

@app.route('/product-recommendation', methods=['POST'])
def product_recommendation():
    """Get personalized product recommendations"""
    if not request.is_json:
        return jsonify({"error": "Request must be JSON"}), 400
    
    data = request.json
    preferences = data.get('preferences', {})
    
    if not preferences:
        return jsonify({"error": "No preferences provided"}), 400
    
    try:
        # Use CustomerChatbot if available
        if chatbot:
            recommendations = chatbot.get_product_recommendation(preferences)
        else:
            # Basic fallback if chatbot is not available
            recommendations = {
                "recommendations": "We recommend viewing our most popular products. For personalized recommendations, please try again later.",
                "based_on_preferences": preferences,
                "timestamp": datetime.now().isoformat()
            }
        
        return jsonify(recommendations)
        
    except Exception as e:
        print(f"Error getting product recommendations: {e}")
        return jsonify({
            "error": str(e),
            "message": "Error getting product recommendations"
        }), 500

@app.route('/virtual-try-on', methods=['POST'])
def virtual_try_on_api():
    """API endpoint for virtual try-on feature"""
    if not request.is_json:
        return jsonify({"error": "Request must be JSON"}), 400
    
    data = request.json
    user_image = data.get('image')
    hair_style_id = data.get('hairStyleId')
    
    if not user_image or not hair_style_id:
        return jsonify({"error": "Missing required parameters"}), 400
    
    try:
        # Check if VirtualTryOn is available
        if virtual_try_on:
            success, message, processed_image = virtual_try_on.process_image(user_image, hair_style_id)
            
            if success and processed_image:
                # Log the action if user is authenticated
                if current_user.is_authenticated:
                    admin_action = AdminAction(
                        admin_id=current_user.id,
                        action_type="virtual_try_on",
                        details=json.dumps({
                            "hair_style_id": hair_style_id,
                            "success": success
                        })
                    )
                    db.session.add(admin_action)
                    db.session.commit()
                
                return jsonify({
                    "success": True,
                    "message": message,
                    "image": processed_image
                })
            else:
                return jsonify({
                    "success": False,
                    "message": message
                }), 400
        else:
            # Fallback message if virtual try-on is not available
            return jsonify({
                "success": False,
                "message": "Virtual try-on service is currently unavailable. Please try again later."
            }), 503
            
    except Exception as e:
        app.logger.error(f"Error in virtual try-on: {e}")
        return jsonify({
            "success": False,
            "message": f"An error occurred: {str(e)}"
        }), 500

@app.route('/admin-ai-query-api', methods=['POST'])
@login_required
def admin_ai_query_api():
    """API endpoint for admin AI queries"""
    if not current_user.is_admin:
        return jsonify({"error": "Unauthorized"}), 403
    
    if not request.is_json:
        return jsonify({"error": "Request must be JSON"}), 400
    
    data = request.json
    query = data.get('query')
    
    if not query:
        return jsonify({"error": "No query provided"}), 400
    
    try:
        # Use AdminAgent if available, otherwise fallback to basic function
        if admin_agent:
            # Prepare business data context (could be fetched from database in a real implementation)
            business_data = None
            if data.get('includeBusinessData', False):
                # Get relevant business data to provide context
                products = Product.query.all()
                products_data = [{"id": p.id, "name": p.name, "price": p.price, "stock": p.stock, "category": p.category} for p in products]
                
                # Get orders data
                orders = Order.query.all()
                orders_data = [{"id": o.id, "user_id": o.user_id, "status": o.status, "total_amount": o.total_amount} for o in orders]
                
                business_data = {
                    "products": products_data,
                    "orders": orders_data
                }
            
            # Query the admin agent
            response = admin_agent.query(query, business_data)
        else:
            # Fallback to basic admin query
            response = admin_ai_query(query)
        
        # Log admin action
        admin_action = AdminAction(
            admin_id=current_user.id,
            action_type="ai_query",
            details=json.dumps({
                "query": query,
                "response_summary": response[:100] + "..." if len(response) > 100 else response
            })
        )
        db.session.add(admin_action)
        db.session.commit()
        
        return jsonify({
            "response": response,
            "timestamp": datetime.utcnow().isoformat()
        })
        
    except Exception as e:
        app.logger.error(f"Error in admin AI query: {e}")
        return jsonify({
            "error": str(e),
            "response": "I encountered an error processing your query. Please try again."
        }), 500

# ---------- NEW ADMIN AGENT API ENDPOINTS ----------

@app.route('/api/admin/manage-products', methods=['POST'])
@login_required
def admin_manage_products_api():
    """API endpoint for AI-assisted product management"""
    if not current_user.is_admin:
        return jsonify({"success": False, "error": "Admin access required"}), 403
        
    if not request.is_json:
        return jsonify({"success": False, "error": "Request must be JSON"}), 400
        
    data = request.json
    action = data.get('action')
    product_data = data.get('product_data')
    product_id = data.get('product_id')
    
    if not action:
        return jsonify({"success": False, "error": "Action is required"}), 400
        
    try:
        if admin_agent:
            result = admin_agent.manage_products(action, product_data, product_id)
            
            # For create/update actions, actually modify the database
            if result.get('success') and action == 'create' and product_data:
                new_product = Product(
                    name=product_data.get('name', 'New Product'),
                    description=product_data.get('description', ''),
                    price=float(product_data.get('price', 0)),
                    category=product_data.get('category', ''),
                    image_url=product_data.get('image_url', ''),
                    stock=int(product_data.get('stock', 0))
                )
                db.session.add(new_product)
                db.session.commit()
                result['product_id'] = new_product.id
                
            elif result.get('success') and action == 'update' and product_id and product_data:
                product = Product.query.get(product_id)
                if product:
                    if 'name' in product_data:
                        product.name = product_data['name']
                    if 'description' in product_data:
                        product.description = product_data['description']
                    if 'price' in product_data:
                        product.price = float(product_data['price'])
                    if 'category' in product_data:
                        product.category = product_data['category']
                    if 'image_url' in product_data:
                        product.image_url = product_data['image_url']
                    if 'stock' in product_data:
                        product.stock = int(product_data['stock'])
                    product.updated_at = datetime.utcnow()
                    db.session.commit()
                else:
                    return jsonify({"success": False, "error": f"Product #{product_id} not found"}), 404
                    
            elif result.get('success') and action == 'delete' and product_id:
                product = Product.query.get(product_id)
                if product:
                    db.session.delete(product)
                    db.session.commit()
                else:
                    return jsonify({"success": False, "error": f"Product #{product_id} not found"}), 404
            
            # Log the admin action
            admin_action = AdminAction(
                admin_id=current_user.id,
                action_type=f"product_{action}",
                details=json.dumps({
                    "product_id": product_id,
                    "product_data": product_data,
                    "action": action
                })
            )
            db.session.add(admin_action)
            db.session.commit()
            
            return jsonify(result)
        else:
            return jsonify({
                "success": False,
                "error": "Admin agent is not available"
            }), 503
    except Exception as e:
        app.logger.error(f"Error in admin product management: {e}")
        return jsonify({
            "success": False,
            "error": f"An error occurred: {str(e)}"
        }), 500

@app.route('/api/admin/manage-orders', methods=['POST'])
@login_required
def admin_manage_orders_api():
    """API endpoint for AI-assisted order management"""
    if not current_user.is_admin:
        return jsonify({"success": False, "error": "Admin access required"}), 403
        
    if not request.is_json:
        return jsonify({"success": False, "error": "Request must be JSON"}), 400
        
    data = request.json
    action = data.get('action')
    order_data = data.get('order_data')
    order_id = data.get('order_id')
    
    if not action:
        return jsonify({"success": False, "error": "Action is required"}), 400
        
    try:
        if admin_agent:
            result = admin_agent.manage_orders(action, order_data, order_id)
            
            # For update action, actually modify the database
            if result.get('success') and action == 'update' and order_id and order_data:
                order = Order.query.get(order_id)
                if order:
                    if 'status' in order_data:
                        order.status = order_data['status']
                    if 'tracking_number' in order_data:
                        order.tracking_number = order_data['tracking_number']
                    db.session.commit()
                else:
                    return jsonify({"success": False, "error": f"Order #{order_id} not found"}), 404
            
            # Log the admin action
            admin_action = AdminAction(
                admin_id=current_user.id,
                action_type=f"order_{action}",
                details=json.dumps({
                    "order_id": order_id,
                    "order_data": order_data,
                    "action": action
                })
            )
            db.session.add(admin_action)
            db.session.commit()
            
            return jsonify(result)
        else:
            return jsonify({
                "success": False,
                "error": "Admin agent is not available"
            }), 503
    except Exception as e:
        app.logger.error(f"Error in admin order management: {e}")
        return jsonify({
            "success": False,
            "error": f"An error occurred: {str(e)}"
        }), 500

@app.route('/api/admin/manage-users', methods=['POST'])
@login_required
def admin_manage_users_api():
    """API endpoint for AI-assisted user management"""
    if not current_user.is_admin:
        return jsonify({"success": False, "error": "Admin access required"}), 403
        
    if not request.is_json:
        return jsonify({"success": False, "error": "Request must be JSON"}), 400
        
    data = request.json
    action = data.get('action')
    user_data = data.get('user_data')
    user_id = data.get('user_id')
    
    if not action:
        return jsonify({"success": False, "error": "Action is required"}), 400
        
    try:
        if admin_agent:
            result = admin_agent.manage_users(action, user_data, user_id)
            
            # For create/update actions, actually modify the database
            if result.get('success') and action == 'create' and user_data:
                # Check if user with this email already exists
                if User.query.filter_by(email=user_data.get('email')).first():
                    return jsonify({"success": False, "error": "User with this email already exists"}), 400
                    
                new_user = User(
                    email=user_data.get('email'),
                    name=user_data.get('name', ''),
                    password=generate_password_hash(user_data.get('password', 'default_password')),
                    is_admin=user_data.get('is_admin', False),
                    phone=user_data.get('phone', ''),
                    address=user_data.get('address', '')
                )
                db.session.add(new_user)
                db.session.commit()
                result['user_id'] = new_user.id
                
            elif result.get('success') and action == 'update' and user_id and user_data:
                user = User.query.get(user_id)
                if user:
                    if 'email' in user_data:
                        # Check if another user already has this email
                        existing_user = User.query.filter_by(email=user_data['email']).first()
                        if existing_user and existing_user.id != user.id:
                            return jsonify({"success": False, "error": "Email already in use by another user"}), 400
                        user.email = user_data['email']
                    if 'name' in user_data:
                        user.name = user_data['name']
                    if 'password' in user_data and user_data['password']:
                        user.password = generate_password_hash(user_data['password'])
                    if 'is_admin' in user_data:
                        user.is_admin = bool(user_data['is_admin'])
                    if 'phone' in user_data:
                        user.phone = user_data['phone']
                    if 'address' in user_data:
                        user.address = user_data['address']
                    db.session.commit()
                else:
                    return jsonify({"success": False, "error": f"User #{user_id} not found"}), 404
                    
            elif result.get('success') and action == 'delete' and user_id:
                # Prevent deleting oneself
                if int(user_id) == current_user.id:
                    return jsonify({"success": False, "error": "Cannot delete your own account"}), 400
                    
                user = User.query.get(user_id)
                if user:
                    db.session.delete(user)
                    db.session.commit()
                else:
                    return jsonify({"success": False, "error": f"User #{user_id} not found"}), 404
            
            # Log the admin action
            admin_action = AdminAction(
                admin_id=current_user.id,
                action_type=f"user_{action}",
                details=json.dumps({
                    "user_id": user_id,
                    "user_data": {k: v for k, v in user_data.items() if k != 'password'} if user_data else None,
                    "action": action
                })
            )
            db.session.add(admin_action)
            db.session.commit()
            
            return jsonify(result)
        else:
            return jsonify({
                "success": False,
                "error": "Admin agent is not available"
            }), 503
    except Exception as e:
        app.logger.error(f"Error in admin user management: {e}")
        return jsonify({
            "success": False,
            "error": f"An error occurred: {str(e)}"
        }), 500

@app.route('/api/admin/virtual-try-on', methods=['POST'])
@login_required
def admin_virtual_try_on_api():
    """API endpoint for AI-assisted virtual try-on management"""
    if not current_user.is_admin:
        return jsonify({"success": False, "error": "Admin access required"}), 403
        
    if not request.is_json:
        return jsonify({"success": False, "error": "Request must be JSON"}), 400
        
    data = request.json
    action = data.get('action')
    try_on_data = data.get('data')
    
    if not action:
        return jsonify({"success": False, "error": "Action is required"}), 400
        
    try:
        if admin_agent:
            result = admin_agent.manage_virtual_try_on(action, try_on_data)
            
            # Log the admin action
            admin_action = AdminAction(
                admin_id=current_user.id,
                action_type=f"virtual_try_on_{action}",
                details=json.dumps({
                    "action": action,
                    "data": try_on_data
                })
            )
            db.session.add(admin_action)
            db.session.commit()
            
            return jsonify(result)
        else:
            return jsonify({
                "success": False,
                "error": "Admin agent is not available"
            }), 503
    except Exception as e:
        app.logger.error(f"Error in admin virtual try-on management: {e}")
        return jsonify({
            "success": False,
            "error": f"An error occurred: {str(e)}"
        }), 500

@app.route('/api/admin/marketing-campaign', methods=['POST'])
@login_required
def admin_marketing_campaign_api():
    """API endpoint for AI-generated marketing campaigns"""
    if not current_user.is_admin:
        return jsonify({"success": False, "error": "Admin access required"}), 403
        
    if not request.is_json:
        return jsonify({"success": False, "error": "Request must be JSON"}), 400
        
    data = request.json
    campaign_type = data.get('campaign_type')
    target_audience = data.get('target_audience')
    product_ids = data.get('product_ids', [])
    
    if not campaign_type:
        return jsonify({"success": False, "error": "Campaign type is required"}), 400
        
    try:
        if admin_agent:
            # Get full product details if product IDs are provided
            products = []
            if product_ids:
                products = Product.query.filter(Product.id.in_(product_ids)).all()
                products = [
                    {
                        "id": p.id,
                        "name": p.name,
                        "price": p.price,
                        "category": p.category,
                        "description": p.description
                    }
                    for p in products
                ]
            
            result = admin_agent.generate_marketing_campaign(campaign_type, target_audience, products)
            
            # Log the admin action
            admin_action = AdminAction(
                admin_id=current_user.id,
                action_type="marketing_campaign",
                details=json.dumps({
                    "campaign_type": campaign_type,
                    "target_audience": target_audience,
                    "product_ids": product_ids
                })
            )
            db.session.add(admin_action)
            db.session.commit()
            
            return jsonify(result)
        else:
            return jsonify({
                "success": False,
                "error": "Admin agent is not available"
            }), 503
    except Exception as e:
        app.logger.error(f"Error generating marketing campaign: {e}")
        return jsonify({
            "success": False,
            "error": f"An error occurred: {str(e)}"
        }), 500

@app.route('/api/admin/website-analytics', methods=['POST'])
@login_required
def admin_website_analytics_api():
    """API endpoint for AI-assisted website analytics"""
    if not current_user.is_admin:
        return jsonify({"success": False, "error": "Admin access required"}), 403
        
    if not request.is_json:
        return jsonify({"success": False, "error": "Request must be JSON"}), 400
        
    data = request.json
    metrics = data.get('metrics', {})
    
    try:
        if admin_agent:
            result = admin_agent.analyze_website_performance(metrics)
            
            # Log the admin action
            admin_action = AdminAction(
                admin_id=current_user.id,
                action_type="website_analytics",
                details=json.dumps({
                    "metrics": metrics
                })
            )
            db.session.add(admin_action)
            db.session.commit()
            
            return jsonify(result)
        else:
            return jsonify({
                "success": False,
                "error": "Admin agent is not available"
            }), 503
    except Exception as e:
        app.logger.error(f"Error analyzing website performance: {e}")
        return jsonify({
            "success": False,
            "error": f"An error occurred: {str(e)}"
        }), 500

@app.route('/api/admin/business-dashboard', methods=['POST'])
@login_required
def admin_business_dashboard_api():
    """API endpoint for AI-generated business dashboard"""
    if not current_user.is_admin:
        return jsonify({"success": False, "error": "Admin access required"}), 403
        
    if not request.is_json:
        return jsonify({"success": False, "error": "Request must be JSON"}), 400
        
    data = request.json
    dashboard_data = data.get('data', {})
    
    try:
        if admin_agent:
            # If no data is provided, gather some basic metrics
            if not dashboard_data:
                total_products = Product.query.count()
                total_users = User.query.count()
                total_orders = Order.query.count()
                
                # Calculate recent revenue (last 30 days)
                recent_orders = Order.query.filter(
                    Order.order_date >= datetime.utcnow() - timedelta(days=30)
                ).all()
                recent_revenue = sum(order.total_amount for order in recent_orders)
                
                # Get low stock products
                low_stock_products = Product.query.filter(Product.stock <= 5).count()
                
                dashboard_data = {
                    "total_products": total_products,
                    "total_users": total_users,
                    "total_orders": total_orders,
                    "recent_orders": len(recent_orders),
                    "recent_revenue": recent_revenue,
                    "low_stock_products": low_stock_products
                }
            
            result = admin_agent.get_business_dashboard(dashboard_data)
            
            # Log the admin action
            admin_action = AdminAction(
                admin_id=current_user.id,
                action_type="business_dashboard",
                details=json.dumps({
                    "dashboard_data": dashboard_data
                })
            )
            db.session.add(admin_action)
            db.session.commit()
            
            return jsonify(result)
        else:
            return jsonify({
                "success": False,
                "error": "Admin agent is not available"
            }), 503
    except Exception as e:
        app.logger.error(f"Error generating business dashboard: {e}")
        return jsonify({
            "success": False,
            "error": f"An error occurred: {str(e)}"
        }), 500

# Create database tables
with app.app_context():
    db.create_all()
    
    # Create admin user if none exists
    admin = User.query.filter_by(is_admin=True).first()
    if not admin:
        admin = User(
            email='admin@luxehair.com',
            password=generate_password_hash('admin123'),
            name='Admin User',
            is_admin=True
        )
        db.session.add(admin)
        db.session.commit()

if __name__ == '__main__':
    app.run(debug=True)
