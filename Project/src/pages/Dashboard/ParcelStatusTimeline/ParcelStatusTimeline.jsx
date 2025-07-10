import React from "react";
import { useParams } from "react-router";
import { useQuery } from "@tanstack/react-query";
import useAuth from "../../../hooks/useAuth";
import useAxiosSecure from "../../../hooks/useAxiosSecure";

const ParcelStatusTimeline = () => {
  const { trackingId } = useParams(); // get from route
  const { user } = useAuth();
  const axiosSecure = useAxiosSecure();

  const {
    data: logs = [],
    isLoading,
    isError,
    error,
  } = useQuery({
    queryKey: ["trackingLogs", trackingId, user?.email],
    enabled: !!trackingId && !!user?.email,
    queryFn: async () => {
      const res = await axiosSecure.get(`/tracking/${trackingId}?email=${user.email}`);
      return res.data;
    },
  });

  if (isLoading) return <p className="text-center py-6">Loading tracking info...</p>;
  if (isError)
    return (
      <p className="text-center text-red-500 py-6">
        {error?.response?.data?.message || "Error loading tracking info"}
      </p>
    );

  if (logs.length === 0)
    return <p className="text-center py-6 text-gray-600">No tracking data found.</p>;

  return (
    <div className="max-w-2xl mx-auto px-4 py-8">
      <h2 className="text-2xl font-bold mb-6">📦 Parcel Status Timeline</h2>
      <div className="space-y-4">
        {logs.map((log) => (
          <div key={log._id} className="flex items-start gap-2">
            <div className="mt-1 w-3 h-3 bg-blue-600 rounded-full"></div>
            <div>
              <p className="text-sm font-semibold capitalize">{log.status.replace(/_/g, " ")}</p>
              <p className="text-xs text-gray-600">{log.note}</p>
              <p className="text-xs text-gray-400">
                {new Date(log.timestamp).toLocaleString()} — {log.actor}
              </p>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
};

export default ParcelStatusTimeline;
