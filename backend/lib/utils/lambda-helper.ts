import { APIGatewayProxyResultV2 } from "aws-lambda";
import { File, UploadSingleRequestBody } from "./types";

export function createResponse<T>(
  statusCode: number,
  message: string,
  data?: T
): APIGatewayProxyResultV2 {
  return {
    statusCode: statusCode,
    body: JSON.stringify({
      message: message,
      data: data,
    }),
  };
}

function validateFile(file: File): string | null {
  if (!file.folderPath) return "folderPath is required";
  if (!file.fileName) return "fileName is required";
  if (!file.fileType) return "fileType is required";
  if (typeof file.fileSize !== "number" || file.fileSize <= 0)
    return "fileSize must be a positive number";

  return null;
}

export function validateSingleUploadRequest(
  requestBody: UploadSingleRequestBody
) {
  const { file, user } = requestBody;

  if (!user) return "Upload user is required.";

  if (!file) {
    return "file is requireda";
  }

  const error = validateFile(file);
  if (error) {
    return error;
  }

  return null;
}
