import { useState, useEffect, useRef } from "react";

export const ChatFooter = ({ socket }) => {
  const [message, setMessage] = useState("");
  const typingTimeoutRef = useRef(null);

  const handleTyping = () => {
    const userNameHandleTyping = localStorage.getItem("userName");
    console.log(`${userNameHandleTyping} is typing...`);
    socket.emit("typing", `${localStorage.getItem("userName")} is typing...`);

    // Clear any existing timeout
    if (typingTimeoutRef.current) {
      clearTimeout(typingTimeoutRef.current);
    }

    // Set a timeout to emit stopTyping after 1 second of inactivity
    typingTimeoutRef.current = setTimeout(() => {
      socket.emit("stopTyping");
    }, 1000);
  };

  const handleSendMessage = (e) => {
    e.preventDefault();
    const userName = localStorage.getItem("userName");
    console.log(`Sending message: ${message} from ${userName}`);
    if (message.trim() && userName) {
      const timestamp = new Date().toLocaleTimeString([], {
        hour: "2-digit",
        minute: "2-digit",
        hour12: true,
      }); // Format as HH:MM AM/PM (e.g., 02:30 PM)
      socket.emit("message", {
        text: message,
        name: userName,
        id: `${socket.id}${Math.random()}`,
        socketID: socket.id,
        timestamp: timestamp, // Add timestamp
      });
      console.log(`Message sent: ${message}`);
      socket.emit("stopTyping"); // Stop typing status when message is sent
    }
    setMessage("");
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
          placeholder="Write message"
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
