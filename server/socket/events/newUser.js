import User from "../../models/User.js";
import { getConnectedUsers, getUnreadMessages } from "../../utils/users.js";
import { getRecentPublicMessages } from "../../utils/messages.js";

export default async function handleNewUser(socket, io, { userName }) {
  console.log(`newUser event received: ${userName}`);
  if (!userName) {
    console.log("No username provided");
    socket.emit("usernameError", "No username provided");
    return;
  }

  try {
    // Get session token from parsed cookies
    const sessionToken = socket.request.cookies?.sessionToken || "none";
    console.log(`Session token from socket: ${sessionToken}`);
    let user;

    // Check if session token exists and validate user
    if (sessionToken !== "none") {
      user = await User.findOne({ sessionToken });
      console.log(
        `User lookup for sessionToken: ${user ? "found" : "not found"}`
      );
      if (user) {
        if (user.username !== userName) {
          console.log(
            `Username ${userName} does not match session token's username ${user.username}`
          );
          socket.emit("usernameError", "Username does not match session");
          return;
        }
        // Update user's socketID and connection status
        await User.updateOne(
          { sessionToken },
          { socketID: socket.id, connected: true }
        );
        console.log(
          `Reconnected user ${userName} with session token ${sessionToken}`
        );
      }
    }

    // If no valid user found, emit error and exist
    if (!user) {
      console.log("Invalid session. Emitting usernameError.");
      socket.emit("usernameError", "Invalid session. Please sign in again.");
      return;
    }

    // Attach username and userID to socket for later use
    socket.username = userName;
    socket.userID = user.userID;
    console.log(`${userName} has joined the chat!`);

    // Send unread private messages to the user
    const unreadMessages = await getUnreadMessages(user.userID);
    socket.emit("unreadMessages", unreadMessages);

    // Send recent public messages to the user
    const recentPublicMessages = await getRecentPublicMessages();
    recentPublicMessages.forEach((message) => {
      socket.emit("messageResponse", message);
    });

    // Broadcast updated user list to all clients
    const users = await getConnectedUsers();
    console.log(
      `Emitting users list to socket ${socket.id}: ${JSON.stringify(users)}`
    );
    io.emit("users", users);
  } catch (error) {
    console.error(`Error in newUser handler: ${error.message}`);
    socket.emit("error", "Server error. Please try again.");
  }
}
