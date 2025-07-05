import { useState, useEffect, useContext } from "react";
import { useNavigate } from "react-router-dom";
import { useSocketContext } from "../context/useSocketContext";
import { UserContext } from "../context/UserContextInstance";

export const useAuth = () => {
  const navigate = useNavigate();
  const { updateLoginStatus, isLoggedIn } = useSocketContext();
  const { userName, setUserName, logout } = useContext(UserContext);
  const [isRegisterMode, setIsRegisterMode] = useState(false);
  const [formData, setFormData] = useState({
    userNameInput: "",
    password: "",
    email: "",
  });
  const [error, setError] = useState("");
  const [loginPending, setLoginPending] = useState(false);

  // Validaciones
  const validateForm = () => {
    const { userNameInput, password, email } = formData;
    if (!userNameInput.trim()) return "Username cannot be empty.";
    if (userNameInput.length < 3)
      return "Username must be at least 3 characters long.";
    if (userNameInput.length > 20)
      return "Username cannot be longer than 20 characters.";
    if (!/^[a-zA-Z0-9 ]+$/.test(userNameInput))
      return "Username can only contain letters, numbers, and spaces.";
    if (!password.trim()) return "Password cannot be empty.";
    if (password.length < 8)
      return "Password must be at least 8 characters long.";
    if (isRegisterMode) {
      if (!email.trim()) return "Email cannot be empty.";
      if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email))
        return "Please enter a valid email address.";
    }
    return "";
  };

  // Navegación cuando está logueado
  useEffect(() => {
    if (isLoggedIn && userName) {
      console.log("✅ Navigating to /chat with userName:", userName);
      navigate("/chat");
      setLoginPending(false);
    }
  }, [isLoggedIn, userName, navigate]);

  // Manejo de logout
  const handleLogout = () => {
    updateLoginStatus(false);
    logout();
    setFormData({ userNameInput: "", password: "", email: "" });
    console.log("🚪 Logged out and cleared inputs");
    navigate("/");
  };

  // Manejo de submit
  const handleSubmit = async (e) => {
    e.preventDefault();
    setError("");

    const validationError = validateForm();
    if (validationError) {
      setError(validationError);
      return;
    }

    try {
      const endpoint = isRegisterMode
        ? "http://localhost:3001/api/auth/register"
        : "http://localhost:3001/api/auth/login";
      const body = isRegisterMode
        ? {
            username: formData.userNameInput,
            password: formData.password,
            email: formData.email,
          }
        : { username: formData.userNameInput, password: formData.password };

      const response = await fetch(endpoint, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(body),
        credentials: "include",
      });

      const data = await response.json();
      if (!response.ok) {
        setError(
          data.message ||
            (isRegisterMode ? "Registration failed" : "Login failed")
        );
        return;
      }

      const testResponse = await fetch(
        "http://localhost:3001/api/auth/test-cookie",
        {
          credentials: "include",
        }
      );
      const testData = await testResponse.json();

      let { accessToken } = data;
      if (!accessToken && testData.accessToken) {
        accessToken = testData.accessToken;
      }

      if (accessToken) {
        setLoginPending(true);
        updateLoginStatus(true, accessToken, formData.userNameInput);
        setUserName(formData.userNameInput);
        localStorage.setItem("userName", formData.userNameInput);
      } else {
        setError("Authentication failed: token not received.");
      }
    } catch (err) {
      console.error(`${isRegisterMode ? "Registration" : "Login"} error:`, err);
      setError("Failed to connect to server. Please try again.");
    }
  };

  // Manejo de cambios en el formulario
  const handleInputChange = (e) => {
    const { name, value } = e.target;
    setFormData((prev) => ({ ...prev, [name]: value }));
  };

  // Toggle entre login y register
  const toggleMode = () => {
    setIsRegisterMode(!isRegisterMode);
    setError("");
    setFormData({ userNameInput: "", password: "", email: "" });
  };

  return {
    isLoggedIn,
    userName,
    isRegisterMode,
    formData,
    error,
    loginPending,
    handleSubmit,
    handleLogout,
    handleInputChange,
    toggleMode,
  };
};
