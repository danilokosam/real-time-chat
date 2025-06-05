import { useState, useEffect, useRef } from "react";

// ChatFooter component handles message input and sending for public or private chats
export const ChatFooter = ({ socket, selectedUser }) => {
  const [message, setMessage] = useState("");
  const typingTimeoutRef = useRef(null);

  // Handle typing indicator ✍️
  const handleTyping = () => {
    const userName = localStorage.getItem("userName");
    console.log(`${userName} is typing...`);
    const typingData = {
      userName,
      to: selectedUser ? selectedUser.userID : null, // Include recipient ID for private messages
    };
    socket.emit("typing", typingData);

    // Clear existing timeout
    if (typingTimeoutRef.current) {
      clearTimeout(typingTimeoutRef.current);
    }

    // Set timeout to stop typing after 1 second of inactivity
    typingTimeoutRef.current = setTimeout(() => {
      socket.emit("stopTyping", {
        to: selectedUser ? selectedUser.userID : null,
      });
    }, 1000);
  };

  // Handle sending public or private messages
  const handleSendMessage = (e) => {
    e.preventDefault();
    const userName = localStorage.getItem("userName");
    if (message.trim() && userName) {
      if (selectedUser) {
        // Send private message
        console.log(
          `Sending private message to ${selectedUser.username}: ${message}`
        );
        socket.emit("privateMessage", {
          content: message,
          to: selectedUser.userID,
          fromUsername: userName,
        });
      } else {
        // Send public message
        console.log(`Sending public message: ${message} from ${userName}`);
        socket.emit("message", {
          text: message,
          userName,
        });
        socket.emit("stopTyping", { to: null }); // Stop typing status
      }
      setMessage("");
    }
  };

  // Clean timeout on component unmount
  useEffect(() => {
    return () => {
      if (typingTimeoutRef.current) {
        clearTimeout(typingTimeoutRef.current);
      }
    };
  }, []);

  return (
    <div className="chat__footer">
      <form className="form" onSubmit={handleSendMessage}>
        <input
          type="text"
          placeholder={
            selectedUser ? `Message ${selectedUser.username}` : "Write message"
          }
          className="message"
          value={message}
          onChange={(e) => setMessage(e.target.value)}
          onKeyDown={handleTyping}
        />
        <button className="sendBtn">SEND</button>
      </form>
    </div>
  );
};
