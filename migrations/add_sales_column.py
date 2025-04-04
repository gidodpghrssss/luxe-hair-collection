from app import app, db
from .models import Product  # Import the Product model

def upgrade():
    with app.app_context():
        try:
            # Add sales column to products table
            db.engine.execute("ALTER TABLE product ADD COLUMN IF NOT EXISTS sales INTEGER DEFAULT 0")
            print("Sales column added successfully")
            
            # Update existing products with sales = 0
            db.engine.execute("UPDATE product SET sales = 0")
            print("Existing products updated successfully")
            
            # Add some sample featured products
            sample_products = [
                {
                    'name': 'Luxury Synthetic Wig',
                    'description': 'Premium quality synthetic wig with natural look',
                    'price': 149.99,
                    'image_url': 'https://example.com/luxury-wig.jpg',
                    'category': 'wigs',
                    'tags': 'featured, premium',
                    'stock': 15,
                    'sales': 0
                },
                {
                    'name': 'Basic Synthetic Wig',
                    'description': 'Affordable synthetic wig for everyday wear',
                    'price': 79.99,
                    'image_url': 'https://example.com/basic-wig.jpg',
                    'category': 'wigs',
                    'tags': 'featured, basic',
                    'stock': 20,
                    'sales': 0
                }
            ]
            
            for product_data in sample_products:
                product = Product(**product_data)
                db.session.add(product)
            
            db.session.commit()
            print("Sample products added successfully")
        except Exception as e:
            print(f"Error during migration: {str(e)}")

def downgrade():
    with app.app_context():
        try:
            # Remove sales column
            db.engine.execute("ALTER TABLE product DROP COLUMN IF EXISTS sales")
            print("Sales column removed successfully")
        except Exception as e:
            print(f"Error during downgrade: {str(e)}")
