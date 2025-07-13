# Railway Backend Deployment Guide

## Prerequisites
- Railway account (sign up at https://railway.app)
- Your project connected to a Git repository

## Deployment Steps

### 1. Connect to Railway
1. Go to https://railway.app
2. Sign in with your GitHub account
3. Click "New Project" → "Deploy from GitHub repo"
4. Select your repository

### 2. Configure Environment Variables
In Railway dashboard, go to your project → Variables tab and add:

```
CLIENT_URL=https://your-netlify-app.netlify.app
```

Replace `your-netlify-app` with your actual Netlify domain.

### 3. Deploy
Railway will automatically:
- Install dependencies in the `server/` directory
- Start the server using `npm start`
- Provide you with a Railway URL

### 4. Update Client Configuration
After deployment, update your client's socket connection URL to point to your Railway backend URL.

## Important Notes
- The server is configured to run on the port provided by Railway (`process.env.PORT`)
- CORS is configured to allow your Netlify frontend
- The server provides WebSocket functionality for real-time chat

## Testing
- Visit your Railway URL to see the health check message
- Your Netlify frontend should connect to the Railway backend for real-time chat functionality 