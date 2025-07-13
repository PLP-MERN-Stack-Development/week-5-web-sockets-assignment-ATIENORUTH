// server.js - Main server file for Socket.io chat application

const express = require('express');
const http = require('http');
const { Server } = require('socket.io');
const cors = require('cors');
const dotenv = require('dotenv');
const path = require('path');

// Load environment variables
dotenv.config();

// Initialize Express app
const app = express();
const server = http.createServer(app);

// Define allowed origins for CORS - allow all Vercel subdomains
const allowedOrigins = [
  'https://week-5-web-sockets-assignment-atienoruth-lsni2e6ex.vercel.app',
  'https://week-5-web-sockets-assignment-atienoruth-7q6l39glm.vercel.app',
  'https://week-5-web-sockets-assignment-atienoruth-kahyjs6dq.vercel.app',
  'https://week-5-web-sockets-assignm-git-d2d89a-joy-ruth-atienos-projects.vercel.app',
  'https://week-5-web-sockets-assignment-atienor-joy-ruth-atienos-projects.vercel.app',
  /^https:\/\/week-5-web-sockets-assignment-atienoruth-.*\.vercel\.app$/,
  /^https:\/\/week-5-web-sockets-assignm-git-.*\.vercel\.app$/,
  /^https:\/\/week-5-web-sockets-assignment-atienor-.*\.vercel\.app$/,
  'http://localhost:5173'
];

// CORS configuration for Express
app.use(cors({
  origin: function (origin, callback) {
    // Allow requests with no origin (like mobile apps or curl requests)
    if (!origin) return callback(null, true);
    
    // Check if origin is in allowedOrigins array
    for (let allowedOrigin of allowedOrigins) {
      if (typeof allowedOrigin === 'string' && allowedOrigin === origin) {
        return callback(null, true);
      }
      if (allowedOrigin instanceof RegExp && allowedOrigin.test(origin)) {
        return callback(null, true);
      }
    }
    
    console.log('CORS blocked origin:', origin);
    return callback(new Error('Not allowed by CORS'));
  },
  methods: ['GET', 'POST', 'OPTIONS'],
  credentials: true,
  allowedHeaders: ['Content-Type', 'Authorization']
}));

// Socket.IO server with improved CORS
const io = new Server(server, {
  cors: {
    origin: function (origin, callback) {
      // Allow requests with no origin (like mobile apps or curl requests)
      if (!origin) return callback(null, true);
      
      // Check if origin is in allowedOrigins array
      for (let allowedOrigin of allowedOrigins) {
        if (typeof allowedOrigin === 'string' && allowedOrigin === origin) {
          return callback(null, true);
        }
        if (allowedOrigin instanceof RegExp && allowedOrigin.test(origin)) {
          return callback(null, true);
        }
      }
      
      console.log('Socket.IO CORS blocked origin:', origin);
      return callback(new Error('Not allowed by CORS'));
    },
    methods: ['GET', 'POST', 'OPTIONS'],
    credentials: true,
    allowedHeaders: ['Content-Type', 'Authorization']
  },
  transports: ['websocket', 'polling'],
  allowEIO3: true
});

// Middleware
app.use(express.json());

// Store connected users and messages
const users = {};
const messages = [];
const typingUsers = {};

// Socket.io connection handler
io.on('connection', (socket) => {
  console.log(`User connected: ${socket.id}`);

  // Handle user joining
  socket.on('user_join', (username) => {
    users[socket.id] = { username, id: socket.id };
    io.emit('user_list', Object.values(users));
    io.emit('user_joined', { username, id: socket.id });
    console.log(`${username} joined the chat`);
  });

  // Handle chat messages
  socket.on('send_message', (messageData) => {
    const message = {
      ...messageData,
      id: Date.now(),
      sender: users[socket.id]?.username || 'Anonymous',
      senderId: socket.id,
      timestamp: new Date().toISOString(),
    };
    
    messages.push(message);
    
    // Limit stored messages to prevent memory issues
    if (messages.length > 100) {
      messages.shift();
    }
    
    io.emit('receive_message', message);
  });

  // Handle typing indicator
  socket.on('typing', (isTyping) => {
    if (users[socket.id]) {
      const username = users[socket.id].username;
      
      if (isTyping) {
        typingUsers[socket.id] = username;
      } else {
        delete typingUsers[socket.id];
      }
      
      io.emit('typing_users', Object.values(typingUsers));
    }
  });

  // Handle private messages
  socket.on('private_message', ({ to, message }) => {
    const messageData = {
      id: Date.now(),
      sender: users[socket.id]?.username || 'Anonymous',
      senderId: socket.id,
      message,
      timestamp: new Date().toISOString(),
      isPrivate: true,
    };
    
    socket.to(to).emit('private_message', messageData);
    socket.emit('private_message', messageData);
  });

  // Handle disconnection
  socket.on('disconnect', () => {
    if (users[socket.id]) {
      const { username } = users[socket.id];
      io.emit('user_left', { username, id: socket.id });
      console.log(`${username} left the chat`);
    }
    
    delete users[socket.id];
    delete typingUsers[socket.id];
    
    io.emit('user_list', Object.values(users));
    io.emit('typing_users', Object.values(typingUsers));
  });
});

// API routes
app.get('/api/messages', (req, res) => {
  res.json(messages);
});

app.get('/api/users', (req, res) => {
  res.json(Object.values(users));
});

// Health check endpoint
app.get('/', (req, res) => {
  res.json({ 
    message: 'Socket.io Chat Server is running!',
    timestamp: new Date().toISOString(),
    cors: {
      allowedOrigins: allowedOrigins
    }
  });
});

// Socket.IO endpoint for testing
app.get('/socket.io/', (req, res) => {
  res.json({ message: 'Socket.IO endpoint is accessible' });
});

// Start server
const PORT = process.env.PORT || 5000;
server.listen(PORT, () => {
  console.log(`Server running on port ${PORT}`);
});

module.exports = { app, server, io }; 