import { BrowserRouter, Routes, Route } from "react-router-dom";
import { Home } from "./components/Home";
import { ChatPage } from "./components/ChatPage";

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
