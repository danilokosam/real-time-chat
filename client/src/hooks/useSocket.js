// import { useEffect } from "react";
// import { io } from "socket.io-client";

// let socketInstance = null;

// export const useSocket = ({
//   setMessages,
//   setPrivateMessages,
//   setTypingStatus,
//   setConnectionError,
//   setCurrentUserID,
//   setUsers,
//   selectedUser,
//   currentUserID,
// }) => {
//   useEffect(() => {
//     if (!socketInstance) {
//       socketInstance = io("http://localhost:3001", {
//         reconnection: true,
//         reconnectionAttempts: 5,
//         reconnectionDelay: 1000,
//         reconnectionDelayMax: 5000,
//         withCredentials: true,
//         transports: ["polling", "websocket"],
//       });

//       socketInstance.on("connect", () => {
//         console.log("✅ Socket connected:", socketInstance.id);
//         setConnectionError(null);
//       });

//       socketInstance.on("connect_error", (error) => {
//         console.error("❌ Connection failed:", error.message);
//         setConnectionError("Failed to connect to server. Retrying...");
//       });

//       socketInstance.on("disconnect", (reason) => {
//         console.warn("⚠️ Disconnected:", reason);
//         setConnectionError("Disconnected from server. Trying to reconnect...");
//       });

//       socketInstance.on("reconnect", (attempt) => {
//         console.log("🔄 Reconnected after attempt:", attempt);
//         setConnectionError(null);
//         // No emitimos nada aquí. Se maneja desde useUsers
//       });

//       socketInstance.on("usernameError", (message) => {
//         console.error("🚨 Username error:", message);
//         setConnectionError(message);
//         localStorage.setItem("usernameError", message);
//         setTimeout(() => {
//           localStorage.removeItem("userName");
//           window.location.href = "/";
//         }, 3000);
//       });
//     }

//     const handleUsers = (data) => {
//       console.log("📥 Received users list:", data);
//       const userName = localStorage.getItem("userName");
//       const currentUser = data.find((user) => user.username === userName);
//       if (currentUser) {
//         setCurrentUserID(currentUser.userID);
//         socketInstance.userID = currentUser.userID;
//       }
//       setUsers(data);
//     };

//     const handleMessageResponse = (data) => {
//       console.log("📨 New public message:", data);
//       setMessages((prev) => [...prev, data]);
//     };

//     const handlePrivateMessage = ({
//       id,
//       content,
//       from,
//       fromUsername,
//       to,
//       timestamp,
//       readBy,
//       readAt,
//     }) => {
//       if (!currentUserID) return;

//       const otherUserID = to === currentUserID ? from : to;
//       const fromSelf = from === currentUserID;

//       if (!otherUserID) return;

//       setPrivateMessages((prev) => {
//         const userMessages = prev[otherUserID] || [];
//         if (userMessages.some((msg) => msg.id === id)) {
//           return prev; // Ignorar duplicados
//         }

//         return {
//           ...prev,
//           [otherUserID]: [
//             ...userMessages,
//             { id, content, fromSelf, fromUsername, timestamp, readBy, readAt },
//           ],
//         };
//       });
//     };

//     const handleMessageRead = ({ messageID, readBy, readAt }) => {
//       setPrivateMessages((prev) => {
//         const updated = { ...prev };
//         Object.keys(updated).forEach((userID) => {
//           updated[userID] = updated[userID].map((msg) =>
//             msg.id === messageID ? { ...msg, readBy, readAt } : msg
//           );
//         });
//         return updated;
//       });
//     };

//     const handleError = (error) => {
//       console.error("🚨 Socket error:", error);
//       setConnectionError(error.message || "An error occurred in the chat.");
//     };

//     const handleTypingResponse = (data) => {
//       const currentUserName = localStorage.getItem("userName");
//       if (data.to) {
//         if (
//           selectedUser &&
//           data.to === currentUserID &&
//           data.userName !== currentUserName &&
//           selectedUser.userID === data.from
//         ) {
//           setTypingStatus(`${data.userName} is typing...`);
//         }
//       } else if (!selectedUser && data.userName !== currentUserName) {
//         setTypingStatus(`${data.userName} is typing...`);
//       }
//     };

//     const handleStopTypingResponse = (data) => {
//       if (data.to) {
//         if (
//           selectedUser &&
//           data.to === currentUserID &&
//           selectedUser.userID === data.from
//         ) {
//           setTypingStatus("");
//         }
//       } else if (!selectedUser) {
//         setTypingStatus("");
//       }
//     };

//     socketInstance.on("users", handleUsers);
//     socketInstance.on("messageResponse", handleMessageResponse);
//     socketInstance.on("privateMessage", handlePrivateMessage);
//     socketInstance.on("messageRead", handleMessageRead);
//     socketInstance.on("error", handleError);
//     socketInstance.on("typingResponse", handleTypingResponse);
//     socketInstance.on("stopTypingResponse", handleStopTypingResponse);

//     return () => {
//       socketInstance.off("users", handleUsers);
//       socketInstance.off("messageResponse", handleMessageResponse);
//       socketInstance.off("privateMessage", handlePrivateMessage);
//       socketInstance.off("messageRead", handleMessageRead);
//       socketInstance.off("error", handleError);
//       socketInstance.off("typingResponse", handleTypingResponse);
//       socketInstance.off("stopTypingResponse", handleStopTypingResponse);
//     };
//   }, [
//     setMessages,
//     setPrivateMessages,
//     setTypingStatus,
//     setConnectionError,
//     setCurrentUserID,
//     setUsers,
//     selectedUser,
//     currentUserID,
//   ]);

//   return socketInstance;
// };
