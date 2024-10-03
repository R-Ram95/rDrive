import { useAuth } from "../hooks/useAuth";

const Dashboard = () => {
  const { logout } = useAuth();
  return (
    <div className="h-full overflow-clip bg-custom-blue">
      <header className="flex justify-between  px-10 py-4 bg-cover bg-[url('/image.jpeg')]">
        <h1 className="text-2xl font-semibold text-white">r/Drive</h1>
        <div className=" border px-3 py-1 rounded-xl font-medium backdrop-blur-xl shadow-2xl border-white/50">
          <button className="text-white" onClick={() => logout()}>
            Logout
          </button>
        </div>
      </header>
      <div className="flex items-center h-[calc(100vh-4rem)]">
        <div className="text-white m-5 border w-full h-full border-dotted border-white">
          File View Area
        </div>
      </div>
    </div>
  );
};

export default Dashboard;
