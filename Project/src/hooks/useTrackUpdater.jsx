// src/hooks/useTrackUpdater.js
import { useState } from "react";
import useAxiosSecure from "./useAxiosSecure";

const useTrackUpdater = () => {
  const axiosSecure = useAxiosSecure();
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);
  const [successMsg, setSuccessMsg] = useState("");

  const updateTracking = async ({ tracking_id, parcelId, status, location }) => {
    setLoading(true);
    setError(null);
    setSuccessMsg("");

    try {
      const response = await axiosSecure.post("/tracking", {
        tracking_id,
        parcelId,
        status,
        location,
      });

      if (response.data.success) {
        setSuccessMsg("Tracking update added successfully.");
      } else {
        setError("Tracking update failed.");
      }
    } catch (err) {
      setError(err.response?.data?.message || "Error updating tracking.");
    } finally {
      setLoading(false);
    }
  };

  return {
    updateTracking,
    loading,
    error,
    successMsg,
  };
};

export default useTrackUpdater;
