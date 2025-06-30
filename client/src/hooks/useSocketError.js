import { useEffect } from "react";
import { useSocketContext } from "../context/useSocketContext";

export const useSocketError = () => {
  const { socket, setConnectionError } = useSocketContext();

  useEffect(() => {
    if (!socket) return;

    const handleError = (error) => {
      console.error("Socket error:", error);
      setConnectionError(error.message || "An error occurred in the chat.");
    };

    socket.on("error", handleError);

    // Limpieza: eliminar el event listener
    return () => {
      socket.off("error", handleError);
    };
  }, [socket, setConnectionError]);
};
