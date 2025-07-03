export const UserList = ({
  users,
  currentSelectedUser,
  handleUserClick,
}) => {
  return (
    <div className="space-y-3">
      {users.length > 0 ? (
        users.map((user) => {
          const isSelected = currentSelectedUser?.userID === user.userID;
          return (
            <button
              key={user.userID}
              className={`w-full p-4 text-left rounded-lg transition-all duration-200 ${
                isSelected 
                  ? 'bg-indigo-50 border-2 border-indigo-200' 
                  : 'hover:bg-slate-50 border-2 border-transparent'
              }`}
              onClick={() => handleUserClick(user)}
            >
              <div className="flex items-center justify-between">
                <div className="flex items-center space-x-3">
                  <div className="w-3 h-3 bg-green-400 rounded-full"></div>
                  <span className="font-medium text-slate-900">
                    {user.username}
                  </span>
                </div>
                <span className="text-sm text-green-600">Online</span>
              </div>
            </button>
          );
        })
      ) : (
        <div className="text-center py-8">
          <p className="text-slate-500 mb-2">No users online</p>
          <p className="text-sm text-slate-400">Waiting for connections...</p>
        </div>
      )}
    </div>
  );
};