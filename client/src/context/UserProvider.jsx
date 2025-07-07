import { useState, useEffect, useCallback } from "react";
import { UserContext } from "./UserContextInstance";
import { jwtDecode } from "jwt-decode";

export const UserProvider = ({ children }) => {
  const [currentUserID, setCurrentUserID] = useState(null);
  const [userName, setUserName] = useState("");
  const [isLoggedIn, setIsLoggedIn] = useState(false);
  const [authLoading, setAuthLoading] = useState(true); // ✅ nuevo

  console.log("🛠️ UserProvider mounted");

  const logout = useCallback(() => {
    console.log("🔒 Logging out user...");
    setCurrentUserID(null);
    setUserName("");
    setIsLoggedIn(false);
    localStorage.removeItem("accessToken");
    localStorage.removeItem("userName");

    const socket = window._socketInstance;
    if (socket && socket.connected) {
      console.log("🛑 Disconnecting socket on logout");
      socket.disconnect();
    }
  }, []);

  const updateLoginStatus = useCallback(
    (status, accessToken = null, name = null) => {
      if (status) {
        console.log("✅ User logged in");
        if (accessToken) {
          localStorage.setItem("accessToken", accessToken);
          try {
            const decoded = jwtDecode(accessToken);
            console.log("🔑 Token decoded in updateLoginStatus:", decoded);
            if (decoded?.id) {
              setCurrentUserID(decoded.id);
              setIsLoggedIn(true);
            } else {
              console.error("❌ Token does not contain 'id'");
              logout();
              return;
            }
          } catch (error) {
            console.error("❌ Failed to decode token:", error.message);
            logout();
            return;
          }
        }
        if (name) {
          localStorage.setItem("userName", name);
          setUserName(name);
        }
      } else {
        logout();
      }
    },
    [logout]
  );

  useEffect(() => {
    console.log("🔄 useEffect de UserProvider ejecutado");
    const token = localStorage.getItem("accessToken");
    const storedUserName = localStorage.getItem("userName");

    if (token) {
      console.log("🔑 Token encontrado, actualizando estado");
      updateLoginStatus(true, token, storedUserName);
    } else {
      console.log("⚠️ No token found, user is logged out");
      logout();
    }
    setAuthLoading(false);
  }, [updateLoginStatus, logout]);

  return (
    <UserContext.Provider
      value={{
        currentUserID,
        setCurrentUserID,
        userName,
        setUserName,
        isLoggedIn,
        updateLoginStatus,
        logout,
        authLoading,
      }}
    >
      {children}
    </UserContext.Provider>
  );
};
