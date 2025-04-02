# Luxe Hair Collection

A modern e-commerce platform for premium synthetic hair products featuring AI-powered features including virtual try-on, customer support chatbot, and business analytics assistant.

## Features

- **Virtual Try-On**: Upload your photo and see how different hairstyles look on you before purchasing
- **AI Customer Support**: Get immediate answers to your questions via our intelligent chatbot
- **Admin AI Assistant**: Business intelligence and inventory management assistance for store administrators
- **Product Catalog**: Browse through our premium synthetic hair collection with filtering options
- **User Accounts**: Create an account, save your favorites, and track your order history
- **Responsive Design**: Seamless experience across mobile, tablet, and desktop devices

## Technologies Used

### Backend
- **Flask**: Web framework for the application
- **SQLAlchemy**: ORM for database operations
- **PostgreSQL**: Relational database for storing product, user, and order data
- **LlamaIndex + Nebius AI**: For AI-powered features (chatbot, virtual try-on, business intelligence)

### Frontend
- **Bootstrap 5**: For responsive layout and components
- **JavaScript**: For interactive functionality
- **HTML5/CSS3**: For structure and styling

## Deployment

The application is configured for deployment on Render.com with the following components:

1. **Web Service**: Runs the Flask application
2. **PostgreSQL Database**: Stores all application data

### Environment Variables

The following environment variables need to be set in Render:

- `SECRET_KEY`: For Flask session security
- `DATABASE_URL`: PostgreSQL connection string (provided by Render)
- `NEBIUS_API_KEY`: API key for Nebius AI services
- `NEBIUS_API_URL`: URL for Nebius API (default: https://api.nebius.ai/v1)
- `NEBIUS_CHAT_MODEL`: Model to use for chat-based AI features
- `NEBIUS_EMBEDDINGS_MODEL`: Model to use for embeddings
- `NEBIUS_IMAGE_MODEL`: Model to use for image processing in virtual try-on
- `SHOPIFY_API_KEY`: API key for Shopify integration (if used)
- `SHOPIFY_API_SECRET`: API secret for Shopify integration (if used)
- `SHOPIFY_SHOP_URL`: Shop URL for Shopify integration (if used)

## Local Development

1. Clone the repository
2. Create a virtual environment: `python -m venv venv`
3. Activate the virtual environment:
   - Windows: `venv\Scripts\activate`
   - macOS/Linux: `source venv/bin/activate`
4. Install dependencies: `pip install -r requirements.txt`
5. Set up environment variables in a `.env` file
6. Run the application: `python app.py`

## License

Copyright © 2025 Luxe Hair Collection. All rights reserved.
