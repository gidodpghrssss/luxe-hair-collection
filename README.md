# Luxe Hair Collection

A Python Flask web application for a luxury synthetic hair extensions brand.

## Features

- User authentication (login/register)
- Product catalog with filtering
- Product detail pages
- User profiles with chat history
- Admin dashboard for product and user management
- AI-powered chatbot for customer support
- Responsive design for all devices

## Technology Stack

- **Backend**: Python Flask
- **Database**: PostgreSQL
- **ORM**: SQLAlchemy
- **Authentication**: Flask-Login
- **Frontend**: HTML, CSS, JavaScript, Bootstrap 5
- **AI Integration**: Nebius API for chatbot functionality

## Installation

1. Clone the repository:
```
git clone https://github.com/gidodpghrssss/luxe-hair-collection.git
cd luxe-hair-collection
```

2. Create a virtual environment and activate it:
```
python -m venv venv
source venv/bin/activate  # On Windows: venv\Scripts\activate
```

3. Install dependencies:
```
pip install -r requirements.txt
```

4. Set up environment variables:
Create a `.env` file in the root directory with the following variables:
```
DATABASE_URL=postgresql://username:password@localhost:5432/luxedb
SECRET_KEY=your_secret_key_here
NEBIUS_API_KEY=your_nebius_api_key
NEBIUS_API_URL=https://api.nebius.ai/v1/chat/completions
```

5. Initialize the database:
```
flask run
```
The database tables will be created automatically on first run.

## Deployment on Render

This application is configured for deployment on Render with a PostgreSQL database.

1. Create a new Web Service on Render
2. Connect your GitHub repository
3. Set the following:
   - Build Command: `pip install -r requirements.txt`
   - Start Command: `gunicorn app:app`
4. Add the environment variables in the Render dashboard
5. Create a PostgreSQL database in Render and link it to your web service

## Project Structure

- `app.py`: Main application file with routes and database models
- `templates/`: HTML templates
- `static/`: CSS, JavaScript, and image files
- `requirements.txt`: Python dependencies

## License

This project is licensed under the MIT License - see the LICENSE file for details.
