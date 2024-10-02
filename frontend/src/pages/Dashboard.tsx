import { useAuth } from "../hooks/useAuth";

const Dashboard = () => {
  const { logout } = useAuth();
  return (
    <div>
      <div>Dashboard</div>
      <button onClick={() => logout()}>logout</button>
    </div>
  );
};

export default Dashboard;
