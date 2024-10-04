import { HTTP_METHOD } from "./enums";
import { cognitoUserPoolsTokenProvider } from "aws-amplify/auth/cognito";

export const callApi = async (
  apiRoute: string,
  method: HTTP_METHOD,
  body?: unknown
) => {
  try {
    const tokenResponse = await cognitoUserPoolsTokenProvider.getTokens();
    const { accessToken } = tokenResponse ?? {};

    const response = await fetch(
      `${import.meta.env.VITE_API_BASE}${apiRoute}`,
      {
        method: method,
        headers: {
          Authorization: `Bearer ${accessToken}`,
          Origin: "http://localhost:3000",
        },
        body: JSON.stringify(body),
      }
    );
    return response.json();
  } catch (error) {
    console.error(`FETCH ERROR: ${error}`);
  }
};
