export const LoggedInView = ({ userName, handleLogout }) => {
  return (
    <div className="home__container text-violet-500">
      <h2 className="home__header">Welcome back, {userName}!</h2>
      <button
        onClick={handleLogout}
        className="home__cta bg-red-500 hover:bg-red-600"
      >
        LOG OUT
      </button>
    </div>
  );
};
