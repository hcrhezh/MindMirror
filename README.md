# MindMirror

A comprehensive AI-powered mental health companion app providing personalized emotional support, mood tracking, and multilingual assistance.

## Key Features

- AI-powered mood detection and analysis
- Thought clarification for anxiety management
- Relationship dynamics analysis
- Daily affirmations and self-care tips
- Social media content analysis
- Multilingual support (English, Sinhala, Tamil, Hindi, Spanish, Arabic)
- Rich analytics with mood trends and emotion distribution

## Deployment to Railway

Follow these steps to deploy MindMirror to Railway:

1. **Fork or Clone the Repository**
   - Make sure you have a copy of the repository in your GitHub account

2. **Sign up for Railway**
   - Go to [Railway.app](https://railway.app/) and sign up/login with GitHub
   - Click "New Project" → "Deploy from GitHub"
   - Connect your GitHub account and select this repository

3. **Add a PostgreSQL Database**
   - In your project dashboard, click "New" → "Database" → "PostgreSQL"
   - This will provision a PostgreSQL database for your application

4. **Set Environment Variables**
   - Go to the "Variables" tab in your Railway project
   - Add the following variables:
     - `NODE_ENV`: `production`
     - `GEMINI_API_KEY`: Your Google Gemini API key (get it from https://ai.google.dev/)
     - `PORT`: Leave this blank as Railway will provide it automatically
   - Railway will automatically provide the following database variables:
     - `DATABASE_URL`: Full PostgreSQL connection string
     - `PGHOST`, `PGUSER`, `PGPASSWORD`, `PGDATABASE`, `PGPORT`: Individual database connection details

5. **Deploy**
   - Railway will automatically build and deploy your application
   - Monitor the process in the "Deployments" tab
   - Once complete, navigate to the provided domain URL to access your app

6. **Run Database Migrations**
   - After the initial deployment, go to the "Settings" tab of your web service
   - Add a one-time command to run migrations: `npm run db:push`
   - This will create all the necessary database tables

## Local Development

1. Clone the repository
2. Install dependencies:
   ```
   npm install
   ```
3. Create a `.env` file with your API keys:
   ```
   GEMINI_API_KEY=your_api_key_here
   ```
4. Start the development server:
   ```
   npm run dev
   ```

## Technologies Used

- React
- Tailwind CSS with Shadcn UI components
- Express.js
- Google Gemini AI API
- PostgreSQL with Drizzle ORM
- Railway for hosting and database