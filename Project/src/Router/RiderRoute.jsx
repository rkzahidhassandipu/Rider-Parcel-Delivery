import { Navigate, useLocation } from "react-router";
import useUserRole from "../hooks/useUserRole";
import useAuth from "../hooks/useAuth";
import Loading from "../Component/Loading/Loading";

const RiderRoute = ({ children }) => {
  const { user, loading } = useAuth();
  const { role, roleLoading } = useUserRole();
  const location = useLocation();

  if (loading || roleLoading) {
    return <Loading />;
  }
  if (!user || role !== "rider") {
    return <Navigate to="/forbidden" state={{ from: location }} replace />;
  }

  return children;
};
export default RiderRoute;