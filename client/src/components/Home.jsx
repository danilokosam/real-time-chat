import { useState } from "react";
import { useNavigate } from "react-router-dom";
import { useSocketContext } from "../context/useSocketContext";

export const Home = () => {
  const navigate = useNavigate();
  const { updateLoginStatus } = useSocketContext();
  const [isRegisterMode, setIsRegisterMode] = useState(false); // Toggle between login and register
  const [userName, setUserName] = useState("");
  const [password, setPassword] = useState("");
  const [email, setEmail] = useState(""); // New state for email
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
    if (!password.trim()) {
      setError("Password cannot be empty.");
      return;
    }
    if (password.length < 8) {
      setError("Password must be at least 8 characters long.");
      return;
    }

    // Additional validation for registration
    if (isRegisterMode) {
      if (!email.trim()) {
        setError("Email cannot be empty.");
        return;
      }
      if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email)) {
        setError("Please enter a valid email address.");
        return;
      }
    }

    try {
      const endpoint = isRegisterMode
        ? "http://localhost:3001/api/auth/register"
        : "http://localhost:3001/api/auth/login";
      const body = isRegisterMode
        ? { username: userName, password, email }
        : { username: userName, password };

      const response = await fetch(endpoint, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify(body),
        credentials: "include", // Send cookies with request
      });

      const data = await response.json();
      if (!response.ok) {
        setError(
          data.message ||
            (isRegisterMode ? "Registration failed" : "Login failed")
        );
        return;
      }

      console.log(
        `${
          isRegisterMode ? "Registration" : "Login"
        } successful, checking cookies...`
      );
      // console.log("Cookies:", document.cookie); // Note: httpOnly cookies won't appear here

      // access token retrieved from test-cookie endpoint
      const testResponse = await fetch(
        "http://localhost:3001/api/auth/test-cookie",
        {
          credentials: "include",
        }
      );
      const testData = await testResponse.json();
      console.log("Test cookie response:", testData);

      // Extract accessToken from response
      let { accessToken } = data;
      if (!accessToken && testData.accessToken) {
        accessToken = testData.accessToken;
        console.log("✅ Using accessToken from test-cookie:", accessToken);
      }

      if (accessToken) {
        localStorage.setItem("accessToken", accessToken);
        localStorage.setItem("userName", userName);
        console.log("🚀 Calling updateLoginStatus with:", { accessToken });
        updateLoginStatus(true, accessToken);
        navigate("/chat");
      } else {
        console.warn("⚠️ No accessToken found in response or cookies");
        setError("Authentication failed: token not received.");
      }
    } catch (err) {
      console.error(`${isRegisterMode ? "Registration" : "Login"} error:`, err);
      setError("Failed to connect to server. Please try again.");
    }
  };

  return (
    <div className="home__container text-violet-500">
      <h2 className="home__header">
        {isRegisterMode ? "Register for Open Chat" : "Sign in to Open Chat"}
      </h2>
      <form onSubmit={handleSubmit}>
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
        <button
          type="button"
          className="toggle__button"
          onClick={() => {
            setIsRegisterMode(!isRegisterMode);
            setError(""); // Clear error when toggling
            setUserName("");
            setPassword("");
            setEmail("");
          }}
        >
          {isRegisterMode ? "Sign in" : "Register"}
        </button>
      </p>
    </div>
  );
};
