from app import app, db, User
from werkzeug.security import generate_password_hash
import os

# Initialize the app context
with app.app_context():
    # Get admin credentials from environment variables
    admin_email = os.getenv('ADMIN_EMAIL', 'admin@luxehair.com')
    admin_password = os.getenv('ADMIN_PASSWORD', None)
    
    if not admin_password:
        print("Error: ADMIN_PASSWORD environment variable is required")
        exit(1)
    
    admin_name = os.getenv('ADMIN_NAME', 'Admin User')
    
    # Check if admin user already exists
    existing_user = User.query.filter_by(email=admin_email).first()
    if existing_user:
        print("Admin user already exists. Updating to admin status...")
        existing_user.is_admin = True
        existing_user.password = generate_password_hash(admin_password)
        db.session.commit()
        print("Admin user updated successfully!")
    else:
        # Create new admin user
        admin_user = User(
            email=admin_email,
            password=generate_password_hash(admin_password),
            name=admin_name,
            is_admin=True
        )
        db.session.add(admin_user)
        db.session.commit()
        print("Admin user created successfully!")

print("\nAdmin credentials:")
print(f"Email: {admin_email}")
print("Password: (hidden for security) - set via ADMIN_PASSWORD env var")
