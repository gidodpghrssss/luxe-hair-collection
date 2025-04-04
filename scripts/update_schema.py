import os
import psycopg2
from psycopg2 import sql

def update_schema():
    try:
        # Get database URL from environment variables
        db_url = os.getenv('DATABASE_URL')
        if not db_url:
            raise ValueError("DATABASE_URL environment variable is not set")

        # Connect to the database
        conn = psycopg2.connect(db_url)
        cursor = conn.cursor()

        # Execute the SQL commands
        commands = [
            """
            DO $$ 
            BEGIN
                IF NOT EXISTS (
                    SELECT 1 FROM information_schema.columns 
                    WHERE table_name = 'product' AND column_name = 'sales'
                ) THEN
                    ALTER TABLE product ADD COLUMN sales INTEGER DEFAULT 0;
                END IF;
            END $$;
            """,
            "UPDATE product SET sales = 0",
            """
            DO $$ 
            BEGIN
                IF NOT EXISTS (
                    SELECT 1 FROM product
                ) THEN
                    INSERT INTO product (name, description, price, image_url, category, tags, stock, sales, created_at, updated_at)
                    VALUES
                    ('Luxury Synthetic Wig', 'Premium quality synthetic wig with natural look', 149.99, 'https://via.placeholder.com/800x600?text=Luxury+Wig', 'wigs', 'featured, premium', 15, 0, CURRENT_TIMESTAMP, CURRENT_TIMESTAMP),
                    ('Basic Synthetic Wig', 'Affordable synthetic wig for everyday wear', 79.99, 'https://via.placeholder.com/800x600?text=Basic+Wig', 'wigs', 'featured, basic', 20, 0, CURRENT_TIMESTAMP, CURRENT_TIMESTAMP);
                END IF;
            END $$;
            """
        ]

        # Execute each command
        for cmd in commands:
            cursor.execute(cmd)
            conn.commit()
            print(f"Executed command: {cmd}")

        print("Schema update completed successfully!")

    except Exception as e:
        print(f"Error updating schema: {str(e)}")
        raise
    finally:
        if 'cursor' in locals():
            cursor.close()
        if 'conn' in locals():
            conn.close()

if __name__ == '__main__':
    update_schema()
