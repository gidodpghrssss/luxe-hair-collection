from app import app, db
from migrations.add_sales_column import upgrade

def main():
    print("Starting database migration...")
    
    # Initialize the app context
    with app.app_context():
        # Run the migration
        upgrade()
        print("Migration completed successfully!")

if __name__ == '__main__':
    main()
