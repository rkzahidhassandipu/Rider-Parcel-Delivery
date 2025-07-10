import React from "react";
import AuthImage from "../../../assets/authImage.png";
import { Outlet } from "react-router";
import Login from "../../../pages/Authentication/Login/Login";
import Logo from "../../../Component/Logo/Logo";

const AuthLayout = () => {
  return (
    <div className="bg-base-200 w-4/5 mx-auto min-h-screen">
      <div className="pt-8">
        <Logo />
      </div>
      <div className="grid grid-cols-1 lg:grid-cols-2 items-center justify-center w-full gap-6">
        <div className="text-center">
          <Outlet />
        </div>
        <div className="flex justify-center bg-[#FAFDF0]">
          <img
            src={AuthImage}
            className="max-w-sm rounded-lg"
            alt="Auth Illustration"
          />
        </div>
      </div>
    </div>
  );
};

export default AuthLayout;
