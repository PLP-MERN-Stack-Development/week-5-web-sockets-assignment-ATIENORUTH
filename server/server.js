const express = require('express');
const http = require('http');
const cors = require('cors');
const { Server } = require('socket.io');

const app = express();
const server = http.createServer(app);

const allowedOrigins = [
  'http://localhost:5173',
  'https://week-5-web-sockets-assignment-atienoruth-l5vf0gaa9.vercel.app'
];

app.use(cors({
  origin: function(origin, callback) {
    if (!origin || allowedOrigins.includes(origin)) {
      callback(null, true);
    } else {
      callback(new Error('Not allowed by CORS'));
    }
  },
  credentials: true
}));

const io = new Server(server, {
  cors: {
    origin: allowedOrigins,
    methods: ['GET', 'POST'],
    credentials: true
  }
});

// Store connected users and messages
const users = {};
const messages = [];
const typingUsers = {};

io.on('connection', (socket) => {
  console.log('User connected:', socket.id);

  // Handle user joining
  socket.on('user_join', (username) => {
    users[socket.id] = { 
      username, 
      id: socket.id, 
      joinedAt: new Date().toISOString(),
      isOnline: true 
    };
    
    // Send updated user list to all clients
    io.emit('user_list', Object.values(users));
    io.emit('user_joined', { username, id: socket.id });
    
    // Send existing messages to new user
    socket.emit('message_history', messages);
    
    console.log(`${username} joined the chat`);
  });

  // Handle chat messages
  socket.on('send_message', (messageData) => {
    const message = {
      id: Date.now(),
      text: messageData.text,
      sender: users[socket.id]?.username || 'Anonymous',
      senderId: socket.id,
      timestamp: new Date().toISOString(),
      type: 'message'
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
      
      socket.broadcast.emit('typing_users', Object.values(typingUsers));
    }
  });

  // Handle private messages
  socket.on('private_message', ({ to, message }) => {
    const messageData = {
      id: Date.now(),
      text: message,
      sender: users[socket.id]?.username || 'Anonymous',
      senderId: socket.id,
      recipientId: to,
      timestamp: new Date().toISOString(),
      type: 'private'
    };
    
    // Send to recipient
    socket.to(to).emit('private_message', messageData);
    // Send back to sender
    socket.emit('private_message', messageData);
  });

  // Handle user status updates
  socket.on('status_update', (status) => {
    if (users[socket.id]) {
      users[socket.id].status = status;
      io.emit('user_list', Object.values(users));
    }
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

// API routes for getting data
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
    onlineUsers: Object.keys(users).length,
    totalMessages: messages.length
  });
});

server.listen(10000, () => {
  console.log('Server running on port 10000');
}); 