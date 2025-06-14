import { BrowserRouter, Routes, Route } from "react-router-dom";
import { Home } from "./components/Home";
import { ChatPage } from "./components/ChatPage";
// import socketIO from "socket.io-client";
// const socket = socketIO.connect("http://localhost:3000", {
//   transports: ["websocket"],
//   reconnection: true,
//   reconnectionDelay: 1000,
//   reconnectionDelayMax: 5000,
//   reconnectionAttempts: 5,
// });

// Esto es socket IO

export const App = () => {
  return (
    <BrowserRouter>
      <div>
        <Routes>
          <Route path="/" element={<Home />}></Route>
          <Route path="/chat" element={<ChatPage />}></Route>
        </Routes>
      </div>
    </BrowserRouter>
  );
};
