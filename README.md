# Lead Management System - Backend

Backend API for the Lead Management System built with Node.js, Express, and MongoDB.

## Prerequisites

- Node.js (v14 or higher)
- MongoDB Atlas account or local MongoDB instance
- npm or yarn

## Environment Variables

Create a `.env` file in the root directory and add the following:

```env
MONGO_URI=your_mongodb_connection_string
JWT_SECRET=your_jwt_secret
PORT=5000
CLIENT_URL=your_frontend_url
```

## Installation

1. Clone the repository
2. Install dependencies:
   ```bash
   npm install
   ```
3. Set up environment variables (see above)
4. Start the development server:
   ```bash
   npm run dev
   ```

## Deployment on Render

1. Push your code to a GitHub repository
2. Go to [Render Dashboard](https://dashboard.render.com/)
3. Click "New" and select "Web Service"
4. Connect your GitHub repository
5. Configure the service:
   - Name: erino-backend
   - Region: Choose the closest to your users
   - Branch: main (or your main branch)
   - Build Command: `npm install`
   - Start Command: `node server.js`
6. Add environment variables:
   - `MONGO_URI`: Your MongoDB Atlas connection string
   - `JWT_SECRET`: A secure secret key for JWT
   - `NODE_ENV`: production
   - `CLIENT_URL`: Your frontend URL
7. Click "Create Web Service"

## API Endpoints

- `POST /api/auth/register` - Register a new user
- `POST /api/auth/login` - Login user
- `GET /api/auth/me` - Get current user
- `POST /api/leads` - Create a new lead
- `GET /api/leads` - Get all leads (with pagination)
- `GET /api/leads/:id` - Get a single lead
- `PUT /api/leads/:id` - Update a lead
- `DELETE /api/leads/:id` - Delete a lead

## Seed Database

To populate the database with sample data:

```bash
npm run seed
```

## License

MIT
