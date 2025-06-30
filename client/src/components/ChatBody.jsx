import { useNavigate } from "react-router-dom";
import { MessageItem } from "./MessageItem";

// ChatBody component displays public or private messages based on selectedUser
export const ChatBody = ({
  messages,
  privateMessages,
  selectedUser,
  typingStatus,
  lastMessageRef,
  currentUserID,
}) => {
  const navigate = useNavigate();
  const userName = localStorage.getItem("userName");

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
          <MessageItem
            key={message.id}
            message={message}
            userName={userName}
            isPrivate={!!selectedUser}
            selectedUser={selectedUser}
            currentUserID={currentUserID}
          />
        ))}

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
