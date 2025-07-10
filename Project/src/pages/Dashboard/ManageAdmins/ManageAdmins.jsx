import React, { useState } from "react";
import useAxiosSecure from "../../../hooks/useAxiosSecure";
import Swal from "sweetalert2";

const ManageAdmins = () => {
  const axiosSecure = useAxiosSecure();
  const [searchEmail, setSearchEmail] = useState("");
  const [user, setUser] = useState(null);

  const handleSearch = async (e) => {
    e.preventDefault();
    try {
      const res = await axiosSecure.get(`/users/search?email=${searchEmail}`);
      if (res.data.length > 0) {
        setUser(res.data[0]);
      } else {
        Swal.fire("❌", "No user found", "error");
        setUser(null);
      }
    } catch (err) {
      Swal.fire("❌", err.response?.data?.message || "Search failed", "error");
      setUser(null);
    }
  };

  const changeRole = async (newRole) => {
    try {
      await axiosSecure.patch("/users/role", {
        email: user.email,
        role: newRole,
      });
      Swal.fire("✅ Success", `User role updated to "${newRole}"`, "success");
      setUser({ ...user, role: newRole });
    } catch (err) {
      Swal.fire("❌ Failed", "Unable to update role", "error");
    }
  };

  return (
    <div className="min-h-screen bg-gray-100 px-4 py-10">
      <div className="max-w-4xl mx-auto bg-white rounded-xl shadow-lg p-8">
        <h2 className="text-3xl font-bold text-gray-800 mb-6">
          🔎 Search & Manage Admins
        </h2>

        {/* Search Form */}
        <form onSubmit={handleSearch} className="flex gap-3 mb-6">
          <input
            type="email"
            required
            placeholder="Search by email"
            value={searchEmail}
            onChange={(e) => setSearchEmail(e.target.value)}
            className="input input-bordered w-full max-w-md"
          />
          <button type="submit" className="btn btn-primary">
            Search
          </button>
        </form>

        {/* Results Table */}
        {user && (
          <div className="overflow-x-auto mt-4">
            <table className="table w-full border border-gray-200">
              <thead className="bg-gray-100 text-gray-700">
                <tr>
                  <th>Email</th>
                  <th>Role</th>
                  <th>Created At</th>
                  <th>Action</th>
                </tr>
              </thead>
              <tbody>
                <tr className="hover">
                  <td>{user.email}</td>
                  <td>
                    <span
                      className={`px-2 py-1 rounded text-sm font-medium ${
                        user.role === "admin"
                          ? "bg-green-100 text-green-700"
                          : "bg-yellow-100 text-yellow-700"
                      }`}
                    >
                      {user.role}
                    </span>
                  </td>
                  <td>{new Date(user.create_at).toLocaleString()}</td>
                  <td>
                    {user.role !== "admin" ? (
                      <button
                        onClick={() => changeRole("admin")}
                        className="inline-flex items-center gap-2 px-4 py-2 rounded-lg bg-blue-600 text-white text-sm font-medium hover:bg-blue-700 transition duration-200 shadow-sm"
                      >
                        👑 Make Admin
                      </button>
                    ) : (
                      <button
                        onClick={() => changeRole("user")}
                        className="inline-flex items-center gap-2 px-4 py-2 rounded-lg bg-red-500 text-white text-sm font-medium hover:bg-red-600 transition duration-200 shadow-sm"
                      >
                        🧹 Remove Admin
                      </button>
                    )}
                  </td>
                </tr>
              </tbody>
            </table>
          </div>
        )}
      </div>
    </div>
  );
};

export default ManageAdmins;
