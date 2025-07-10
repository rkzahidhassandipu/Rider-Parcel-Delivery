
import useAuth from "./useAuth";
import useAxiosSecure from "./useAxiosSecure";
import { useQuery } from "@tanstack/react-query";

const useUserRole = () => {
  const {user, loading} = useAuth();
  // const [role, setRole] = useState(null);
  // const [roleLoading, setRoleLoading] = useState(true);
  const axiosSecure = useAxiosSecure();

  const {data: role="user", isLoading, refetch}= useQuery({
    queryKey: ["userRole", user?.email],
    enabled: !!user?.email,
    queryFn: async () => {
      const res = await axiosSecure.get(`/users/role?email=${user.email}`)
      return res.data.role
    }
  })


  return { role, roleLoading: isLoading, refetch };
};

export default useUserRole;
