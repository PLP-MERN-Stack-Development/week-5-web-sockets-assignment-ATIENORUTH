# This Dockerfile is intentionally minimal
# Railway should use Nixpacks instead of Docker
FROM node:18-alpine
WORKDIR /app
COPY . .
RUN npm install
EXPOSE 5000
CMD ["npm", "start"] 