export const AuthForm = ({
  isRegisterMode,
  toggleMode,
  handleSubmit,
  userNameInput,
  setUserNameInput,
  email,
  setEmail,
  password,
  setPassword,
  error,
  loginPending,
}) => (
  <div className="home__container text-violet-500">
    <h2 className="home__header">
      {isRegisterMode ? "Register for Open Chat" : "Sign in to Open Chat"}
    </h2>
    {loginPending && <p>Loading...</p>}
    <form onSubmit={handleSubmit}>
      <label htmlFor="username">Username</label>
      <input
        type="text"
        minLength={3}
        maxLength={20}
        name="username"
        id="username"
        className="username__input"
        value={userNameInput}
        onChange={(e) => setUserNameInput(e.target.value)}
      />
      {isRegisterMode && (
        <>
          <label htmlFor="email">Email</label>
          <input
            type="email"
            name="email"
            id="email"
            className="email__input"
            value={email}
            onChange={(e) => setEmail(e.target.value)}
          />
        </>
      )}
      <label htmlFor="password">Password</label>
      <input
        type="password"
        minLength={8}
        name="password"
        id="password"
        className="password__input"
        value={password}
        onChange={(e) => setPassword(e.target.value)}
      />
      {error && <p className="error-message">{error}</p>}
      <button type="submit" className="home__cta">
        {isRegisterMode ? "REGISTER" : "SIGN IN"}
      </button>
    </form>
    <p>
      {isRegisterMode ? "Already have an account?" : "Don't have an account?"}{" "}
      <button type="button" className="toggle__button" onClick={toggleMode}>
        {isRegisterMode ? "Sign in" : "Register"}
      </button>
    </p>
  </div>
);
