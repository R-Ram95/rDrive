import { createContext, ReactNode, useEffect, useState } from "react";
import { signOut, getCurrentUser } from "aws-amplify/auth";

interface User {
  username: string;
  userid: string;
}

interface AuthContextType {
  login: () => void;
  logout: () => void;
  isAuth: boolean;
  isLoading: boolean;
  user: User;
}

export const AuthContext = createContext<AuthContextType | undefined>(
  undefined
);

export const AuthProvider = ({ children }: { children: ReactNode }) => {
  const [isAuth, setIsAuth] = useState(false);
  const [isLoading, setIsLoading] = useState(true);
  const [user, setUser] = useState<User>({ userid: "", username: "" });

  useEffect(() => {
    const checkAuthStatus = async () => {
      try {
        const user = await getCurrentUser();
        setUser({ userid: user.userId, username: user.userId });

        if (user) {
          setIsAuth(true);
        }
        // eslint-disable-next-line @typescript-eslint/no-unused-vars
      } catch (e) {
        setIsAuth(false); // User is not authenticated
      } finally {
        setIsLoading(false);
      }
    };

    checkAuthStatus();
  }, []);

  const login = () => setIsAuth(true);

  const logout = async () => {
    await signOut();
    setIsAuth(false);
  };

  return (
    <AuthContext.Provider value={{ isAuth, login, logout, isLoading, user }}>
      {children}
    </AuthContext.Provider>
  );
};
