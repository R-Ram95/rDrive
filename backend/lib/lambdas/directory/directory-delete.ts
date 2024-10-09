import { ConflictError, createResponse } from "../../utils/lambda-helper";
import { deleteObject } from "../../utils/s3-helper";
import { Folder } from "../../utils/types";
import { APIGatewayEvent } from "aws-lambda";

export async function handler(event: APIGatewayEvent) {
  const requestBody: Folder = event.body ? JSON.parse(event.body) : {};
  const { parentFolderPath, folderName } = requestBody;

  if (!parentFolderPath || !folderName)
    createResponse(
      400,
      "Invalid request: parentFolderPath and folderName must be provied."
    );

  try {
    const result = await deleteObject(
      `${parentFolderPath}${folderName}`,
      folderName
    );
    return createResponse(200, result.message);
  } catch (e) {
    if (e instanceof ConflictError) {
      return createResponse(e.code, e.message);
    }
    console.error(e);
    return createResponse(500, "Interal server error");
  }
}
