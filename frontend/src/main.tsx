import { StrictMode } from "react";
import { createRoot } from "react-dom/client";
import App from "./App.tsx";
import "./index.css";
import { Amplify } from "aws-amplify";
import { CookieStorage } from "aws-amplify/utils";
import { BrowserRouter } from "react-router-dom";
import { cognitoUserPoolsTokenProvider } from "aws-amplify/auth/cognito";
import { AuthProvider } from "./context/AuthContextProvider.tsx";

Amplify.configure({
  Auth: {
    Cognito: {
      userPoolId: import.meta.env.VITE_USER_POOL_ID,
      userPoolClientId: import.meta.env.VITE_USER_POOL_CLIENT_ID,
    },
  },
});
cognitoUserPoolsTokenProvider.setKeyValueStorage(new CookieStorage());

createRoot(document.getElementById("root")!).render(
  <StrictMode>
    <AuthProvider>
      <BrowserRouter>
        <App />
      </BrowserRouter>
    </AuthProvider>
  </StrictMode>
);
