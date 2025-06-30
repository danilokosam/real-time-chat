export const leaveChat = (navigate) => {
  localStorage.removeItem("userName");
  navigate("/");
  window.location.reload();
};
