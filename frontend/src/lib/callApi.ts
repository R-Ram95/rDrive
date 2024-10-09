import { HTTP_METHOD } from "./enums";
import { cognitoUserPoolsTokenProvider } from "aws-amplify/auth/cognito";
import { ApiResponse } from "./types";

export const callApi = async <T>(
  apiRoute: string,
  method: HTTP_METHOD,
  body?: unknown
): Promise<ApiResponse<T>> => {
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

    if (!response.ok) {
      const errorData = await response.json();
      throw new Error(errorData.message || "An error occurred");
    }

    return response.json() as unknown as ApiResponse<T>;
  } catch (error) {
    console.error(`FETCH ERROR: ${error}`);
    throw new Error("Error fetching API");
  }
};
