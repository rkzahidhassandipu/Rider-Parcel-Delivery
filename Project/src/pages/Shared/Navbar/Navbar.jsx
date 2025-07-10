import React from "react";
import { Link, NavLink } from "react-router";
import Logo from "../../../Component/Logo/Logo";
import useAuth from "../../../hooks/useAuth";

const Navbar = () => {
  const { user, logOut } = useAuth();

  const handleLogOut = () => {
    logOut()
    .then(res => console.log(res))
    .catch(error => console.log(error))
  }

  const navItems = (
    <>
      <li>
        <NavLink to="/">Home</NavLink>
      </li>
      <li>
        <NavLink to="/about">About</NavLink>
      </li>
      <li>
        <NavLink to="/coverage">Coverage</NavLink>
      </li>
      <li>
        <NavLink to="/sendparcel">Send a Parcel</NavLink>
      </li>
      {user && (
        <>
          <li>
            <NavLink to="/dashboard">Dashboard</NavLink>
          </li>
          <li>
            <NavLink to="/beARider">Be a Rider</NavLink>
          </li>
        </>
      )}
    </>
  );
  return (
    <div className="navbar bg-white rounded-xl mb-10">
      <div className="navbar-start  ">
        <div className="dropdown">
          <div tabIndex={0} role="button" className="btn btn-ghost lg:hidden">
            <svg
              xmlns="http://www.w3.org/2000/svg"
              className="h-5 w-5"
              fill="none"
              viewBox="0 0 24 24"
              stroke="currentColor"
            >
              {" "}
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                strokeWidth="2"
                d="M4 6h16M4 12h8m-8 6h16"
              />{" "}
            </svg>
          </div>
          <ul
            tabIndex={0}
            className="menu menu-sm dropdown-content bg-base-100 rounded-box z-1 mt-3 w-52 p-2 shadow"
          >
            {navItems}
          </ul>
        </div>
        <div>
          <Logo />
        </div>
      </div>
      <div className="navbar-center hidden lg:flex">
        <ul className="menu menu-horizontal px-1">{navItems}</ul>
      </div>
      <div className="navbar-end gap-5">
        {user ? (
          <>
            <button onClick={handleLogOut} className="border cursor-pointer rounded-2xl border-gray-300 px-7 py-2 font-semibold">Log Out</button>
          </>
        ) : (
          <>
            <Link
              to="/login"
              className="border rounded-2xl border-gray-300 px-7 py-2 font-semibold"
            >
              Login
            </Link>
            <Link
              className="border bg-amber-200 rounded-2xl border-gray-300 px-7 py-2 font-semibold"
              to="/register"
            >
              Register
            </Link>
          </>
        )}
      </div>
    </div>
  );
};

export default Navbar;
// i need create a page called coverage there will have a title we are available in 64 districts below it will be a search box where i can search name of different district in bangladesh (will tel you details about search box later) first give me a map that i can show in the website that will show a location explain the code details
