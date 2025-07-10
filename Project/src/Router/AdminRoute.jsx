import { Navigate, useLocation } from "react-router";
import useUserRole from "../hooks/useUserRole";
import useAuth from "../hooks/useAuth";
import Loading from "../Component/Loading/Loading";

const AdminRoute = ({ children }) => {
  const { user, loading } = useAuth();
  const { role, roleLoading } = useUserRole();
  const location = useLocation();
  console.log(loading, roleLoading)

  if (loading || roleLoading) {
    return <Loading />;
  }
console.log(role)
  if (!user || role !== "admin") {
    return <Navigate to="/forbidden" state={{ from: location }} replace />;
  }

  return children;
};
export default AdminRoute;