import { useNavigate } from "react-router-dom";
import { ChatHeader } from "./ChatHeader";
import { MessageList } from "./MessageList";
import { useMemo, useEffect } from "react";
import { leaveChat } from "../utils/authUtils";

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

  useEffect(() => {
    if (!userName) {
      console.warn("⚠️ No userName found in localStorage");
    }
  }, [userName]);

  // Handle leaving the chat
  const handleLeaveChat = () => {
    leaveChat(navigate);
  };

  // Determine messages to display
  const messagesToDisplay = useMemo(() => {
    return selectedUser ? privateMessages[selectedUser.userID] || [] : messages;
  }, [selectedUser, privateMessages, messages]);

  // Log private messages for debugging
  useEffect(() => {
    console.log("ChatBody rendering, privateMessages:", privateMessages);
    console.log("ChatBody rendering, selectedUser:", selectedUser);
    console.log(
      "Private messages for selected user:",
      selectedUser
        ? privateMessages[selectedUser.userID] || []
        : "N/A (public chat)"
    );
    console.log("Messages to render:", messagesToDisplay);
  }, [privateMessages, selectedUser, messagesToDisplay]);

  return (
    <>
      <ChatHeader
        selectedUser={selectedUser}
        handleLeaveChat={handleLeaveChat}
      />
      <MessageList
        messages={messagesToDisplay}
        userName={userName}
        isPrivate={!!selectedUser}
        selectedUser={selectedUser}
        currentUserID={currentUserID}
        lastMessageRef={lastMessageRef}
        typingStatus={typingStatus}
      />
    </>
  );
};
