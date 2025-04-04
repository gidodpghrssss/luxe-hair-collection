import os
import json
import base64
from datetime import datetime, timedelta
from flask import Flask, render_template, redirect, url_for, flash, request, jsonify, session
from flask_sqlalchemy import SQLAlchemy
from flask_login import LoginManager, login_user, logout_user, login_required, current_user
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
import openai

# Initialize client
try:
    openai.api_key = os.getenv('NEBIUS_API_KEY')
    openai.api_base = os.getenv('NEBIUS_API_BASE', 'https://api.nebius.cloud/v1')
    print("Nebius API initialized successfully")
except Exception as e:
    print(f"Error initializing Nebius API: {str(e)}")
    openai = None

import pandas as pd
import numpy as np
import matplotlib.pyplot as plt
from io import BytesIO
import base64

# Import our custom modules
from app.virtual_try_on import VirtualTryOn
from app.admin_agent import AdminAgent
from app.chatbot import CustomerChatbot

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

# Set port
app.config['PORT'] = int(os.getenv('PORT', 5000))

# Initialize database
db = SQLAlchemy(app)

# Import models
from app.models import User

# Initialize login manager
login_manager = LoginManager()
login_manager.init_app(app)
login_manager.login_view = 'login'

@login_manager.user_loader
def load_user(user_id):
    return User.query.get(int(user_id))

# Initialize AI components
try:
    print("Initializing AI components...")
    if os.getenv('ENABLE_VIRTUAL_TRY_ON', 'true').lower() == 'true':
        try:
            virtual_try_on = VirtualTryOn()
            print("Virtual try-on initialized successfully")
        except Exception as e:
            print(f"Error initializing virtual try-on: {e}")
            virtual_try_on = None

    if os.getenv('ENABLE_ADMIN_AGENT', 'true').lower() == 'true':
        try:
            admin_agent = AdminAgent()
            print("Admin agent initialized successfully")
        except Exception as e:
            print(f"Error initializing admin agent: {e}")
            admin_agent = None

    if os.getenv('ENABLE_CUSTOMER_CHATBOT', 'true').lower() == 'true':
        try:
            customer_chatbot = CustomerChatbot()
            print("Customer chatbot initialized successfully")
        except Exception as e:
            print(f"Error initializing customer chatbot: {e}")
            customer_chatbot = None

except Exception as e:
    print(f"Error initializing AI components: {e}")

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
    app.run(debug=True, port=app.config['PORT'])
