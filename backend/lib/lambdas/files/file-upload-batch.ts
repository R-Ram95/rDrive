import { APIGatewayEvent } from "aws-lambda";
import { UploadMultipleRequestBody } from "../../utils/types";
import {
  createResponse,
  validateMultipleUploadRequest,
} from "../../utils/lambda-helper";
import { generateFileUploadUrl } from "../../utils/s3-helper";

const bucketName = process.env.BUCKET_NAME;

export const handler = async (event: APIGatewayEvent) => {
  const requestBody: UploadMultipleRequestBody = event.body
    ? JSON.parse(event.body)
    : {};

  const error = validateMultipleUploadRequest(requestBody);

  if (error) return createResponse(400, `Invalid request: ${error}`);

  const { files, user } = requestBody;

  try {
    const promises = files.map((file) => {
      return generateFileUploadUrl({
        file: file,
        bucketName: bucketName,
        user: user,
        overwrite: file.overwrite,
      });
    });

    const uploadUrlList = await Promise.all(promises);
    const presignedUrls = uploadUrlList.map((uploadUrl) => {
      return {
        fileName: uploadUrl.fileName,
        message: uploadUrl.message,
        status: uploadUrl.status,
        url: uploadUrl.url,
      };
    });

    return createResponse(
      200,
      "Request sucessful: presigned urls generated",
      presignedUrls
    );
  } catch (e: any) {
    console.error(e);
    return createResponse(500, e.message);
  }
};
