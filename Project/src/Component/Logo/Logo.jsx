import React from "react";
import logo from "../../assets/logo.png";
import { Link } from "react-router";

const Logo = () => {
  return (
    <Link to={"/"} className="flex gap-2 items-end">
      <img className="" src={logo} alt="" />
      <h2 className="text-2xl font-bold">ProFast</h2>
    </Link>
  );
};

export default Logo;
