import { APIGatewayEvent } from "aws-lambda";
import { generateFileResponse } from "../../utils/s3-helper";
import {
  createResponse,
  validateSingleUploadRequest,
} from "../../utils/lambda-helper";
import { UploadSingleRequestBody } from "../../utils/types";

const bucketName = process.env.BUCKET_NAME;

export async function handler(event: APIGatewayEvent) {
  const requestBody: UploadSingleRequestBody = event.body
    ? JSON.parse(event.body)
    : {};

  const error = validateSingleUploadRequest(requestBody);
  if (error) return createResponse(400, `Invalid request: ${error}`);

  const { file, user } = requestBody;
  const { overwrite } = file;

  try {
    const fileResponse = await generateFileResponse({
      file,
      user,
      bucketName,
      overwrite,
    });

    return createResponse(200, fileResponse.message, {
      fileName: file.fileName,
      status: fileResponse.status,
      url: fileResponse.url,
    });
  } catch (e: any) {
    console.error(e);
    return createResponse(500, `Server error: ${e.message}`);
  }
}
