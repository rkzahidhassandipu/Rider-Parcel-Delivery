// PendingDelivery.jsx
import React from "react";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import Swal from "sweetalert2";
import useAxiosSecure from "../../../hooks/useAxiosSecure";
import useAuth from "../../../hooks/useAuth";
import { useTrackingLog } from "../../../hooks/useTrackingLog";

const statusColors = {
  rider_assigned: "bg-yellow-100 text-yellow-800",
  in_transit: "bg-blue-100 text-blue-800",
  delivered: "bg-green-100 text-green-800",
};

const formatStatus = (status) => {
  switch (status) {
    case "in_transit":
      return "Picked Up";
    case "rider_assigned":
      return "Rider Assigned";
    case "delivered":
      return "Delivered";
    default:
      return status.replace("_", " ");
  }
};

const PendingDelivery = () => {
  const { user } = useAuth();
  const axiosSecure = useAxiosSecure();
  const queryClient = useQueryClient();
  const { logTracking } = useTrackingLog();

  const {
    data: parcels = [],
    isLoading,
    isError,
  } = useQuery({
    queryKey: ["pendingParcels", user?.email],
    queryFn: async () => {
      const res = await axiosSecure.get(`/rider/parcels?email=${user.email}`);
      return res.data;
    },
    enabled: !!user?.email,
  });

  const { mutate: updateStatus, isLoading: isUpdating } = useMutation({
  mutationFn: async ({ parcel, newStatus }) => {
    const res = await axiosSecure.patch(`/parcels/update-status/${parcel._id}`, {
      delivery_status: newStatus,
    });

    // ✅ Log the tracking
    await logTracking({
      tracking_id: parcel.tracking_id, // use MongoDB _id
      status: newStatus,
      note: `Updated to ${newStatus} by ${user?.displayName || "Unknown"}`,
      actor: user?.email || "system",
    });

    return res.data;
  },
  onSuccess: async () => {
    queryClient.invalidateQueries(["pendingParcels", user?.email]);
    Swal.fire("✅ Updated!", "Parcel status updated successfully.", "success");
  },
  onError: (error) => {
    console.error("Update error:", error);
    Swal.fire("❌ Error", "Failed to update parcel status.", "error");
  },
});


 const handleStatusChange = async (parcel, newStatus) => {
  const confirm = await Swal.fire({
    title: `Mark as ${formatStatus(newStatus)}`,
    text: `Do you want to mark this parcel as "${formatStatus(newStatus)}"?`,
    icon: "question",
    showCancelButton: true,
    confirmButtonText: "Yes, update it",
  });

  if (confirm.isConfirmed) {
    updateStatus({ parcel, newStatus });
  }
};


  const filteredParcels = parcels.filter((parcel) =>
    ["rider_assigned", "in_transit"].includes(parcel.delivery_status)
  );

  if (isLoading) return <p className="text-center py-6">Loading parcels...</p>;

  if (isError)
    return (
      <p className="text-center text-red-600 font-semibold py-6">
        Failed to load parcels.
      </p>
    );

  if (filteredParcels.length === 0)
    return (
      <p className="text-center py-6 text-gray-700 font-medium">
        No pending or in-transit parcels found.
      </p>
    );

  return (
    <div className="max-w-7xl mx-auto px-4 py-8">
      <h2 className="text-3xl font-bold text-center mb-8">
        Pending Deliveries
      </h2>
      <div className="overflow-x-auto shadow-md border rounded-lg">
        <table className="min-w-full divide-y divide-gray-200 text-sm">
          <thead className="bg-gray-50">
            <tr>
              {[
                "Tracking ID",
                "Receiver",
                "Contact",
                "Address",
                "Status",
                "Action",
              ].map((header) => (
                <th
                  key={header}
                  className="px-6 py-3 text-left font-semibold text-gray-600 uppercase"
                >
                  {header}
                </th>
              ))}
            </tr>
          </thead>
          <tbody className="bg-white divide-y divide-gray-200">
            {filteredParcels.map((parcel) => (
              <tr key={parcel._id}>
                <td className="px-6 py-4 text-indigo-600">
                  {parcel.tracking_id}
                </td>
                <td className="px-6 py-4">{parcel.receiverName}</td>
                <td className="px-6 py-4">{parcel.receiverContact}</td>
                <td className="px-6 py-4">
                  {parcel.receiverAddress}, {parcel.receiverDistrict}
                </td>
                <td className="px-6 py-4">
                  <span
                    className={`inline-block px-2 py-1 rounded-full font-semibold ${
                      statusColors[parcel.delivery_status] ||
                      "bg-gray-200 text-gray-800"
                    }`}
                  >
                    {formatStatus(parcel.delivery_status)}
                  </span>
                </td>
                <td className="px-6 py-4 space-x-2">
                  {parcel.delivery_status === "rider_assigned" && (
                    <button
                      disabled={isUpdating}
                      className="px-4 py-2 bg-blue-600 text-white rounded hover:bg-blue-700"
                      onClick={() => handleStatusChange(parcel, "in_transit")}
                    >
                      Mark as Picked Up
                    </button>
                  )}
                  {parcel.delivery_status === "in_transit" && (
                    <button
                      disabled={isUpdating}
                      className="px-4 py-2 bg-green-600 text-white rounded hover:bg-green-700"
                      onClick={() => handleStatusChange(parcel, "delivered")}
                    >
                      Mark as Delivered
                    </button>
                  )}
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  );
};

export default PendingDelivery;
