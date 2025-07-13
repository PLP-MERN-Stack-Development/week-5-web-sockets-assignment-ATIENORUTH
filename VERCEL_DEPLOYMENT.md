# Vercel Frontend Deployment Guide

## Prerequisites
- Vercel account (sign up at https://vercel.com)
- Your project connected to a Git repository

## Deployment Steps

### 1. Connect to Vercel
1. Go to https://vercel.com
2. Sign in with your GitHub account
3. Click "New Project"
4. Import your GitHub repository

### 2. Configure Project Settings
When importing, Vercel will auto-detect it's a Vite project. Configure:
- **Framework Preset**: Vite
- **Root Directory**: `client`
- **Build Command**: `npm run build`
- **Output Directory**: `dist`
- **Install Command**: `npm install`

### 3. Environment Variables (Optional)
If your app needs environment variables, add them in Vercel dashboard:
- Go to Project Settings → Environment Variables
- Add any variables your frontend needs

### 4. Deploy
Click "Deploy" and Vercel will:
- Install dependencies
- Build your React app
- Deploy to a Vercel URL

### 5. Update Backend Connection
After deployment, update your socket connection URL in the client code to point to your Railway backend URL.

## Important Notes
- Vercel will automatically handle routing for your React app
- The `vercel.json` file ensures proper SPA routing
- Your app will be available at a `.vercel.app` domain
- You can add a custom domain later if needed

## Testing
- Visit your Vercel URL to see your React app
- Test the socket connection to your Railway backend 