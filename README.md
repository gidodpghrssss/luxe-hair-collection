# Luxe Hair Collection

A modern e-commerce platform for high-quality hair products including wigs, extensions, and more. This platform features both a customer-facing storefront and an admin dashboard with AI-powered tools.

## Features

### Customer Side
- Responsive design for both desktop and mobile
- Virtual try-on powered by AI
- AI chatbot for FAQs and customer support
- Category and tag-based search
- Seamless integration with Shopify for payments and order management
- Modern, elegant UI focused on beauty and luxury

### Admin Side
- Comprehensive dashboard with sales analytics and visualizations
- AI agent (powered by Nebius) for inventory management, customer insights, and business operations
- User management system
- Product and inventory management
- Offer and promotion management
- Integration with Shopify APIs

## Technology Stack
- Frontend: React.js, Next.js
- Backend: Node.js, Express
- Database: PostgreSQL (via Render)
- ORM: Prisma
- AI: Nebius API for LLM integration
- Deployment: Render
- E-commerce: Shopify API integration
- Styling: Tailwind CSS

## AI Features

### Nebius-Powered Chatbot
The platform includes an intelligent customer service chatbot powered by Nebius AI. This chatbot:
- Provides instant responses to customer inquiries about products, shipping, returns, etc.
- Offers personalized product recommendations based on customer preferences
- Helps customers navigate the site and find the right hair products
- Collects valuable customer feedback and insights
- Utilizes Meta's Llama 3.1 70B Instruct model for high-quality, contextually relevant responses

### Virtual Try-On
The virtual try-on feature allows customers to:
- Upload their photo or use their webcam
- Visualize how different hair products would look on them
- Experiment with various styles, colors, and lengths
- Share their virtual looks on social media

### Admin AI Assistant
The admin dashboard includes a Nebius-powered AI assistant that:
- Analyzes sales data to identify trends and opportunities
- Provides inventory management recommendations
- Helps create targeted marketing campaigns
- Generates reports and insights for business decision-making
- Uses a lower temperature setting (0.3) for more focused and precise business analytics

## Getting Started

### Prerequisites
- Node.js (v18 or higher)
- npm or yarn
- PostgreSQL (for local development)
- Shopify Partner account
- Nebius API key

### Installation
1. Clone the repository
2. Install dependencies with `npm install`
3. Set up environment variables (see `.env.example`)
4. Run the development server with `npm run dev`

## Nebius API Integration
To use the AI features, you'll need to:
1. Sign up for a Nebius account at [nebius.com](https://nebius.com)
2. Create an API key in your Nebius dashboard
3. Add the API key to your `.env` file as `NEXT_PUBLIC_NEBIUS_API_KEY`
4. Add the API URL to your `.env` file as `NEXT_PUBLIC_NEBIUS_API_URL` (default: https://api.studio.nebius.com/v1/)

### Model Configuration
The chatbot is configured to use the Meta Llama 3.1 70B Instruct model through the Nebius API with the following optimized parameters:

- **Customer Chatbot:**
  - Model: `meta-llama/Meta-Llama-3.1-70B-Instruct`
  - Temperature: 0.7 (balanced creativity and accuracy)
  - Max Tokens: 1000 (suitable for detailed product explanations)
  - System Prompt: Customized for hair product customer service

- **Admin AI Assistant:**
  - Model: `meta-llama/Meta-Llama-3.1-70B-Instruct`
  - Temperature: 0.3 (focused on accurate business insights)
  - Max Tokens: 1500 (allows for detailed analytics and recommendations)
  - System Prompt: Optimized for business intelligence and data analysis

### Implementation Details
The chatbot implementation uses the OpenAI-compatible API provided by Nebius, allowing for:
- Seamless integration with the OpenAI JavaScript SDK
- Efficient message handling and streaming
- Error handling with appropriate fallback responses
- Conversation history management
- Responsive UI with typing indicators and message formatting

## Deployment
This application is configured for deployment on Render. See the `render.yaml` file for configuration details.

### Deploying to Render
1. Create a Render account at [render.com](https://render.com)
2. Connect your GitHub repository to Render
3. Render will automatically detect the `render.yaml` file and create the necessary services
4. Set up the following environment variables in the Render dashboard:
   - `NEXT_PUBLIC_NEBIUS_API_KEY`: Your Nebius API key
   - `SHOPIFY_API_KEY`: Your Shopify API key
   - `SHOPIFY_API_SECRET`: Your Shopify API secret
5. Deploy your application

The deployment will automatically:
- Install all dependencies (including TypeScript type definitions)
- Build the application
- Start the server
- Set up health checks for monitoring
- Create and configure a PostgreSQL database

### Database Setup
The application uses PostgreSQL via Render's managed database service:
- A PostgreSQL database is automatically provisioned when you deploy
- The connection string is automatically injected into your application
- Prisma handles database migrations and schema management
- No manual database setup is required

### TypeScript Configuration
When deploying to Render, all TypeScript errors will be addressed during the build process as the necessary type definitions will be installed automatically:
- `@types/react`
- `@types/node`
- `@types/react-dom`

No need to install these packages locally unless you want to resolve TypeScript errors in your development environment.
