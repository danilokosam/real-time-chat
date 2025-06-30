export const MessageForm = ({
  message,
  setMessage,
  handleSendMessage,
  selectedUser,
  currentUserID,
  onTyping,
}) => {
  return (
    <div className="chat__footer">
      <form className="form" onSubmit={handleSendMessage}>
        <input
          type="text"
          placeholder={
            selectedUser
              ? `Message ${selectedUser.username}`
              : "Write message..."
          }
          className="message"
          value={message}
          onChange={(e) => setMessage(e.target.value)}
          onKeyDown={(e) => {
            if (e.key !== "Enter") onTyping();
          }}
          disabled={!currentUserID}
        />
        <button className="sendBtn">SEND</button>
      </form>
    </div>
  );
};
