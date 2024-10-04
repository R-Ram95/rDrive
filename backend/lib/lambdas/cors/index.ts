import { CorsHttpMethod } from "aws-cdk-lib/aws-apigatewayv2";
import { APIGatewayEvent } from "aws-lambda";

export async function handler(event: APIGatewayEvent) {
  return {
    statusCode: 200,
    headers: {
      "Access-Control-Allow-Origin": "http://localhost:3000",
      "Access-Control-Allow-Methods": `${CorsHttpMethod.GET},${CorsHttpMethod.DELETE},${CorsHttpMethod.POST},${CorsHttpMethod.PUT}`,
      "Access-Control-Allow-Headers": "Content-Type,Authorization",
    },
    body: null,
  };
}
