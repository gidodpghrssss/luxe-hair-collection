import os
import sys
from pathlib import Path

# Add the project root to Python path
project_root = Path(__file__).parent.parent
sys.path.append(str(project_root))

from migrations.add_sales_column import upgrade
from app import app, db

def main():
    print("Starting database migration...")
    
    # Initialize the app context
    with app.app_context():
        # Run the migration
        upgrade()
        print("Migration completed successfully!")

if __name__ == '__main__':
    main()
