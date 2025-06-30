import { getUnreadCountBySender } from "../utils/messageUtils";

export const UserList = ({
  users,
  currentSelectedUser,
  handleUserClick,
  unreadMessages,
}) => {
  return (
    <div className="chat__users">
      {users.length > 0 ? (
        users.map((user) => {
          const unreadCount = getUnreadCountBySender(
            unreadMessages,
            user.userID,
            currentSelectedUser
          );
          return (
            <p
              key={user.userID}
              className={user.self ? "current-user" : "user-selectable"}
              onClick={() => handleUserClick(user)}
            >
              {user.self ? `${user.username} (You)` : user.username}
              <span
                className={`connection-indicator ${
                  user.connected ? "online" : "offline"
                }`}
              ></span>
              <span className="connection-text">
                {user.connected ? "Online" : "Offline"}
              </span>
              {!user.self && unreadCount > 0 && (
                <span className="unread-indicator">{unreadCount}</span>
              )}
            </p>
          );
        })
      ) : (
        <p className="no-users">No users connected</p>
      )}
    </div>
  );
};
