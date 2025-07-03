import { NavLink } from "react-router-dom";
import {
  HomeIcon,
  LogOutIcon,
  MessageIcon,
  PhoneIcon,
  UserPlusIcon,
} from "../assets/Icons";

export const NavBar = () => {
  return (
    <div className="bg-white shadow-2xl flex flex-col gap-8 py-4 rounded-2xl">
      {/* //userImage */}
      <img
        className="rounded-full mx-auto mt-6 max-w-12"
        src="https://placehold.co/40x40@2x.png"
        alt="image profile"
      />

      <nav className="flex flex-col gap-4 ">
        <NavLink
          to={"/homepage"}
          className={({ isActive }) =>
            `ml-3 rounded-s-md pl-2 py-2  ${
              isActive ? "bg-violet-primary" : ""
            }`
          }
        >
          {/* <span className="md:hidden">Home</span>{" "} */}
          <HomeIcon classList={"size-6 text-gray-800"} />{" "}
        </NavLink>

        <NavLink
          to={"/chat"}
          className={({ isActive }) =>
            `ml-3 rounded-s-md pl-2 py-2 ${isActive ? "bg-violet-primary" : ""}`
          }
        >
          {/* Chat  */}
          <MessageIcon classList={"size-6 text-gray-800"} />
        </NavLink>

        <NavLink
          to={"/call"}
          className={({ isActive }) =>
            `ml-3 rounded-s-md pl-2 py-2 ${isActive ? "bg-violet-primary" : ""}`
          }
        >
          <PhoneIcon classList={"size-6 text-gray-800"} />{" "}
        </NavLink>

        <NavLink
          to={"/"}
          className={({ isActive }) =>
            `ml-3 rounded-s-md pl-2 py-2 ${isActive ? "bg-violet-primary" : ""}`
          }
        >
          {/* Login */}
          <UserPlusIcon classList={"size-6 text-gray-800"} />
        </NavLink>

        <NavLink
          to={"/"}
          className={({ isActive }) =>
            ` ml-3 rounded-s-md pl-2 py-2 ${
              isActive ? "bg-violet-primary" : ""
            }`
          }
        >
          {/* <span className="md:hidden">Logout</span>{" "} */}
          <LogOutIcon classList={"size-6 text-gray-800"} />{" "}
        </NavLink>
      </nav>
    </div>
  );
};
