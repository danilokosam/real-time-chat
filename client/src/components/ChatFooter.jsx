import { useState, useEffect, useRef } from "react";
import { useSocketContext } from "../context/useSocketContext";
import { useUsers } from "../hooks/useUsers";
import { MessageForm } from "./MessageForm";

export const ChatFooter = ({ selectedUser }) => {
  const { socket } = useSocketContext();
  const { currentUserID, userName } = useUsers();
  const [message, setMessage] = useState("");
  const typingTimeoutRef = useRef(null);
  const isSubmittingRef = useRef(false);

  useEffect(() => {
    console.log(
      "ChatFooter: currentUserID:",
      currentUserID,
      "selectedUser:",
      selectedUser
    );
  }, [currentUserID, selectedUser]);

  const handleSendMessage = (e) => {
    e.preventDefault();
    
    if (isSubmittingRef.current || !message.trim() || !socket) {
      return;
    }

    isSubmittingRef.current = true;

    try {
      if (selectedUser) {
        console.log("Sending private message to:", selectedUser.userID, "content:", message.trim());
        socket.emit("privateMessage", {
          content: message.trim(),
          to: selectedUser.userID,
        });
      } else {
        console.log("Sending public message:", message.trim());
        socket.emit("message", {
          text: message.trim(),
          name: userName,
          id: `${socket.id}${Date.now()}${Math.random()}`,
          socketID: socket.id,
        });
      }

      setMessage("");
    } catch (error) {
      console.error("Error sending message:", error);
    } finally {
      setTimeout(() => {
        isSubmittingRef.current = false;
      }, 100);
    }
  };

  const handleTyping = () => {
    if (!socket) return;

    if (selectedUser) {
      socket.emit("typing", {
        to: selectedUser.userID,
        userName: userName,
      });
    } else {
      socket.emit("typing", {
        userName: userName,
      });
    }

    if (typingTimeoutRef.current) {
      clearTimeout(typingTimeoutRef.current);
    }

    typingTimeoutRef.current = setTimeout(() => {
      if (selectedUser) {
        socket.emit("stopTyping", {
          to: selectedUser.userID,
          userName: userName,
        });
      } else {
        socket.emit("stopTyping", {
          userName: userName,
        });
      }
    }, 1000);
  };

  useEffect(() => {
    return () => {
      if (typingTimeoutRef.current) {
        clearTimeout(typingTimeoutRef.current);
      }
    };
  }, []);

  if (!userName) {
    console.warn("No userName found");
    return (
      <div className="p-6 bg-red-50 border-t border-red-200 text-center">
        <div className="bg-white rounded-lg p-4 shadow-sm">
          <p className="text-red-700 font-medium">Please log in to send messages</p>
        </div>
      </div>
    );
  }

  return (
    <MessageForm
      message={message}
      setMessage={setMessage}
      handleSendMessage={handleSendMessage}
      selectedUser={selectedUser}
      currentUserID={currentUserID}
      onTyping={handleTyping}
    />
  );
};