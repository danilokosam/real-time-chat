export const processUsers = (users, currentUserID) => {
  return users
    .map((user) => ({
      ...user,
      self: user.userID === currentUserID,
    }))
    .sort((a, b) => {
      if (a.self) return -1;
      if (b.self) return 1;
      if (a.username < b.username) return -1;
      if (a.username > b.username) return 1;
      return 0;
    });
};
