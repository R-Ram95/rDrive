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
    const promises = files.map((file) => {
      return generateUploadUrl({
        file: file,
        user: user,
        bucketName: bucketName,
        overwrite: file.overwrite,
      });
    });

    const urlList = await Promise.all(promises);
    const presignedUrls = urlList.map((url, index) => {
      return { url: url, fileName: files[index].fileName };
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
