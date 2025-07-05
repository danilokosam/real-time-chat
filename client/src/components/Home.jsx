import { LoggedInView } from "./LoggedInView";
import { AuthForm } from "./AuthForm";
import { useAuth } from "../hooks/useAuth";

export const Home = () => {
  const {
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
  } = useAuth();

  return isLoggedIn ? (
    <LoggedInView userName={userName} handleLogout={handleLogout} />
  ) : (
    <AuthForm
      isRegisterMode={isRegisterMode}
      toggleMode={toggleMode}
      handleSubmit={handleSubmit}
      userNameInput={formData.userNameInput}
      setUserNameInput={(value) =>
        handleInputChange({ target: { name: "userNameInput", value } })
      }
      email={formData.email}
      setEmail={(value) =>
        handleInputChange({ target: { name: "email", value } })
      }
      password={formData.password}
      setPassword={(value) =>
        handleInputChange({ target: { name: "password", value } })
      }
      error={error}
      loginPending={loginPending}
    />
  );
};
