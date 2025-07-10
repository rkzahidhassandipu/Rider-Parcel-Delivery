import React, { useState } from "react";
import { useQuery } from "@tanstack/react-query";
import useAxiosSecure from "../../../hooks/useAxiosSecure";
import Swal from "sweetalert2";
import { useTrackingLog } from "../../../hooks/useTrackingLog";

const AssignRider = () => {
  const axiosSecure = useAxiosSecure();
  const [selectedParcel, setSelectedParcel] = useState(null);
  const [selectedRider, setSelectedRider] = useState(null)
  const [riders, setRiders] = useState([]);
  const [loadingRiders, setLoadingRiders] = useState(false);
  const { logTracking } = useTrackingLog();

  const {
    data: allParcels = [],
    isLoading,
    isError,
    error,
    refetch,
  } = useQuery({
    queryKey: ["parcels"],
    queryFn: async () => {
      const res = await axiosSecure.get("parcels");
      return res.data;
    },
  });

  // Filter to only paid or unpaid parcels
  const parcels = allParcels.filter(
    (p) =>
      p.payment_status === "paid" ||
      (p.payment_status === "unpaid" && p.delivery_status === "not_collected")
  );

  const handleAssign = async (parcel) => {
    setSelectedParcel(parcel);
    setLoadingRiders(true);
    try {
      const res = await axiosSecure.get(
        `/riders/by-district?district=${parcel.senderDistrict}`
      );
      setRiders(res.data);
    } catch (err) {
      Swal.fire("Error", "Failed to load riders", "error", err);
    } finally {
      setLoadingRiders(false);
      const modal = document.getElementById("assign_modal");
      if (modal) modal.showModal();
    }
  };

  const assignRiderToParcel = async (rider) => {
    if (!selectedParcel) return;

    try {
      setSelectedRider(rider)
      const res = await axiosSecure.patch(
        `/parcels/assign/${selectedParcel._id}`,
        {
          riderId: rider._id,
          riderName: rider?.name,
          riderEmail: rider?.email,
        }
      );

      if (res.data?.success) {
        Swal.fire("✅ Success", `Assigned ${rider.name} to parcel`, "success");
        document.getElementById("assign_modal").close();
        setSelectedParcel(null);
        setRiders([]);
        await refetch();

        await logTracking({
          tracking_id: selectedParcel.tracking_id,
          status: "rider_assigned",
          note: `Created by ${selectedRider.name}`,
          actor: selectedRider?.email || "system",
        });
      } else {
        Swal.fire("❌ Failed", res.data.message || "Could not assign", "error");
      }
    } catch (error) {
      console.error(error);
      Swal.fire("Error", "Something went wrong while assigning", "error");
    }
  };

  if (isLoading) return <p className="text-center py-10">Loading...</p>;
  if (isError)
    return (
      <p className="text-red-500 text-center py-10">
        Error: {error.message || "Failed to fetch parcels"}
      </p>
    );

  return (
    <div className="p-6 bg-gray-50 min-h-screen">
      <h2 className="text-2xl font-bold mb-4">📦 Unassigned Parcels</h2>

      <div className="overflow-x-auto">
        <table className="table w-full bg-white shadow rounded">
          <thead className="bg-gray-100 text-gray-700">
            <tr>
              <th>#</th>
              <th>Parcel ID</th>
              <th>Sender</th>
              <th>Receiver</th>
              <th>Amount</th>
              <th>Payment</th>
              <th>Delivery</th>
              <th>Action</th>
            </tr>
          </thead>
          <tbody>
            {parcels.length > 0 ? (
              parcels.map((parcel, index) => (
                <tr key={parcel._id}>
                  <td>{index + 1}</td>
                  <td>{parcel._id}</td>
                  <td>{parcel.senderName}</td>
                  <td>{parcel.receiverName}</td>
                  <td>${parcel.cost}</td>
                  <td>
                    {parcel.payment_status === "paid" ? "Paid" : "Unpaid"}
                  </td>
                  <td className="capitalize">{parcel.delivery_status}</td>
                  <td>
                    <button
                      onClick={() => handleAssign(parcel)}
                      className="btn btn-sm bg-blue-500 text-white hover:bg-blue-600"
                    >
                      Assign Rider
                    </button>
                  </td>
                </tr>
              ))
            ) : (
              <tr>
                <td colSpan="8" className="text-center py-6 text-gray-500">
                  No paid or unpaid parcels found.
                </td>
              </tr>
            )}
          </tbody>
        </table>
      </div>

      {/* Assign Rider Modal */}
      <dialog id="assign_modal" className="modal">
        <div className="modal-box bg-white max-w-md">
          <h3 className="font-bold text-lg mb-2">Assign Rider</h3>
          {selectedParcel && (
            <>
              <p className="mb-4">
                Parcel: <strong>{selectedParcel._id}</strong> <br />
                Service Center: <strong>{selectedParcel.service_center}</strong>
              </p>
              {loadingRiders ? (
                <p>Loading riders...</p>
              ) : riders.length > 0 ? (
                <ul className="space-y-2">
                  {riders.map((rider) => (
                    <li
                      key={rider._id}
                      className="flex justify-between items-center border p-2 rounded"
                    >
                      <span>
                        {rider.name} ({rider.email})
                      </span>
                      <button
                        className="btn btn-sm bg-green-500 text-white"
                        onClick={() => assignRiderToParcel(rider)}
                      >
                        Assign
                      </button>
                    </li>
                  ))}
                </ul>
              ) : (
                <p>No riders found in this district.</p>
              )}
            </>
          )}
          <div className="modal-action">
            <form method="dialog">
              <button className="btn">Close</button>
            </form>
          </div>
        </div>
      </dialog>
    </div>
  );
};

export default AssignRider;
