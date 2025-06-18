// It allows navigation between different page without reloading the entire page
import { BrowserRouter, Routes, Route } from "react-router-dom";
import { Home } from "../components/Home"
import { ChatPage } from "../components/ChatPage"
import { HomePage } from "../pages/HomePage";



export const Navigation = () => {
    return (
        <BrowserRouter>
            <Routes>
                {/* test router for home page */}
                <Route path="/" element={<Home />}/>
                {/* test router for chat page */}
                <Route path="/chat" element={<ChatPage />}/>

                {/* router for home page */}
                <Route path="/homepage" element={<HomePage/>}/>
        
            </Routes>
        </BrowserRouter>
    )

}