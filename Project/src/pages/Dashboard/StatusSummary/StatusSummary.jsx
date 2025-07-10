import { useEffect, useState } from "react";
import {
  PieChart,
  Pie,
  Cell,
  Tooltip,
  Legend,
  ResponsiveContainer,
} from "recharts";
import {
  FaTruck,
  FaClipboardCheck,
  FaClock,
  FaQuestionCircle,
  FaBoxes,
} from "react-icons/fa";
import useAxiosSecure from "../../../hooks/useAxiosSecure";

// Icon mapping
const statusIcons = {
  pending: <FaClock className="text-yellow-500 text-3xl" />,
  rider_assigned: <FaTruck className="text-blue-500 text-3xl" />,
  delivered: <FaClipboardCheck className="text-green-600 text-3xl" />,
};

const bgColors = {
  pending: "bg-yellow-100",
  rider_assigned: "bg-blue-100",
  delivered: "bg-green-100",
};

const pieColors = {
  pending: "#facc15", // yellow-400
  rider_assigned: "#3b82f6", // blue-500
  delivered: "#16a34a", // green-600
};

const StatusSummary = () => {
  const [statusCounts, setStatusCounts] = useState([]);
  const [loading, setLoading] = useState(true);
  const axiosSecure = useAxiosSecure();

  useEffect(() => {
    const fetchStatusCounts = async () => {
      try {
        const res = await axiosSecure.get("/parcels/delivery-status-count");
        setStatusCounts(res.data);
      } catch (error) {
        console.error("Failed to fetch status counts", error);
      } finally {
        setLoading(false);
      }
    };

    fetchStatusCounts();
  }, [axiosSecure]);

  if (loading) {
    return (
      <div className="flex justify-center items-center h-40">
        <span className="loading loading-spinner text-primary"></span>
      </div>
    );
  }

  return (
    <div className="p-4">
      <h2 className="text-2xl font-bold mb-6 flex items-center gap-2">
        <FaBoxes className="text-primary" />
        Delivery Status Summary
      </h2>

      {/* Pie Chart */}
      <div className="w-full max-w-4xl mx-auto mb-10">
        <ResponsiveContainer width="100%" height={300}>
          <PieChart>
            <Pie
              data={statusCounts}
              dataKey="count"
              nameKey="delivery_status"
              cx="50%"
              cy="50%"
              outerRadius={100}
              label={({ name }) => name.replace(/_/g, " ")}
            >
              {statusCounts.map((entry, index) => (
                <Cell
                  key={index}
                  fill={pieColors[entry.delivery_status] || "#8884d8"}
                />
              ))}
            </Pie>
            <Tooltip />
            <Legend />
          </PieChart>
        </ResponsiveContainer>
      </div>

      {/* Card List */}
      {statusCounts.length === 0 ? (
        <div className="text-center text-gray-500">No delivery data found.</div>
      ) : (
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
          {statusCounts.map((status) => (
            <div
              key={status.delivery_status}
              className={`card shadow-md transition hover:scale-[1.02] duration-200 cursor-pointer ${
                bgColors[status.delivery_status] || "bg-gray-100"
              }`}
            >
              <div className="card-body flex flex-row items-center gap-4">
                <div>
                  {statusIcons[status.delivery_status] || (
                    <FaQuestionCircle className="text-gray-500 text-3xl" />
                  )}
                </div>
                <div>
                  <h2 className="card-title capitalize">
                    {status.delivery_status.replace(/_/g, " ")}
                  </h2>
                  <p className="text-2xl font-bold">{status.count}</p>
                </div>
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
};

export default StatusSummary;
