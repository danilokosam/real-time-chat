import { useNavigate } from "react-router-dom";

// ChatBody component displays public or private messages based on selectedUser
export const ChatBody = ({
  messages,
  privateMessages,
  selectedUser,
  typingStatus,
  lastMessageRef,
}) => {
  const navigate = useNavigate();

  // Handle leaving the chat
  const handleLeaveChat = () => {
    localStorage.removeItem("userName");
    navigate("/");
    window.location.reload();
  };

  // Determine messages to display
  const messagesToDisplay = selectedUser
    ? privateMessages[selectedUser.userID] || []
    : messages;

  // Log private messages for debugging
  console.log("ChatBody rendering, privateMessages:", privateMessages);
  console.log("ChatBody rendering, selectedUser:", selectedUser);
  console.log(
    "Private messages for selected user:",
    selectedUser
      ? privateMessages[selectedUser.userID] || []
      : "N/A (public chat)"
  );
  console.log("Messages to render:", messagesToDisplay);

  return (
    <>
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

      <div className="message__container">
        {messagesToDisplay.map((message) => (
          <div className="message__chats" key={message.id}>
            <p className="sender__name">
              {selectedUser
                ? message.fromSelf
                  ? "You"
                  : message.fromUsername
                : message.fromUsername === localStorage.getItem("userName")
                ? "You"
                : message.fromUsername}
            </p>
            <div
              className={
                selectedUser
                  ? message.fromSelf
                    ? "message__sender"
                    : "message__recipient"
                  : message.fromUsername === localStorage.getItem("userName")
                  ? "message__sender"
                  : "message__recipient"
              }
            >
              <p>{message.content}</p>
              <p className="message__timestamp">{message.timestamp}</p>
            </div>
          </div>
        ))}

        {/* Show typing status only if relevant */}
        {typingStatus && (
          <div className="message__status">
            <p>{typingStatus}</p>
          </div>
        )}
        <div ref={lastMessageRef} />
      </div>
    </>
  );
};
