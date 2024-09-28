import { APIGatewayEvent } from "aws-lambda";
import { generateUploadUrl } from "../../utils/s3-helper";
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
    const presignedUrl = await generateUploadUrl({
      file,
      user,
      bucketName,
      overwrite,
    });

    if (!presignedUrl) {
      createResponse(409, "File already exits, you can overwrite it.");
    }

    return createResponse(200, "Request successful: presigned url generated", {
      presignedUrl: presignedUrl,
      fileName: file.fileName,
    });
  } catch (e: any) {
    console.error(e);
    return createResponse(500, e.message);
  }
}
