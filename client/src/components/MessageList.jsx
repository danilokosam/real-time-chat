import { MessageItem } from "./MessageItem";
export const MessageList = ({
  messages,
  userName,
  isPrivate,
  selectedUser,
  currentUserID,
  lastMessageRef,
  typingStatus,
}) => {
  return (
    <div className="message__container">
      {messages.map((message) => (
        <MessageItem
          key={message.id}
          message={message}
          userName={userName}
          isPrivate={isPrivate}
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
  );
};
