import { useState, useEffect, useRef } from "react";

export const ChatFooter = ({ socket, selectedUser, currentUserID }) => {
  const [message, setMessage] = useState("");
  const typingTimeoutRef = useRef(null);

  useEffect(() => {
    console.log(
      "ChatFooter: currentUserID:",
      currentUserID,
      "selectedUser:",
      selectedUser
    );
  }, [currentUserID, selectedUser]);

  const handleTyping = () => {
    if (!currentUserID) {
      console.log("Cannot handle typing: no userID");
      return;
    }
    const userName = localStorage.getItem("userName");
    console.log(`${userName} is typing...`);
    const typingData = {
      userName,
      to: selectedUser ? selectedUser.userID : null,
    };
    socket.emit("typing", typingData);

    if (typingTimeoutRef.current) {
      clearTimeout(typingTimeoutRef.current);
    }

    typingTimeoutRef.current = setTimeout(() => {
      socket.emit("stopTyping", {
        to: selectedUser ? selectedUser.userID : null,
      });
    }, 1000);
  };

  const handleSendMessage = (e) => {
    e.preventDefault();
    if (!currentUserID) {
      console.log("Cannot send message: no userID");
      return;
    }
    const userName = localStorage.getItem("userName");
    if (message.trim() && userName) {
      if (selectedUser) {
        console.log(
          `Sending private message to ${selectedUser.username}: ${message}`
        );
        socket.emit("privateMessage", {
          content: message,
          to: selectedUser.userID,
          fromUsername: userName,
        });
      } else {
        console.log(`Sending public message: ${message} from ${userName}`);
        socket.emit("message", {
          text: message,
          userName,
        });
        socket.emit("stopTyping", { to: null });
      }
      setMessage("");
    }
  };

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
            selectedUser
              ? `Message ${selectedUser.username}`
              : "Write message..."
          }
          className="message"
          value={message}
          onChange={(e) => setMessage(e.target.value)}
          onKeyDown={handleTyping}
          disabled={!currentUserID} // Temporarily removed for testing
        />
        <button className="sendBtn">SEND</button>
      </form>
    </div>
  );
};
