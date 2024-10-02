import { useAuth } from "../hooks/useAuth";
import { Navigate, Outlet } from "react-router-dom";

const ProtectedRoute = () => {
  const { isAuth, isLoading } = useAuth();

  if (isLoading) return <div>... loading</div>;

  if (isAuth) return <Outlet />;

  return <Navigate to="/login" />;
};

export default ProtectedRoute;
