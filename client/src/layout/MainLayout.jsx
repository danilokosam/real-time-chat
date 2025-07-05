import { NavBar } from "../components/NavBar";

export const MainLayout = ({ children }) => {
  return (
    <div className=" grid grid-cols-[64px_1fr] grid-rows-[1fr] gap-4 p-4">
      <NavBar />
      <div>{children}</div>
    </div>
  );
};
