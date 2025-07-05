import { StrictMode } from "react";
import { createRoot } from "react-dom/client";
import { UserProvider } from "./context/userContext.jsx";
import { SocketProvider } from "./context/SocketProvider.jsx";
import "./index.css";
import { App } from "./App.jsx";

createRoot(document.getElementById("root")).render(
  <StrictMode>
    <UserProvider>
      <SocketProvider>
        <App />
      </SocketProvider>
    </UserProvider>
  </StrictMode>
);
