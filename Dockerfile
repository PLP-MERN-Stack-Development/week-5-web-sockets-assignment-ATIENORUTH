# Use Node.js 18 as base image
FROM node:18-alpine

# Set working directory
WORKDIR /app

# Copy package files
COPY package*.json ./
COPY server/package*.json ./server/

# Install dependencies
RUN npm install
RUN cd server && npm install

# Copy source code
COPY . .

# Expose port
EXPOSE 8080

# Start the server
CMD ["npm", "start"] 