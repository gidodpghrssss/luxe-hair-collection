from .. import app, db
from ..models import Product

def upgrade():
    with app.app_context():
        try:
            # Add sales column if it doesn't exist
            db.engine.execute("""
                DO $$ 
                BEGIN
                    IF NOT EXISTS (
                        SELECT 1 FROM information_schema.columns 
                        WHERE table_name = 'product' AND column_name = 'sales'
                    ) THEN
                        ALTER TABLE product ADD COLUMN sales INTEGER DEFAULT 0;
                    END IF;
                END $$;
            """)
            print("Sales column added successfully")
            
            # Update existing products with sales = 0
            db.engine.execute("UPDATE product SET sales = 0")
            print("Existing products updated successfully")
            
            # Add sample featured products if none exist
            sample_products = [
                {
                    'name': 'Luxury Synthetic Wig',
                    'description': 'Premium quality synthetic wig with natural look',
                    'price': 149.99,
                    'image_url': 'https://via.placeholder.com/800x600?text=Luxury+Wig',
                    'category': 'wigs',
                    'tags': 'featured, premium',
                    'stock': 15,
                    'sales': 0
                },
                {
                    'name': 'Basic Synthetic Wig',
                    'description': 'Affordable synthetic wig for everyday wear',
                    'price': 79.99,
                    'image_url': 'https://via.placeholder.com/800x600?text=Basic+Wig',
                    'category': 'wigs',
                    'tags': 'featured, basic',
                    'stock': 20,
                    'sales': 0
                }
            ]
            
            # Add sample products if none exist
            if not Product.query.first():
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
            # Remove sales column if it exists
            db.engine.execute("""
                DO $$ 
                BEGIN
                    IF EXISTS (
                        SELECT 1 FROM information_schema.columns 
                        WHERE table_name = 'product' AND column_name = 'sales'
                    ) THEN
                        ALTER TABLE product DROP COLUMN sales;
                    END IF;
                END $$;
            """)
            print("Sales column removed successfully")
        except Exception as e:
            print(f"Error during downgrade: {str(e)}")
