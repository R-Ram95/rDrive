const Login = () => {
  return (
    <div className="flex flex-col items-center h-screen justify-center bg-[url('/image.png')] bg-cover bg-no-repeat bg-center">
      <div className="flex flex-col w-96 py-20 px-11 rounded-xl bg-transparent border border-white/20 backdrop-blur-lg shadow-2xl font-medium">
        <form action="">
          <h1 className="text-3xl text-center text-white font-semibold">
            r/Drive
          </h1>
          <div className="relative w-full my-6 mx-0 h-11 text-white">
            <input
              className="w-full h-full bg-transparent outline-none border rounded-full py-4 px-4 placeholder:text-white"
              type="text"
              name="username"
              placeholder="Username"
              required
            />
            <i className="bx bxs-user absolute right-3 top-1/2 -translate-y-1/2 size-4"></i>
          </div>
          <div className="relative w-full my-6 mx-0 h-11 text-white">
            <input
              className="w-full h-full bg-transparent outline-none border rounded-full py-4 px-4 text-white placeholder:text-white"
              type="password"
              name="password"
              placeholder="Password"
            />
            <i className="bx bxs-lock-alt absolute right-3 top-1/2 -translate-y-1/2 size-4"></i>
          </div>
          <button className="w-full h-11 border-none outline-none rounded-full shadow-md bg-rose-200 text-gray-950   font-semibold">
            Login
          </button>
        </form>
      </div>
    </div>
  );
};

export default Login;
