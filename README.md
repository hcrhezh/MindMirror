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

## Deployment to Netlify

Follow these steps to deploy MindMirror to Netlify:

1. **Fork or Clone the Repository**
   - Make sure you have a copy of the repository in your GitHub account

2. **Sign up for Netlify**
   - Go to [Netlify](https://www.netlify.com/) and sign up/login
   - Click "New site from Git"
   - Connect your GitHub account and select this repository

3. **Configure Build Settings**
   - Build command: `npm run build`
   - Publish directory: `dist`

4. **Set Environment Variables**
   - In Netlify dashboard, go to Site settings → Environment variables
   - Add the following variables:
     - `GEMINI_API_KEY`: Your Google Gemini API key
     - `NODE_ENV`: `production`

5. **Deploy**
   - Click "Deploy site"
   - Wait for the build to complete
   - Your site will be available at a Netlify subdomain

## Database Integration

For full functionality including user accounts and data persistence:

1. Create a PostgreSQL database using a service like Neon, Supabase, or Railway
2. Add the `DATABASE_URL` environment variable to your Netlify deployment
3. The application will automatically connect to your database

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
- Netlify Serverless Functions