import { StrictMode } from "react";
import { createRoot } from "react-dom/client";
import App from "./App.tsx";
import "./index.css";
import { Amplify } from "aws-amplify";
import { CookieStorage } from "aws-amplify/utils";
import { BrowserRouter } from "react-router-dom";
import { cognitoUserPoolsTokenProvider } from "aws-amplify/auth/cognito";
import { AuthProvider } from "./context/AuthContextProvider.tsx";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { ReactQueryDevtools } from "@tanstack/react-query-devtools";

Amplify.configure({
  Auth: {
    Cognito: {
      userPoolId: import.meta.env.VITE_USER_POOL_ID,
      userPoolClientId: import.meta.env.VITE_USER_POOL_CLIENT_ID,
    },
  },
});
cognitoUserPoolsTokenProvider.setKeyValueStorage(new CookieStorage());

const queryClient = new QueryClient();

createRoot(document.getElementById("root")!).render(
  <StrictMode>
    <AuthProvider>
      <BrowserRouter>
        <QueryClientProvider client={queryClient}>
          <App />
          <ReactQueryDevtools initialIsOpen={false} />
        </QueryClientProvider>
      </BrowserRouter>
    </AuthProvider>
  </StrictMode>
);
