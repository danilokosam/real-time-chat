export const ChatHeader = ({ selectedUser, handleLeaveChat }) => {
  return (
    <header className="chat__mainHeader">
      <p>
        {selectedUser
          ? `Private Chat with ${selectedUser.username}`
          : "Hangout with Colleagues"}
      </p>
      <button className="leaveChat__btn" onClick={handleLeaveChat}>
        LEAVE CHAT
      </button>
    </header>
  );
};
