import { signIn } from "aws-amplify/auth";
import { ChangeEvent, FormEvent, useState } from "react";
import { useAuth } from "../hooks/useAuth";
import { useNavigate } from "react-router-dom";
import { useToast } from "@/hooks/useToast";

interface SignInFormElements extends HTMLFormControlsCollection {
  username: HTMLInputElement;
  password: HTMLInputElement;
}

interface SignInForm extends HTMLFormElement {
  readonly elements: SignInFormElements;
}

const Login = () => {
  const [username, setUsername] = useState("");
  const [password, setPassword] = useState("");
  const { login } = useAuth();
  const { toast } = useToast();
  const navigate = useNavigate();

  const handleSubmit = async (event: FormEvent<SignInForm>) => {
    event.preventDefault();
    const form = event.currentTarget;

    if (!username) {
      toast({
        title: "Username is required",
        variant: "destructive",
      });
      return;
    }

    if (!password) {
      toast({
        title: "Password is required",
        variant: "destructive",
      });
      return;
    }

    try {
      await signIn({
        username: form.elements.username.value,
        password: form.elements.password.value,
      });

      login();
      navigate("/");
    } catch (e) {
      console.error("Error signing in:", e);
      toast({
        title: "Incorrect Username or Password",
        variant: "destructive",
      });
    }
  };

  return (
    <div className="flex flex-col items-center h-screen justify-center bg-[url('/image.png')] bg-cover bg-no-repeat bg-center">
      <div className="flex flex-col w-96 py-20 px-11 rounded-xl bg-transparent border border-white/20 backdrop-blur-lg shadow-2xl font-medium">
        <form onSubmit={handleSubmit}>
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
              onChange={(event: ChangeEvent<HTMLInputElement>) =>
                setUsername(event.target.value)
              }
            />
            <i className="bx bxs-user absolute right-3 top-1/2 -translate-y-1/2 size-4"></i>
          </div>
          <div className="relative w-full my-6 mx-0 h-11 text-white">
            <input
              className="w-full h-full bg-transparent outline-none border rounded-full py-4 px-4 text-white placeholder:text-white"
              type="password"
              name="password"
              placeholder="Password"
              onChange={(event: ChangeEvent<HTMLInputElement>) =>
                setPassword(event.currentTarget.value)
              }
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
