export const getUnreadCountBySender = (
  unreadMessages,
  senderID,
  currentSelectedUser
) => {
  if (senderID === currentSelectedUser) return 0;
  return unreadMessages.filter((msg) => msg.from === senderID).length;
};
