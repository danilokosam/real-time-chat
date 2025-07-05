import { useState } from "react";
import { UserContext } from "./UserContextInstance";

export const UserProvider = ({ children }) => {
  const [currentUserID, setCurrentUserID] = useState(null);
  const [userName, setUserName] = useState(
    localStorage.getItem("userName") || ""
  );

  // ✅ Método para cerrar sesión y limpiar todo
  const logout = () => {
    console.log("🔒 Logging out user...");

    // Limpiar estado del contexto
    setCurrentUserID(null);
    setUserName("");

    // Limpiar storage
    localStorage.removeItem("accessToken");
    localStorage.removeItem("userName");

    // 🔌 Forzar desconexión del socket si existe
    const socket = window._socketInstance; // opcional: guardarlo global para forzar
    if (socket && socket.connected) {
      console.log("🛑 Disconnecting socket on logout");
      socket.disconnect();
    }
  };

  return (
    <UserContext.Provider
      value={{
        currentUserID,
        setCurrentUserID,
        userName,
        setUserName,
        logout, // ✅ expone logout en el contexto
      }}
    >
      {children}
    </UserContext.Provider>
  );
};
