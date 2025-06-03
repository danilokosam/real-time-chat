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

  // Log private messages for debugging
  console.log("ChatBody rendering, privateMessages:", privateMessages);
  console.log("ChatBody rendering, selectedUser:", selectedUser);
  console.log(
    "Private messages for selected user:",
    selectedUser
      ? privateMessages[selectedUser.userID] || []
      : "N/A (public chat)"
  );
  console.log(
    "Messages to render:",
    selectedUser ? privateMessages[selectedUser?.userID] || [] : messages
  );

  return (
    <>
      <header className="chat__mainHeader">
        {/* Show chat mode in header */}
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
        {selectedUser
          ? // Render private messages for the selected user
            privateMessages.map((message) => (
              <div className="message__chats" key={message.id}>
                <p className="sender__name">
                  {message.fromSelf ? "You" : message.fromUsername}
                </p>
                <div
                  className={
                    message.fromSelf ? "message__sender" : "message__recipient"
                  }
                >
                  <p>{message.content}</p>
                  <p className="message__timestamp">{message.timestamp}</p>
                </div>
              </div>
            ))
          : // Render public messages
            messages.map((message) => (
              <div className="message__chats" key={message.id}>
                <p className="sender__name">
                  {message.userName === localStorage.getItem("userName")
                    ? "You"
                    : message.userName}
                </p>
                <div
                  className={
                    message.userName === localStorage.getItem("userName")
                      ? "message__sender"
                      : "message__recipient"
                  }
                >
                  <p>{message.text}</p>
                  <p className="message__timestamp">{message.timestamp}</p>
                </div>
              </div>
            ))}

        {/* Show typing status */}
        {selectedUser && typingStatus && (
          <div className="message__status">
            <p>{typingStatus}</p>
          </div>
        )}
        {!selectedUser && typingStatus && (
          <div className="message__status">
            <p>{typingStatus}</p>
          </div>
        )}
        <div ref={lastMessageRef} />
      </div>
    </>
  );
};
