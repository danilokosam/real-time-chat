import { useState, useEffect } from "react";
import { useSocketContext } from "../context/useSocketContext";
import { useUsers } from "../hooks/useUsers";
import { UserList } from "./UserList";

export const ChatBar = ({ setSelectedUser }) => {
  const { socket } = useSocketContext();
  const { users, currentUserID } = useUsers();
  const [currentSelectedUser, setCurrentSelectedUser] = useState(null);

  useEffect(() => {
    console.log("Users from useUsers:", users);
  }, [users]);

  const processedUsers = users.filter(user => user.userID !== currentUserID).map(user => ({
    ...user,
    self: user.userID === currentUserID
  }));

  const handleUserClick = (user) => {
    if (user.userID !== currentUserID) {
      setSelectedUser(user);
      setCurrentSelectedUser(user);
    }
  };

  const handlePublicChatClick = () => {
    setSelectedUser(null);
    setCurrentSelectedUser(null);
  };

  return (
    <div className="w-80 bg-white border-r border-slate-200 flex flex-col">
      {/* Header */}
      <div className="p-6 border-b border-slate-200">
        <h2 className="text-xl font-semibold text-slate-900">Chat</h2>
        <p className="text-sm text-slate-500 mt-1">Stay connected</p>
      </div>

      {/* Chat Options */}
      <div className="flex-1 overflow-y-auto">
        {/* Public Chat Button */}
        <div className="p-6">
          <button 
            onClick={handlePublicChatClick} 
            className={`w-full p-4 text-left rounded-lg transition-all duration-200 ${
              !currentSelectedUser 
                ? 'bg-indigo-50 border-2 border-indigo-200' 
                : 'hover:bg-slate-50 border-2 border-transparent'
            }`}
          >
            <span className="font-medium text-slate-900 text-lg">General Chat</span>
            <p className="text-sm text-slate-500 mt-1">Public conversation</p>
          </button>
        </div>

        {/* Users Section */}
        <div className="px-6 pb-6">
          <div className="mb-6">
            <h4 className="text-lg font-semibold text-slate-700 mb-2">
              Active Users
            </h4>
            <span className="bg-slate-100 text-slate-600 text-sm font-medium px-3 py-1 rounded-full">
              {processedUsers.length} online
            </span>
          </div>
          
          <UserList
            users={processedUsers}
            currentSelectedUser={currentSelectedUser}
            handleUserClick={handleUserClick}
          />
        </div>
      </div>

      {/* Footer */}
      <div className="p-6 border-t border-slate-200 bg-slate-50">
        <div className="flex items-center space-x-3 text-sm text-slate-600">
          <div className="w-3 h-3 bg-green-400 rounded-full"></div>
          <span>Connected to chat</span>
        </div>
      </div>
    </div>
  );
};