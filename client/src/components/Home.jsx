import { useState } from "react";
import { useNavigate } from "react-router-dom";

export const Home = () => {
  const navigate = useNavigate();
  const [userName, setUserName] = useState("");
  const [error, setError] = useState("");

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError("");

    // Client-side validation
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

    try {
      const response = await fetch("http://localhost:3001/api/login", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({ userName }),
        credentials: "include", // Send cookies with request
      });

      const data = await response.json();
      if (!response.ok) {
        setError(data.error || "Login failed");
        return;
      }

      console.log("Login succesful, checking cookies...");
      console.log("Cookies;", document.cookie); // Note: httpOnly cookies won't appear here
      // Test cookie receipt
      const testResponse = await fetch(
        "http://localhost:3001/api/test-cookie",
        {
          credentials: "include",
        }
      );
      const testData = await testResponse.json();
      console.log("Test cookie response:", testData);

      localStorage.setItem("userName", userName);
      navigate("/chat");
    } catch (err) {
      console.error("Login error:", err);
      setError("Failed to connect to server. Please try again.");
    }
  };

  return (
    <form className="home__container text-violet-500" onSubmit={handleSubmit}>
      <h2 className="home__header">Sign in to Open Chat</h2>
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
