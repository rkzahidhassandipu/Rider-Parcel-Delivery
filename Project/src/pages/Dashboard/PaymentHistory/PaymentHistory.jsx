import React from "react";
import useAuth from "../../../hooks/useAuth";
import useAxiosSecure from "../../../hooks/useAxiosSecure";
import { useQuery } from "@tanstack/react-query";
import Loading from "../../../Component/Loading/Loading";

const PaymentHistory = () => {
  const { user } = useAuth();
  const axiosSecure = useAxiosSecure();

  const { isPending, data: payments = [] } = useQuery({
    queryKey: ["payments", user?.email],
    queryFn: async () => {
      const res = await axiosSecure.get(`/payments?email=${user.email}`);
      return res.data.data; // Make sure you're returning `.data` if your API sends `{ success, data }`
    },
    enabled: !!user?.email, // prevent fetch if email is not loaded yet
  });

  if (isPending) return <Loading />;

  return (
    <div className="p-4 max-w-5xl mx-auto">
      <h2 className="text-2xl font-bold mb-4">💳 Payment History</h2>
      <div className="overflow-x-auto">
        <table className="table-auto w-full border border-gray-300">
          <thead className="bg-green-600 text-white">
            <tr>
              <th className="px-4 py-2">#</th>
              <th className="px-4 py-2">Amount</th>
              <th className="px-4 py-2">Transaction ID</th>
              <th className="px-4 py-2">Paid At</th>
              <th className="px-4 py-2">Parcel ID</th>
            </tr>
          </thead>
          <tbody>
            {payments.length === 0 ? (
              <tr>
                <td colSpan="5" className="text-center py-4 text-gray-500">
                  No payment history found.
                </td>
              </tr>
            ) : (
              payments.map((payment, index) => (
                <tr key={payment._id} className="border-t">
                  <td className="px-4 py-2">{index + 1}</td>
                  <td className="px-4 py-2">${payment.amount}</td>
                  <td className="px-4 py-2">{payment.transactionId}</td>
                  <td className="px-4 py-2">
                    {new Date(
                      payment.paid_at || payment.paid_at_string
                    ).toLocaleString()}
                  </td>
                  <td className="px-4 py-2">{payment.parcelId}</td>
                </tr>
              ))
            )}
          </tbody>
        </table>
      </div>
    </div>
  );
};

export default PaymentHistory;
