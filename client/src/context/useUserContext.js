import { useContext } from "react";
import { UserContext } from "./UserContextInstance";

export const useUserContext = () => useContext(UserContext);
