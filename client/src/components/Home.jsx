import { useState } from "react";
import { useNavigate } from "react-router-dom";

export const Home = () => {
  const navigate = useNavigate();
  const [userName, setUserName] = useState("");
  const [error, setError] = useState("");

  const handleSubmit = (e) => {
    e.preventDefault();
    setError("");

    // Validation rules
    if (!userName.trim()) {
      setError("Username cannot be empty.");
      return;
    }
    if (userName.length < 3) {
      setError("Username must be at least 3 characters long.");
      return;
    }
    if (userName.length > 20) {
      setError("Username cannot be longer than 20 characters.");
      return;
    }
    if (!/^[a-zA-Z0-9 ]+$/.test(userName)) {
      setError("Username can only contain letters, numbers, and spaces.");
      return;
    }

    localStorage.setItem("userName", userName);
    navigate("/chat");
  };

  return (
    <form className="home__container" onSubmit={handleSubmit}>
      <h2 className="home__header text-violet-500">Sign in to Open Chat</h2>
      <label htmlFor="username">Username</label>
      <input
        type="text"
        minLength={3}
        maxLength={20}
        name="username"
        id="username"
        className="username__input"
        value={userName}
        onChange={(e) => setUserName(e.target.value)}
      />
      {error && <p className="error-message">{error}</p>}
      <button className="home__cta">SIGN IN</button>
    </form>
  );
};
