// socket.js - Socket.io client setup

import { io } from 'socket.io-client';
import { useEffect, useState } from 'react';

// Socket.io connection URL - hardcoded to Railway backend
const SOCKET_URL = 'https://focused-enchantment-production-35c9.up.railway.app';


// Debug: Log the socket URL being used
console.log('Socket.IO connecting to:', SOCKET_URL);
console.log('Environment variable VITE_SOCKET_URL:', import.meta.env.VITE_SOCKET_URL);

// Create socket instance
// Force WebSocket-only transport for production
export const socket = io(SOCKET_URL, {
  autoConnect: false,
  reconnection: true,
  reconnectionAttempts: 10,
  reconnectionDelay: 1000,
  reconnectionDelayMax: 5000,
  timeout: 20000,
  transports: ['websocket'], // Only use WebSocket - no polling
  upgrade: false, // Disable upgrade to prevent polling fallback
  rememberUpgrade: false,
  forceNew: true,
  rejectUnauthorized: false
});

// Debug connection events
socket.on('connect_error', (error) => {
  console.log('Connection error:', error);
  if (error.message.includes('polling')) {
    console.log('Polling transport blocked - forcing WebSocket only');
  }
});

socket.on('connect', () => {
  console.log('✅ Socket.IO connected successfully!');
  console.log('Socket ID:', socket.id);
});

socket.on('disconnect', (reason) => {
  console.log('❌ Socket.IO disconnected:', reason);
});

socket.on('connect_timeout', () => {
  console.log('⏰ Socket.IO connection timeout');
});

// Custom hook for using socket.io
export const useSocket = () => {
  const [isConnected, setIsConnected] = useState(socket.connected);
  const [lastMessage, setLastMessage] = useState(null);
  const [messages, setMessages] = useState([]);
  const [users, setUsers] = useState([]);
  const [typingUsers, setTypingUsers] = useState([]);

  // Connect to socket server
  const connect = (username) => {
    console.log('🔄 Attempting to connect to Socket.IO...');
    socket.connect();
    
    // Wait for connection before joining
    socket.once('connect', () => {
      console.log('✅ Connected, joining as user:', username);
      if (username) {
        socket.emit('user_join', username);
      }
    });
  };

  // Disconnect from socket server
  const disconnect = () => {
    socket.disconnect();
  };

  // Send a message
  const sendMessage = (message) => {
    socket.emit('send_message', { text: message });
  };

  // Send a private message
  const sendPrivateMessage = (to, message) => {
    socket.emit('private_message', { to, message });
  };

  // Set typing status
  const setTyping = (isTyping) => {
    socket.emit('typing', isTyping);
  };

  // Socket event listeners
  useEffect(() => {
    // Connection events
    const onConnect = () => {
      setIsConnected(true);
    };

    const onDisconnect = () => {
      setIsConnected(false);
    };

    // Message events
    const onReceiveMessage = (message) => {
      setLastMessage(message);
      setMessages((prev) => [...prev, message]);
    };

    const onPrivateMessage = (message) => {
      setLastMessage(message);
      setMessages((prev) => [...prev, message]);
    };

    // Message history for new users
    const onMessageHistory = (history) => {
      setMessages(history);
    };

    // User events
    const onUserList = (userList) => {
      setUsers(userList);
    };

    const onUserJoined = (user) => {
      // Add a system message for user joining
      setMessages((prev) => [
        ...prev,
        {
          id: Date.now(),
          system: true,
          text: `${user.username} joined the chat`,
          timestamp: new Date().toISOString(),
        },
      ]);
    };

    const onUserLeft = (user) => {
      // Add a system message for user leaving
      setMessages((prev) => [
        ...prev,
        {
          id: Date.now(),
          system: true,
          text: `${user.username} left the chat`,
          timestamp: new Date().toISOString(),
        },
      ]);
    };

    // Typing events
    const onTypingUsers = (users) => {
      setTypingUsers(users);
    };

    // Register event listeners
    socket.on('connect', onConnect);
    socket.on('disconnect', onDisconnect);
    socket.on('receive_message', onReceiveMessage);
    socket.on('private_message', onPrivateMessage);
    socket.on('message_history', onMessageHistory);
    socket.on('user_list', onUserList);
    socket.on('user_joined', onUserJoined);
    socket.on('user_left', onUserLeft);
    socket.on('typing_users', onTypingUsers);

    // Clean up event listeners
    return () => {
      socket.off('connect', onConnect);
      socket.off('disconnect', onDisconnect);
      socket.off('receive_message', onReceiveMessage);
      socket.off('private_message', onPrivateMessage);
      socket.off('message_history', onMessageHistory);
      socket.off('user_list', onUserList);
      socket.off('user_joined', onUserJoined);
      socket.off('user_left', onUserLeft);
      socket.off('typing_users', onTypingUsers);
    };
  }, []);

  return {
    socket,
    isConnected,
    lastMessage,
    messages,
    users,
    typingUsers,
    connect,
    disconnect,
    sendMessage,
    sendPrivateMessage,
    setTyping,
  };
};

export default socket; 