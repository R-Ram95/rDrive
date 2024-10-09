import { ConflictError, createResponse } from "../../utils/lambda-helper";
import { deleteObject } from "../../utils/s3-helper";
import { File } from "../../utils/types";
import { APIGatewayEvent } from "aws-lambda";

export async function handler(event: APIGatewayEvent) {
  const requestBody: File = event.body ? JSON.parse(event.body) : {};
  const { folderPath } = requestBody;

  if (!folderPath)
    createResponse(400, "Invalid request: folderPath must be provied.");

  try {
    const result = await deleteObject(folderPath);
    return createResponse(200, result.message);
  } catch (e) {
    if (e instanceof ConflictError) {
      return createResponse(e.code, e.message);
    }
    console.error(e);
    return createResponse(500, "Interal server error");
  }
}
