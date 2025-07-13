// client/src/pages/Chat.jsx
import React, { useEffect, useState, useRef } from "react";
import { useSocket } from "./socket";

const Chat = () => {
  const {
    connect,
    disconnect,
    isConnected,
    messages,
    users,
    typingUsers,
    sendMessage,
    setTyping,
  } = useSocket();

  const [username, setUsername] = useState("");
  const [message, setMessage] = useState("");
  const [isTyping, setIsTyping] = useState(false);
  const messagesEndRef = useRef(null);

  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: "smooth" });
  };

  useEffect(() => {
    const name = prompt("Enter your username:") || "Anonymous";
    setUsername(name);
    connect(name);

    return () => {
      disconnect();
    };
  }, []);

  useEffect(() => {
    scrollToBottom();
  }, [messages]);

  const handleInputChange = (e) => {
    setMessage(e.target.value);
    if (!isTyping) {
      setIsTyping(true);
      setTyping(true);
    }
  };

  const handleSend = () => {
    if (message.trim()) {
      sendMessage(message);
      setMessage("");
      setIsTyping(false);
      setTyping(false);
    }
  };

  const handleKeyPress = (e) => {
    if (e.key === "Enter" && !e.shiftKey) {
      e.preventDefault();
      handleSend();
    }
  };

  const formatTime = (timestamp) => {
    return new Date(timestamp).toLocaleTimeString([], { 
      hour: '2-digit', 
      minute: '2-digit' 
    });
  };

  return (
    <div style={{ 
      maxWidth: "800px", 
      margin: "0 auto", 
      padding: "20px",
      fontFamily: "Arial, sans-serif"
    }}>
      <div style={{ 
        backgroundColor: "#f8f9fa", 
        padding: "20px", 
        borderRadius: "10px",
        marginBottom: "20px"
      }}>
        <h2 style={{ margin: "0 0 10px 0", color: "#333" }}>
          Welcome, {username}!
        </h2>
        <p style={{ margin: "0", color: isConnected ? "#28a745" : "#dc3545" }}>
          Status: {isConnected ? "🟢 Connected" : "🔴 Disconnected"}
        </p>
      </div>

      <div style={{ display: "flex", gap: "20px" }}>
        {/* Online Users */}
        <div style={{ 
          width: "200px", 
          backgroundColor: "#f8f9fa", 
          padding: "15px",
          borderRadius: "8px",
          height: "fit-content"
        }}>
          <h4 style={{ margin: "0 0 10px 0", color: "#333" }}>
            Online Users ({users.length})
          </h4>
          <ul style={{ listStyle: "none", padding: 0, margin: 0 }}>
            {users.map((user) => (
              <li key={user.id} style={{ 
                padding: "5px 0", 
                color: user.username === username ? "#007bff" : "#333",
                fontWeight: user.username === username ? "bold" : "normal"
              }}>
                🟢 {user.username}
              </li>
            ))}
          </ul>
        </div>

        {/* Chat Messages */}
        <div style={{ flex: 1 }}>
          <div style={{ 
            border: "1px solid #ddd", 
            height: "400px", 
            overflowY: "scroll", 
            padding: "15px",
            borderRadius: "8px",
            backgroundColor: "white"
          }}>
            {messages.map((msg, index) => (
              <div key={msg.id || index} style={{ marginBottom: "10px" }}>
                {msg.system ? (
                  <p style={{ 
                    fontStyle: "italic", 
                    color: "#6c757d", 
                    textAlign: "center",
                    margin: "5px 0"
                  }}>
                    {msg.text}
                  </p>
                ) : (
                  <div style={{ 
                    backgroundColor: msg.sender === username ? "#007bff" : "#e9ecef",
                    color: msg.sender === username ? "white" : "#333",
                    padding: "8px 12px",
                    borderRadius: "15px",
                    maxWidth: "70%",
                    marginLeft: msg.sender === username ? "auto" : "0",
                    marginRight: msg.sender === username ? "0" : "auto"
                  }}>
                    <div style={{ fontSize: "12px", marginBottom: "2px" }}>
                      {msg.sender} • {formatTime(msg.timestamp)}
                    </div>
                    <div>{msg.text}</div>
                  </div>
                )}
              </div>
            ))}
            {typingUsers.length > 0 && (
              <p style={{ 
                fontStyle: "italic", 
                color: "#6c757d",
                margin: "5px 0"
              }}>
                {typingUsers.join(", ")} typing...
              </p>
            )}
            <div ref={messagesEndRef} />
          </div>

          {/* Message Input */}
          <div style={{ 
            marginTop: "15px", 
            display: "flex", 
            gap: "10px"
          }}>
            <input
              type="text"
              value={message}
              onChange={handleInputChange}
              onKeyPress={handleKeyPress}
              placeholder="Type a message..."
              style={{ 
                flex: 1,
                padding: "10px",
                border: "1px solid #ddd",
                borderRadius: "5px",
                fontSize: "14px"
              }}
            />
            <button 
              onClick={handleSend}
              disabled={!message.trim()}
              style={{
                padding: "10px 20px",
                backgroundColor: message.trim() ? "#007bff" : "#6c757d",
                color: "white",
                border: "none",
                borderRadius: "5px",
                cursor: message.trim() ? "pointer" : "not-allowed"
              }}
            >
              Send
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};

export default Chat;
