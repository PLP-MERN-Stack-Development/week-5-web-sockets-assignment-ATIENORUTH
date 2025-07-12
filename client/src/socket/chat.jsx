// client/src/pages/Chat.jsx
import React, { useEffect, useState } from "react";
import { useSocket } from "../socket/socket";

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

  useEffect(() => {
    const name = prompt("Enter your username:");
    setUsername(name);
    connect(name);

    return () => {
      disconnect(); // Clean up on page unload
    };
  }, []);

  const handleInputChange = (e) => {
    setMessage(e.target.value);
    setTyping(true);
  };

  const handleSend = () => {
    if (message.trim()) {
      sendMessage(message);
      setMessage("");
      setTyping(false);
    }
  };

  return (
    <div style={{ padding: "1rem" }}>
      <h2>Welcome, {username}</h2>
      <p>Status: {isConnected ? "🟢 Connected" : "🔴 Disconnected"}</p>

      <div>
        <h4>Online Users:</h4>
        <ul>
          {users.map((user, i) => (
            <li key={i}>{user.username}</li>
          ))}
        </ul>
      </div>

      <div style={{ border: "1px solid #ccc", height: 300, overflowY: "scroll", padding: 10 }}>
        {messages.map((msg, index) => (
          <div key={index}>
            {msg.system ? (
              <p style={{ fontStyle: "italic", color: "gray" }}>{msg.message}</p>
            ) : (
              <p>
                <strong>{msg.username}</strong>: {msg.message}
              </p>
            )}
          </div>
        ))}
        {typingUsers.length > 0 && (
          <p style={{ fontStyle: "italic", color: "gray" }}>
            {typingUsers.map((u) => u.username).join(", ")} typing...
          </p>
        )}
      </div>

      <div style={{ marginTop: 10 }}>
        <input
          type="text"
          value={message}
          onChange={handleInputChange}
          placeholder="Type a message"
          style={{ width: "70%" }}
        />
        <button onClick={handleSend}>Send</button>
      </div>
    </div>
  );
};

export default Chat;
