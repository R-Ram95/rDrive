import { APIGatewayEvent } from "aws-lambda";
import { UploadMultipleRequestBody } from "../../utils/types";
import {
  createResponse,
  validateMultipleUploadRequest,
} from "../../utils/lambda-helper";
import { generateUploadUrl } from "../../utils/s3-helper";

const bucketName = process.env.BUCKET_NAME;

export const handler = async (event: APIGatewayEvent) => {
  const requestBody: UploadMultipleRequestBody = event.body
    ? JSON.parse(event.body)
    : {};

  const error = validateMultipleUploadRequest(requestBody);

  if (error) return createResponse(400, `Invalid request: ${error}`);

  const { files, user } = requestBody;

  try {
    const presignedUrls = await Promise.all(
      files.map((file) => {
        const presignedUrl = generateUploadUrl({
          file: file,
          user: user,
          bucketName: bucketName,
          overwrite: file.overwrite,
        });

        return {
          presignedUrl: presignedUrl ?? "Image already exists, make a copy",
          fileName: file.fileName,
        };
      })
    );

    return createResponse(200, "Created presigned urls,", presignedUrls);
  } catch (e: any) {
    console.error(e);
    return createResponse(500, e.message);
  }
};
