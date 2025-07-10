import React, { useEffect, useState } from "react";
import useAxiosSecure from "../../../hooks/useAxiosSecure";

const RidersActive = () => {
  const axiosSecure = useAxiosSecure();
  const [activeRiders, setActiveRiders] = useState([]);
  console.log(activeRiders)

  useEffect(() => {
    axiosSecure.get("/riders/active")
      .then(res => {
        setActiveRiders(res.data);
      })
      .catch(error => {
        console.error("Failed to fetch active riders:", error);
      });
  }, []);

  return (
    <div className="p-6 bg-gray-50 min-h-screen">
      <h2 className="text-3xl font-bold mb-6 text-gray-700">✅ Active Riders</h2>

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
            </tr>
          </thead>
          <tbody>
            {activeRiders.length > 0 ? (
              activeRiders.map((rider, index) => (
                <tr key={rider._id}>
                  <td>{index + 1}</td>
                  <td>{rider.name}</td>
                  <td>{rider.email}</td>
                  <td>{rider.phone}</td>
                  <td>{rider.region}</td>
                  <td>{rider.district}</td>
                </tr>
              ))
            ) : (
              <tr>
                <td colSpan="6" className="text-center py-6 text-gray-500">
                  No active riders found.
                </td>
              </tr>
            )}
          </tbody>
        </table>
      </div>
    </div>
  );
};

export default RidersActive;
