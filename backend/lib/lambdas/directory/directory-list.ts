import { APIGatewayEvent } from "aws-lambda";
import { createResponse } from "../../utils/lambda-helper";
import { listDirectory } from "../../utils/s3-helper";

export async function handler(event: APIGatewayEvent) {
  if (
    !event.queryStringParameters ||
    !event.queryStringParameters["parentFolder"]
  )
    return createResponse(
      400,
      "Invalid request, must specify parentFolder path parameter"
    );
  const parentFolder = event.queryStringParameters["parentFolder"];

  try {
    const directory = await listDirectory(parentFolder);

    return createResponse(200, "Successfully retrieved files", directory);
  } catch (e) {
    console.error(e);
    return createResponse(500, "Interal server error");
  }
}
