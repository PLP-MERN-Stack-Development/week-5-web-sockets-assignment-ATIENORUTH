# Deployment Instructions

## Render Deployment

1. **Push your code to GitHub**
2. **Go to Render.com** and create a new Web Service
3. **Connect your GitHub repository**
4. **Configure the service:**
   - **Name:** socket-io-chat
   - **Environment:** Node
   - **Build Command:** `npm run build`
   - **Start Command:** `npm start`
   - **Root Directory:** Leave empty (or `/`)

5. **Add Environment Variables:**
   - `NODE_ENV` = `production`
   - `CLIENT_URL` = `https://your-app-name.onrender.com` (replace with your actual URL)

6. **Deploy!**

## Railway Deployment

1. **Push your code to GitHub**
2. **Go to Railway.app** and create a new project
3. **Connect your GitHub repository**
4. **Railway will automatically detect the configuration from `railway.json`**
5. **Add Environment Variables in Railway dashboard:**
   - `NODE_ENV` = `production`
   - `CLIENT_URL` = `https://your-app-name.railway.app` (replace with your actual URL)

6. **Deploy!**

## Local Development

```bash
# Install all dependencies
npm run install-all

# Start both server and client
npm run dev

# Or start them separately
npm run server  # Starts server on port 5000
npm run client  # Starts client on port 5173
```

## Important Notes

- The server now serves the built React app from `/client/dist`
- WebSocket connections will work automatically on the same domain
- Make sure to update the `CLIENT_URL` environment variable with your actual deployment URL
- The app will be available at your deployment URL (no separate client URL needed) 