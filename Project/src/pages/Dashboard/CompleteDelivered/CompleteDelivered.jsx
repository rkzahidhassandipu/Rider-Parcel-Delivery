import React from "react";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import useAxiosSecure from "../../../hooks/useAxiosSecure";
import useAuth from "../../../hooks/useAuth";
import Swal from "sweetalert2";

const statusColors = {
  delivered: "bg-green-100 text-green-800",
};

const CompleteDelivered = () => {
  const { user } = useAuth();
  const axiosSecure = useAxiosSecure();
  const queryClient = useQueryClient();

  const { data: parcels = [], isLoading, isError } = useQuery({
    queryKey: ["deliveredParcels", user?.email],
    queryFn: async () => {
      const res = await axiosSecure.get(
        `/rider/parcels/delivered?email=${user.email}`
      );
      return res.data;
    },
    enabled: !!user?.email,
  });

  const deliveredParcels = parcels.filter(
    (parcel) => parcel.delivery_status === "delivered"
  );

  // ✅ Mutation to cash out a parcel
  const { mutate: cashOut, isPending } = useMutation({
    mutationFn: async (parcelId) => {
      const res = await axiosSecure.patch(`/parcels/cash-out/${parcelId}`);
      return res.data;
    },
    onSuccess: () => {
      queryClient.invalidateQueries(["deliveredParcels", user?.email]);
      Swal.fire("✅ Cashed Out", "Earning marked as cashed out", "success");
    },
    onError: () => {
      Swal.fire("❌ Error", "Failed to cash out", "error");
    },
  });

  const handleCashOut = (parcel) => {
    Swal.fire({
      title: `Cash Out ৳${(parcel.cost * 0.4).toFixed(2)}?`,
      icon: "question",
      showCancelButton: true,
      confirmButtonText: "Yes, confirm",
    }).then((result) => {
      if (result.isConfirmed) {
        cashOut(parcel._id);
      }
    });
  };

  if (isLoading) return <p className="text-center py-6">Loading parcels...</p>;
  if (isError)
    return (
      <p className="text-center text-red-600 font-semibold py-6">
        Failed to load parcels.
      </p>
    );
  if (!deliveredParcels.length)
    return (
      <p className="text-center py-6 text-gray-700 font-medium">
        No delivered parcels found.
      </p>
    );

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
      <h2 className="text-3xl font-extrabold text-gray-900 mb-8 text-center">
        Delivered Parcels
      </h2>
      <div className="overflow-x-auto rounded-lg shadow-md border border-gray-200">
        <table className="min-w-full divide-y divide-gray-200">
          <thead className="bg-gray-50">
            <tr>
              {[
                "Tracking ID",
                "Receiver",
                "Sender",
                "Address",
                "Fee ৳",
                "Earning ৳",
                "Status",
                "Action",
              ].map((header) => (
                <th
                  key={header}
                  className="px-6 py-3 text-left text-xs font-semibold text-gray-500 uppercase tracking-wider"
                >
                  {header}
                </th>
              ))}
            </tr>
          </thead>
          <tbody className="bg-white divide-y divide-gray-200">
            {deliveredParcels.map((parcel, idx) => {
              const parcelFee = parcel.cost || 100;
              const earning = (parcelFee * 0.4).toFixed(2);
              const isCashedOut = parcel.cashed_out === true;

              return (
                <tr
                  key={parcel._id}
                  className={idx % 2 === 0 ? "bg-white" : "bg-gray-50"}
                >
                  <td className="px-6 py-4 text-sm font-medium text-indigo-600">
                    {parcel.tracking_id}
                  </td>
                  <td className="px-6 py-4 text-sm">{parcel.receiverName}</td>
                  <td className="px-6 py-4 text-sm">
                    {parcel.senderName || "N/A"}
                  </td>
                  <td className="px-6 py-4 text-sm">
                    {parcel.receiverAddress}, {parcel.receiverDistrict}
                  </td>
                  <td className="px-6 py-4 text-sm text-blue-800 font-semibold">
                    ৳{parcelFee}
                  </td>
                  <td className="px-6 py-4 text-sm text-green-700 font-semibold">
                    ৳{earning}
                  </td>
                  <td className="px-6 py-4">
                    <span
                      className={`inline-flex px-2 py-1 text-xs font-semibold rounded-full ${
                        statusColors["delivered"]
                      }`}
                    >
                      Delivered
                    </span>
                  </td>
                  <td className="px-6 py-4">
                    {isCashedOut ? (
                      <span className="text-green-600 font-semibold">
                        Cashed Out
                      </span>
                    ) : (
                      <button
                        disabled={isPending}
                        onClick={() => handleCashOut(parcel)}
                        className="px-3 py-1 bg-purple-600 text-white rounded hover:bg-purple-700"
                      >
                        Cash Out
                      </button>
                    )}
                  </td>
                </tr>
              );
            })}
          </tbody>
        </table>
      </div>
    </div>
  );
};

export default CompleteDelivered;
