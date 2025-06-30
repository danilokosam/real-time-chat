// useSocketContext.js
import { useContext } from "react";
import { SocketContext } from "./SocketContext";

export const useSocketContext = () => {
  const context = useContext(SocketContext);
  if (!context) {
    throw new Error("useSocketContext must be used within a SocketProvider");
  }
  return context;
};
