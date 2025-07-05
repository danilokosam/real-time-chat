import { useState, useEffect, useContext } from "react";
import { useNavigate } from "react-router-dom";
import { useSocketContext } from "../context/useSocketContext";
import { UserContext } from "../context/UserContextInstance";

export const Home = () => {
  const navigate = useNavigate();
  const { updateLoginStatus, isLoggedIn } = useSocketContext();
  const { userName, setUserName, logout } = useContext(UserContext); // Get userName from context ( UserContext )
  const [isRegisterMode, setIsRegisterMode] = useState(false); // Toggle between login and register
  const [userNameInput, setUserNameInput] = useState(""); // Renamed to avoid conflict
  const [password, setPassword] = useState("");
  const [email, setEmail] = useState("");
  const [error, setError] = useState("");
  const [loginPending, setLoginPending] = useState(false); // Track login state

  console.log("Home render:", { isLoggedIn, userName });

  // Navigate to /chat when logged in and userName is set
  useEffect(() => {
    console.log("useEffect de navegación:", { isLoggedIn, userName });
    if (isLoggedIn && userName) {
      console.log("✅ Navigating to /chat with userName:", userName);
      navigate("/chat");
      setLoginPending(false);
    }
  }, [isLoggedIn, userName, navigate]);

  //  // Clear localStorage on initial load if not logged in
  // useEffect(() => {
  //   if (!isLoggedIn) {
  //     localStorage.removeItem("accessToken");
  //     localStorage.removeItem("userName");
  //     setUserNameInput(""); // Ensure input is empty
  //     console.log("🧹 Cleared localStorage on page load (not logged in)");
  //   }
  // }, [isLoggedIn]);

  // ✅ Logout handler
  const handleLogout = () => {
    updateLoginStatus(false);
    logout();
    setUserNameInput(""); // Clear input on logout
    setPassword("");
    setEmail("");
    console.log("🚪 Logged out and cleared inputs");
    navigate("/");
  };

  // ✅ Login/register handler
  const handleSubmit = async (e) => {
    e.preventDefault();
    setError("");

    // Client-side validation
    if (!userNameInput.trim()) {
      setError("Username cannot be empty.");
      return;
    }
    if (userNameInput.length < 3) {
      setError("Username must be at least 3 characters long.");
      return;
    }
    if (userNameInput.length > 20) {
      setError("Username cannot be longer than 20 characters.");
      return;
    }
    if (!/^[a-zA-Z0-9 ]+$/.test(userNameInput)) {
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
        ? { username: userNameInput, password, email }
        : { username: userNameInput, password };

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

      const testResponse = await fetch(
        "http://localhost:3001/api/auth/test-cookie",
        {
          credentials: "include",
        }
      );
      const testData = await testResponse.json();
      console.log("Test cookie response:", testData);

      let { accessToken } = data;
      if (!accessToken && testData.accessToken) {
        accessToken = testData.accessToken;
        console.log("✅ Using accessToken from test-cookie:", accessToken);
      }

      if (accessToken) {
        console.log("🚀 Calling updateLoginStatus with:", {
          accessToken,
          username: userNameInput,
        });
        setLoginPending(true);
        updateLoginStatus(true, accessToken, userNameInput);
        setUserName(userNameInput); // Update UserContext with userName
        localStorage.setItem("userName", userNameInput); // Persist userName in localStorage
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
      {isLoggedIn ? (
        <>
          <h2 className="home__header">Welcome back!</h2>
          <button
            onClick={handleLogout}
            className="home__cta bg-red-500 hover:bg-red-600"
          >
            LOG OUT
          </button>
        </>
      ) : (
        <>
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
            {isRegisterMode
              ? "Already have an account?"
              : "Don't have an account?"}{" "}
            <button
              type="button"
              className="toggle__button"
              onClick={() => {
                setIsRegisterMode(!isRegisterMode);
                setError(""); // Clear error when toggling
                setUserNameInput("");
                setPassword("");
                setEmail("");
              }}
            >
              {isRegisterMode ? "Sign in" : "Register"}
            </button>
          </p>
        </>
      )}
    </div>
  );
};
