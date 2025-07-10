import React from "react";
import { Link } from "react-router";
import { FaLock } from "react-icons/fa";

const Forbidden = () => {
  return (
    <div className="min-h-screen flex flex-col justify-center items-center bg-gray-100 px-4">
      <div className="text-center max-w-md">
        <FaLock className="text-7xl text-red-500 mb-4 mx-auto" />
        <h1 className="text-4xl font-bold text-gray-800 mb-2">403 - Forbidden</h1>
        <p className="text-gray-600 mb-6">
          You don't have permission to access this page. Please go back or login with an authorized account.
        </p>
        <Link
          to="/"
          className="inline-block bg-blue-600 text-white px-6 py-2 rounded hover:bg-blue-700 transition"
        >
          Go Home
        </Link>
      </div>
    </div>
  );
};

export default Forbidden;
