import { APIGatewayEvent } from "aws-lambda";

const webAppDomain = process.env.WEB_APP_DOMAIN ?? "";
enum CorsHttpMethod {
  GET = "GET",
  POST = "POST",
  PUT = "PUT",
  DELETE = "DELETE",
  OPTIONS = "OPTIONS",
}

export async function handler(event: APIGatewayEvent) {
  return {
    statusCode: 200,
    headers: {
      "Access-Control-Allow-Origin": `https://${webAppDomain}`,
      "Access-Control-Allow-Methods": `${CorsHttpMethod.GET},${CorsHttpMethod.DELETE},${CorsHttpMethod.POST},${CorsHttpMethod.PUT}`,
      "Access-Control-Allow-Headers": "Content-Type,Authorization",
    },
    body: null,
  };
}
