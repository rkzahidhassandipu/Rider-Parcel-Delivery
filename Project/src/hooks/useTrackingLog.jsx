// hooks/useTrackingLog.js
import useAxiosSecure from "./useAxiosSecure";

export const useTrackingLog = () => {
  const axiosSecure = useAxiosSecure();

  const logTracking = async ({ tracking_id, status, note, actor }) => {
    try {
      const res = await axiosSecure.post("/tracking", {
        tracking_id,
        status,
        note,
        actor,
      });
      return res.data;
    } catch (err) {
      console.error("❌ Failed to add tracking log:", err);
      throw err;
    }
  };

  return { logTracking };
};
