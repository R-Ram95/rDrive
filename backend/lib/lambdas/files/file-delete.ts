import { ConflictError, createResponse } from "../../utils/lambda-helper";
import { deleteObject } from "../../utils/s3-helper";
import { File } from "../../utils/types";
import { APIGatewayEvent } from "aws-lambda";

export async function handler(event: APIGatewayEvent) {
  const requestBody: File = event.body ? JSON.parse(event.body) : {};
  const { fileName, folderPath } = requestBody;

  if (!fileName || !folderPath)
    createResponse(
      400,
      "Invalid request: fileName and folderPath must be provied."
    );

  try {
    const key = `${folderPath}${fileName}`;
    const result = await deleteObject(key);
    return createResponse(200, result.message);
  } catch (e) {
    if (e instanceof ConflictError) {
      return createResponse(e.code, e.message);
    }
    console.error(e);
    return createResponse(500, "Interal server error");
  }
}
