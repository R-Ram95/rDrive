import { APIGatewayProxyResultV2 } from "aws-lambda";
import {
  File,
  UploadMultipleRequestBody,
  UploadSingleRequestBody,
} from "./types";

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

export function validateFile(file: File): string | null {
  if (!file.folderPath) return "folderPath is required";
  if (!file.fileName) return "fileName is required";

  return null;
}

export function validateSingleUploadRequest(
  requestBody: UploadSingleRequestBody
) {
  const { file, user } = requestBody;

  if (!user) return "Upload user is required.";

  if (!file) {
    return "file is required";
  }

  const error = validateFile(file);
  if (error) return error;

  return null;
}

export function validateMultipleUploadRequest(
  requestBody: UploadMultipleRequestBody
) {
  const { files, user } = requestBody;

  if (!user) return "Upload user is required.";

  if (!files || files.length < 1) {
    return "Atleast 1 file is required required";
  }

  for (const file of files) {
    const error = validateFile(file);
    if (error) {
      return error;
    }
  }

  return null;
}

export class ConflictError extends Error {
  public code: number;

  constructor(code: number, message: string) {
    super(message);
    this.message = message;
    this.code = code;

    Object.setPrototypeOf(this, new.target.prototype);
  }
}
