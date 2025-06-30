import { useState, useEffect, useRef } from "react";
import { useSocketContext } from "../context/useSocketContext";
import { useUsers } from "../hooks/useUsers";
import debounce from "lodash/debounce";

export const ChatFooter = ({ selectedUser }) => {
  const { socket } = useSocketContext();
  const { currentUserID } = useUsers();
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

  // Debounce typing event to reduce server load
  const handleTyping = debounce(() => {
    if (!currentUserID) {
      console.log("Cannot handle typing: no userID");
      return;
    }
    const userName = localStorage.getItem("userName");
    if (!userName) {
      console.log("Cannot handle typing: no userName in localStorage");
      return;
    }
    console.log(`${userName} is typing...`);
    const typingData = {
      userName,
      to: selectedUser ? selectedUser.userID : null,
      from: currentUserID,
    };
    socket.emit("typing", typingData);

    if (typingTimeoutRef.current) {
      clearTimeout(typingTimeoutRef.current);
    }

    typingTimeoutRef.current = setTimeout(() => {
      socket.emit("stopTyping", {
        userName,
        to: selectedUser ? selectedUser.userID : null,
        from: currentUserID,
      });
    }, 1000);
  }, 500);

  const handleSendMessage = (e) => {
    e.preventDefault();
    if (!currentUserID) {
      console.log("Cannot send message: no userID");
      return;
    }
    const userName = localStorage.getItem("userName");
    if (!userName) {
      console.log("Cannot send message: no userName in localStorage");
      return;
    }
    if (message.trim()) {
      if (selectedUser) {
        console.log(
          `Sending private message to ${selectedUser.username}: ${message}`
        );
        socket.emit("privateMessage", {
          content: message,
          to: selectedUser.userID,
          fromUsername: userName,
          from: currentUserID,
        });
        // Emit stopTyping for private chat
        socket.emit("stopTyping", {
          userName, // Add userName
          to: selectedUser.userID,
          from: currentUserID,
        });
      } else {
        console.log(`Sending public message: ${message} from ${userName}`);
        socket.emit("message", {
          text: message,
          userName,
          from: currentUserID,
        });
        // Emit stopTyping for public chat
        socket.emit("stopTyping", {
          userName, // Add userName
          to: null,
          from: currentUserID,
        });
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
          onKeyDown={(e) => {
            if (e.key !== "Enter") handleTyping();
          }}
          disabled={!currentUserID}
        />
        <button className="sendBtn">SEND</button>
      </form>
    </div>
  );
};