import React, { useEffect, useState } from "react";
import useAxiosSecure from "../../../hooks/useAxiosSecure";
import Swal from "sweetalert2";

const PendingRiders = () => {
  const axiosSecure = useAxiosSecure();
  const [riders, setRiders] = useState([]);

  // Fetch pending riders from the backend
  const fetchPendingRiders = async () => {
    try {
      const res = await axiosSecure.get("/riders/pending");
      setRiders(res.data);
    } catch (error) {
      console.error("Error fetching pending riders:", error);
    }
  };

  // Approve rider
  const handleStatusChange = async (id, newStatus) => {
  try {
    const res = await axiosSecure.patch(`/riders/status/${id}`, { status: newStatus });
    if (res.data.modifiedCount > 0) {
      Swal.fire(
        "✅ Updated",
        `Rider has been ${newStatus === "approved" ? "approved" : "rejected"}.`,
        "success"
      );
      fetchPendingRiders(); // refresh the table
    }
  } catch (error) {
    console.error("Status update failed:", error);
    Swal.fire("❌ Failed", "Unable to update status", "error");
  }
};


  useEffect(() => {
    fetchPendingRiders();
  }, []);

  return (
    <div className="p-6 bg-gray-50 min-h-screen">
      <h2 className="text-3xl font-bold mb-6 text-gray-700">
        🕓 Pending Riders
      </h2>

      <div className="overflow-x-auto shadow rounded">
        <table className="table w-full bg-white">
          <thead className="bg-gray-100 text-gray-700">
            <tr>
              <th>#</th>
              <th>Name</th>
              <th>Email</th>
              <th>Phone</th>
              <th>Region</th>
              <th>District</th>
              <th>Action</th>
            </tr>
          </thead>
          <tbody>
            {riders.length > 0 ? (
              riders.map((rider, index) => (
                <tr key={rider._id}>
                  <td>{index + 1}</td>
                  <td>{rider.name}</td>
                  <td>{rider.email}</td>
                  <td>{rider.phone}</td>
                  <td>{rider.region}</td>
                  <td>{rider.district}</td>
                  <td>
                    <select
                      defaultValue="pending"
                      onChange={(e) =>
                        handleStatusChange(rider._id, e.target.value)
                      }
                      className="select select-sm select-bordered"
                    >
                      <option value="pending" disabled>
                        Pending
                      </option>
                      <option value="approved">Approve</option>
                      <option value="rejected">Reject</option>
                    </select>
                  </td>
                </tr>
              ))
            ) : (
              <tr>
                <td colSpan="7" className="text-center py-6 text-gray-500">
                  No pending riders found.
                </td>
              </tr>
            )}
          </tbody>
        </table>
      </div>
    </div>
  );
};

export default PendingRiders;
