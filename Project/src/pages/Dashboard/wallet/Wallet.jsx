import React from "react";
import { useQuery } from "@tanstack/react-query";
import useAxiosSecure from "../../../hooks/useAxiosSecure";
import useAuth from "../../../hooks/useAuth";

const Wallet = () => {
  const { user } = useAuth();
  const axiosSecure = useAxiosSecure();

  const { data: parcels = [], isLoading, isError } = useQuery({
    queryKey: ["walletParcels", user?.email],
    queryFn: async () => {
      if (!user?.email) return [];
      const res = await axiosSecure.get(`/rider/parcels/delivered?email=${user.email}`);
      return res.data;
    },
    enabled: !!user?.email,
  });

  if (isLoading) return <p className="text-center py-6">Loading wallet...</p>;
  if (isError) return <p className="text-center py-6 text-red-600">Failed to load wallet data.</p>;

  const now = new Date();

  const isToday = (dateString) => {
    if (!dateString) return false;
    const d = new Date(dateString);
    return (
      d.getDate() === now.getDate() &&
      d.getMonth() === now.getMonth() &&
      d.getFullYear() === now.getFullYear()
    );
  };

  const isThisWeek = (dateString) => {
    if (!dateString) return false;
    const d = new Date(dateString);
    const start = new Date(now);
    start.setDate(now.getDate() - now.getDay() + 1);
    start.setHours(0, 0, 0, 0);

    const end = new Date(start);
    end.setDate(start.getDate() + 6);
    end.setHours(23, 59, 59, 999);

    return d >= start && d <= end;
  };

  const isThisMonth = (dateString) => {
    if (!dateString) return false;
    const d = new Date(dateString);
    return d.getMonth() === now.getMonth() && d.getFullYear() === now.getFullYear();
  };

  const isThisYear = (dateString) => {
    if (!dateString) return false;
    const d = new Date(dateString);
    return d.getFullYear() === now.getFullYear();
  };

  // 💰 Stats
  let totalBalance = 0;
  let todayEarnings = 0;
  let weeklyEarnings = 0;
  let monthlyEarnings = 0;
  let yearlyEarnings = 0;

  let totalCashOutCount = 0;
  let todayCashOutCount = 0;
  let cashOutBalance = 0;

  parcels.forEach((parcel) => {
    const parcelFee = parcel.cost || 100;
    const earning = parcelFee * 0.4;

    // Earnings from all delivered parcels
    totalBalance += earning;

    const deliveryDate = parcel.delivery_time;
    const cashOutDate = parcel.cashOut_time;

    if (isToday(deliveryDate)) todayEarnings += earning;
    if (isThisWeek(deliveryDate)) weeklyEarnings += earning;
    if (isThisMonth(deliveryDate)) monthlyEarnings += earning;
    if (isThisYear(deliveryDate)) yearlyEarnings += earning;

    if (parcel.cashed_out) {
      totalCashOutCount++;
      cashOutBalance += earning;

      if (isToday(cashOutDate)) todayCashOutCount++;
    }
  });

  return (
    <div className="max-w-5xl mx-auto p-6 bg-white rounded shadow space-y-6">
      <h2 className="text-2xl font-bold text-center mb-6">Wallet Summary</h2>

      <div className="grid grid-cols-1 sm:grid-cols-3 lg:grid-cols-4 gap-6 text-center">
        <StatCard title="Total Earnings" value={`৳${totalBalance.toFixed(2)}`} />
        <StatCard title="Cash Out Balance" value={`৳${cashOutBalance.toFixed(2)}`} />
        <StatCard title="Total Cash Outs" value={totalCashOutCount} />
        <StatCard title="Today's Cash Outs" value={todayCashOutCount} />
        <StatCard title="Today's Earnings" value={`৳${todayEarnings.toFixed(2)}`} />
        <StatCard title="Weekly Earnings" value={`৳${weeklyEarnings.toFixed(2)}`} />
        <StatCard title="Monthly Earnings" value={`৳${monthlyEarnings.toFixed(2)}`} />
        <StatCard title="Yearly Earnings" value={`৳${yearlyEarnings.toFixed(2)}`} />
      </div>
    </div>
  );
};

const StatCard = ({ title, value }) => (
  <div className="p-4 bg-gray-100 rounded shadow-sm">
    <h3 className="text-lg font-medium mb-2">{title}</h3>
    <p className="text-2xl font-bold">{value}</p>
  </div>
);

export default Wallet;
