import React from "react";
import useAuth from "../../../hooks/useAuth";
import useAxiosSecure from "../../../hooks/useAxiosSecure";
import { useQuery } from "@tanstack/react-query";
import Swal from "sweetalert2";
import { FaEye, FaTrash, FaMoneyBillWave } from "react-icons/fa";
import { useNavigate } from "react-router";

const MyParcels = () => {
  const { user } = useAuth();
  const axiosSecure = useAxiosSecure();
  const navigate = useNavigate()

  const {
    data: parcels = [],
    isLoading,
    isError,
    error,
    refetch,
  } = useQuery({
    queryKey: ["my-parcels", user?.email],
    enabled: !!user?.email,
    queryFn: async () => {
      const res = await axiosSecure.get(`/parcels?email=${user.email}`);

      return res.data;
    },
  });

  const handleView = (parcel) => {
    Swal.fire({
      title: `Tracking ID: ${parcel.tracking_id}`,
      html: `
        <p><strong>Type:</strong> ${parcel.parcelType}</p>
        <p><strong>Cost:</strong> ৳${parcel.cost}</p>
        <p><strong>Created:</strong> ${new Date(
          parcel.creation_date
        ).toLocaleString()}</p>
        <p><strong>Status:</strong> ${parcel.payment_status}</p>
      `,
      icon: "info",
    });
  };

  const handlePay = (parcel) => {
    // Swal.fire({
    //   title: "Payment Confirmed",
    //   text: `You have paid ৳${parcel.cost} for ${parcel.parcelType}`,
    //   icon: "success",
    // });
    // // 🔁 In real app: axiosSecure.patch or post to mark as paid
    // refetch();
    navigate(`/dashboard/payment/${parcel._id}`);

  };

  const handleDeleteParcel = (parcelId) => {
    Swal.fire({
      title: "Are you sure?",
      text: "This parcel will be permanently deleted!",
      icon: "warning",
      showCancelButton: true,
      confirmButtonColor: "#d33",
      cancelButtonColor: "#6b7280",
      confirmButtonText: "Yes, delete it!",
      cancelButtonText: "Cancel",
    }).then((result) => {
      if (result.isConfirmed) {
        axiosSecure
          .delete(`/parcels/${parcelId}`)
          .then((res) => {
            if (res.data.deletedCount === 1 || res.data.success) {
              Swal.fire({
                title: "Deleted!",
                text: "Parcel has been deleted successfully.",
                icon: "success",
                timer: 1500,
                showConfirmButton: false,
              });
              refetch(); // Refresh the parcel list
            } else {
              Swal.fire(
                "Error",
                "Parcel not found or already deleted.",
                "error"
              );
            }
          })
          .catch((err) => {
            console.error("Delete failed:", err);
            Swal.fire("Error", "Something went wrong while deleting.", "error");
          });
      }
    });
  };

  if (isLoading)
    return <div className="text-center py-10">Loading parcels...</div>;
  if (isError)
    return <div className="text-red-500">Error: {error.message}</div>;

  return (
    <div className="p-4">
      <h2 className="text-2xl font-semibold mb-4">📦 My Parcels</h2>
      <div className="overflow-x-auto rounded-lg shadow">
        <table className="table table-zebra w-full">
          <thead className="bg-base-200">
            <tr>
              <th>#</th>
              <th>Type</th>
              <th>Created At</th>
              <th>Cost</th>
              <th>Payment</th>
              <th>Actions</th>
            </tr>
          </thead>
          <tbody>
            {parcels.map((parcel, idx) => (
              <tr key={parcel._id}>
                <td>{idx + 1}</td>
                <td>
                  <span
                    className={`badge ${
                      parcel.parcelType === "Document"
                        ? "badge-accent"
                        : "badge-warning"
                    }`}
                  >
                    {parcel.parcelType}
                  </span>
                </td>
                <td>{new Date(parcel.creation_date).toLocaleString()}</td>
                <td>৳{parcel.cost}</td>

                <td>
                  <span
                    className={`badge px-3 py-1 font-semibold rounded-md ${
                      parcel.payment_status === "paid"
                        ? "bg-green-500 text-white"
                        : "bg-red-500 text-white"
                    }`}
                  >
                    {parcel.payment_status}
                  </span>
                </td>
                <td className="flex flex-wrap gap-2">
                  <button
                    onClick={() => handleView(parcel)}
                    className="btn btn-sm bg-blue-500 hover:bg-blue-600 text-white border-none"
                  >
                    <FaEye />
                  </button>
                  {parcel.payment_status === "unpaid" && (
                    <button
                      onClick={() => handlePay(parcel)}
                      className="btn btn-sm bg-green-500 hover:bg-green-600 text-white border-none"
                    >
                      <FaMoneyBillWave />
                    </button>
                  )}
                  <button
                    onClick={() => handleDeleteParcel(parcel._id)}
                    className="btn btn-sm bg-red-500 hover:bg-red-600 text-white border-none"
                  >
                    <FaTrash />
                  </button>
                </td>
              </tr>
            ))}
            {parcels.length === 0 && (
              <tr>
                <td colSpan="6" className="text-center text-gray-500 py-4">
                  No parcels found.
                </td>
              </tr>
            )}
          </tbody>
        </table>
      </div>
    </div>
  );
};

export default MyParcels;
