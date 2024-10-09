import { APIGatewayEvent } from "aws-lambda";
import { ConflictError, createResponse } from "../../utils/lambda-helper";
import { createDirectory } from "../../utils/s3-helper";

export async function handler(event: APIGatewayEvent) {
  const requestBody: { directory: string } = event.body
    ? JSON.parse(event.body)
    : {};
  if (!requestBody.directory)
    return createResponse(400, "Invalid request: directory must be provded");

  let directory = requestBody.directory;

  if (directory === "/")
    return createResponse(400, "Invalid request: cannot create root folder");

  // ensure proper formatting
  if (!directory.startsWith("/")) directory = `/${directory}`;
  if (!directory.endsWith("/")) directory = `${directory}/`;

  try {
    const result = await createDirectory(directory);
    return createResponse(200, result.message);
  } catch (e: any) {
    if (e instanceof ConflictError) {
      createResponse(409, e.message);
    }

    console.error(e);
    return createResponse(500, `Server error: ${e.message}`);
  }
}
