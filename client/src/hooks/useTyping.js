import { useEffect, useState } from "react";
import { useSocketContext } from "../context/useSocketContext";
import { useUsers } from "./useUsers";

export const useTyping = (selectedUser) => {
  const { socket } = useSocketContext();
  const { currentUserID } = useUsers();
  const [typingStatus, setTypingStatus] = useState("");

  useEffect(() => {
    if (!socket || !currentUserID) return;

    const currentUserName = localStorage.getItem("userName");

    const handleTypingResponse = (data) => {
      console.log("Received typingResponse:", data);
      if (data.to) {
        // Mensaje privado
        if (
          selectedUser &&
          data.to === currentUserID &&
          data.userName !== currentUserName &&
          selectedUser.userID === data.from
        ) {
          setTypingStatus(`${data.userName} is typing...`);
        }
      } else {
        // Mensaje público
        if (!selectedUser && data.userName !== currentUserName) {
          setTypingStatus(`${data.userName} is typing...`);
        }
      }
    };

    const handleStopTypingResponse = (data) => {
      console.log("Received stopTypingResponse:", data);
      if (data.to) {
        // Mensaje privado
        if (
          selectedUser &&
          data.to === currentUserID &&
          selectedUser.userID === data.from
        ) {
          setTypingStatus("");
        }
      } else {
        // Mensaje público
        if (!selectedUser) {
          setTypingStatus("");
        }
      }
    };

    socket.on("typingResponse", handleTypingResponse);
    socket.on("stopTypingResponse", handleStopTypingResponse);

    // Limpieza: eliminar los event listeners
    return () => {
      socket.off("typingResponse", handleTypingResponse);
      socket.off("stopTypingResponse", handleStopTypingResponse);
    };
  }, [socket, currentUserID, selectedUser]);

  return { typingStatus, setTypingStatus };
};
