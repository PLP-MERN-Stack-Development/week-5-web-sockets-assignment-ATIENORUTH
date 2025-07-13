import React, { useState, useEffect, useRef } from 'react';
import { useSocket } from './socket/socket.js';
import './App.css';

function App() {
  const [username, setUsername] = useState('');
  const [message, setMessage] = useState('');
  const [isJoined, setIsJoined] = useState(false);
  const [isTyping, setIsTyping] = useState(false);
  const messagesEndRef = useRef(null);
  
  const {
    socket,
    isConnected,
    messages,
    users,
    typingUsers,
    connect,
    disconnect,
    sendMessage,
    setTyping
  } = useSocket();

  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: "smooth" });
  };

  useEffect(() => {
    scrollToBottom();
  }, [messages]);

  const handleJoin = (e) => {
    e.preventDefault();
    if (username.trim()) {
      connect(username);
      setIsJoined(true);
    }
  };

  const handleSendMessage = (e) => {
    e.preventDefault();
    if (message.trim()) {
      sendMessage(message);
      setMessage('');
      setIsTyping(false);
      setTyping(false);
    }
  };

  const handleTyping = (e) => {
    setMessage(e.target.value);
    if (!isTyping && e.target.value.length > 0) {
      setIsTyping(true);
      setTyping(true);
    } else if (isTyping && e.target.value.length === 0) {
      setIsTyping(false);
      setTyping(false);
    }
  };

  const handleKeyPress = (e) => {
    if (e.key === "Enter" && !e.shiftKey) {
      e.preventDefault();
      handleSendMessage(e);
    }
  };

  const handleLeave = () => {
    disconnect();
    setIsJoined(false);
    setUsername('');
    setMessage('');
  };

  const formatTime = (timestamp) => {
    return new Date(timestamp).toLocaleTimeString([], { 
      hour: '2-digit', 
      minute: '2-digit' 
    });
  };

  if (!isJoined) {
    return (
      <div className="join-container">
        <div className="join-card">
          <h1>Socket.IO Chat</h1>
          <p>Join the real-time chat room</p>
          <form onSubmit={handleJoin}>
            <input
              type="text"
              placeholder="Enter your username"
              value={username}
              onChange={(e) => setUsername(e.target.value)}
              required
            />
            <button type="submit">Join Chat</button>
          </form>
        </div>
      </div>
    );
  }

  return (
    <div className="chat-container">
      <div className="chat-header">
        <h2>Socket.IO Chat</h2>
        <div className="connection-status">
          <span className={`status-dot ${isConnected ? 'connected' : 'disconnected'}`}></span>
          {isConnected ? 'Connected' : 'Disconnected'}
        </div>
        <button onClick={handleLeave} className="leave-btn">Leave Chat</button>
      </div>

      <div className="chat-content">
        <div className="users-sidebar">
          <h3>Online Users ({users.length})</h3>
          <div className="users-list">
            {users.map((user) => (
              <div key={user.id} className={`user-item ${user.username === username ? 'current-user' : ''}`}>
                <span className="user-dot"></span>
                {user.username}
              </div>
            ))}
          </div>
        </div>

        <div className="chat-main">
          <div className="messages-container">
            {messages.map((msg) => (
              <div key={msg.id} className={`message ${msg.system ? 'system' : ''} ${msg.sender === username ? 'own-message' : ''}`}>
                {msg.system ? (
                  <div className="system-message">{msg.text}</div>
                ) : (
                  <>
                    <div className="message-header">
                      <span className="message-sender">{msg.sender}</span>
                      <span className="message-time">{formatTime(msg.timestamp)}</span>
                    </div>
                    <div className="message-content">{msg.text}</div>
                  </>
                )}
              </div>
            ))}
            <div ref={messagesEndRef} />
          </div>

          {typingUsers.length > 0 && (
            <div className="typing-indicator">
              {typingUsers.join(', ')} {typingUsers.length === 1 ? 'is' : 'are'} typing...
            </div>
          )}

          <form onSubmit={handleSendMessage} className="message-form">
            <input
              type="text"
              placeholder="Type a message..."
              value={message}
              onChange={handleTyping}
              onKeyPress={handleKeyPress}
              disabled={!isConnected}
            />
            <button type="submit" disabled={!isConnected || !message.trim()}>
              Send
            </button>
          </form>
        </div>
      </div>
    </div>
  );
}

export default App; 