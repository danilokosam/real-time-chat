import { useEffect, useRef, useState } from "react";
import { ChatBar } from "./ChatBar";
import { ChatBody } from "./ChatBody";
import { ChatFooter } from "./ChatFooter";
import { useSocketContext } from "../context/useSocketContext";
import { useMessages } from "../hooks/useMessages";
import { usePrivateMessages } from "../hooks/usePrivateMessages";
import { useTyping } from "../hooks/useTyping";
import { useSocketError } from "../hooks/useSocketError";
import { useUsers } from "../hooks/useUsers";
import { Loader2, Wifi, WifiOff } from "lucide-react";

export const ChatPage = () => {
  const { socket, connectionError } = useSocketContext();
  const { messages } = useMessages();
  const { currentUserID } = useUsers();
  const [selectedUser, setSelectedUser] = useState(null);
  const { privateMessages } = usePrivateMessages(selectedUser);
  const { typingStatus } = useTyping(selectedUser);
  useSocketError();
  const lastMessageRef = useRef(null);

  // Debug logging
  useEffect(() => {
    console.log("=== ChatPage Debug ===");
    console.log("Socket connected:", !!socket?.connected);
    console.log("Current user ID:", currentUserID);
    console.log("Selected user:", selectedUser);
    console.log("Public messages count:", messages.length);
    console.log("Private messages object:", privateMessages);
    console.log("Private messages keys:", Object.keys(privateMessages));
  }, [socket, currentUserID, selectedUser, messages, privateMessages]);
  
  // Auto-scroll to latest message
  useEffect(() => {
    lastMessageRef.current?.scrollIntoView({ behavior: "smooth" });
  }, [messages, privateMessages]);

  // Log when selectedUser changes
  useEffect(() => {
    if (selectedUser) {
      console.log("=== Selected User Changed ===");
      console.log("New selected user:", selectedUser);
      console.log("Messages for this user:", privateMessages[selectedUser.userID] || []);
    } else {
      console.log("=== Switched to Public Chat ===");
      console.log("Public messages:", messages);
    }
  }, [selectedUser, privateMessages, messages]);

  // Render loading if socket isn't connected
  if (!socket || !socket.connected) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-slate-50 to-slate-100 flex items-center justify-center">
        <div className="bg-white rounded-2xl shadow-xl p-8 max-w-md w-full mx-4">
          <div className="text-center">
            {connectionError ? (
              <>
                <div className="w-16 h-16 bg-red-100 rounded-full flex items-center justify-center mx-auto mb-4">
                  <WifiOff className="w-8 h-8 text-red-500" />
                </div>
                <h3 className="text-lg font-semibold text-slate-900 mb-2">Connection Error</h3>
                <p className="text-slate-600 mb-4">{connectionError}</p>
                <button 
                  onClick={() => window.location.reload()}
                  className="px-6 py-2 bg-red-500 hover:bg-red-600 text-white rounded-lg transition-colors"
                >
                  Retry Connection
                </button>
              </>
            ) : (
              <>
                <div className="w-16 h-16 bg-blue-100 rounded-full flex items-center justify-center mx-auto mb-4">
                  <Loader2 className="w-8 h-8 text-blue-500 animate-spin" />
                </div>
                <h3 className="text-lg font-semibold text-slate-900 mb-2">Connecting to Chat</h3>
                <p className="text-slate-600">Please wait while we establish connection...</p>
              </>
            )}
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="h-screen bg-slate-100 flex">
      {connectionError && (
        <div className="absolute top-4 right-4 bg-red-50 border border-red-200 text-red-700 px-4 py-2 rounded-lg shadow-sm z-50">
          <div className="flex items-center space-x-2">
            <WifiOff className="w-4 h-4" />
            <span className="text-sm">{connectionError}</span>
          </div>
        </div>
      )}
      
      <ChatBar setSelectedUser={setSelectedUser} />
      
      <div className="flex-1 flex flex-col">
        <ChatBody
          messages={messages}
          privateMessages={privateMessages}
          selectedUser={selectedUser}
          typingStatus={typingStatus}
          lastMessageRef={lastMessageRef}
          currentUserID={currentUserID}
        />
        <ChatFooter selectedUser={selectedUser} />
      </div>
    </div>
  );
};