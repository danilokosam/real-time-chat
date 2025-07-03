export const MessageForm = ({ 
  message, 
  setMessage, 
  handleSendMessage, 
  selectedUser, 
  onTyping 
}) => {
  const handleInputChange = (e) => {
    setMessage(e.target.value);
    if (onTyping) {
      onTyping();
    }
  };

  return (
    <div className="bg-white border-t border-slate-200 p-6">
      <form onSubmit={handleSendMessage} className="flex items-end space-x-4">
        <div className="flex-1">
          <textarea
            value={message}
            onChange={handleInputChange}
            placeholder={selectedUser ? `Message ${selectedUser.username}...` : "Type a message..."}
            className="w-full px-4 py-3 border border-slate-300 rounded-lg resize-none focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:border-transparent transition-all duration-200 max-h-32"
            rows="1"
            onKeyDown={(e) => {
              if (e.key === 'Enter' && !e.shiftKey) {
                e.preventDefault();
                handleSendMessage(e);
              }
            }}
          />
        </div>
        
        <button
          type="submit"
          disabled={!message.trim()}
          className="px-6 py-3 bg-indigo-500 hover:bg-indigo-600 disabled:bg-slate-300 text-white rounded-lg transition-all duration-200 font-medium"
        >
          Send
        </button>
      </form>
    </div>
  );
};