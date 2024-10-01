import { APIGatewayEvent } from "aws-lambda";
import { createResponse } from "../../utils/lambda-helper";
import { generateFileDownloaddUrl } from "../../utils/s3-helper";

const bucketName = process.env.BUCKET_NAME;

export const handler = async (event: APIGatewayEvent) => {
  const requestBody: { files: string[] } = event.body
    ? JSON.parse(event.body)
    : {};

  const { files } = requestBody;

  if (!files)
    return createResponse(400, `Invalid request: files must be provided`);

  if (files.length < 1)
    return createResponse(
      400,
      `Invalid request: atleast 1 file must be provided`
    );

  try {
    const promises = files.map((file) => {
      return generateFileDownloaddUrl({
        fileKey: file,
        bucketName,
      });
    });

    const downloadUrlList = await Promise.all(promises);

    return createResponse(
      200,
      "Request sucessful: presigned urls generated",
      downloadUrlList
    );
  } catch (e: any) {
    console.error(e);
    return createResponse(500, e.message);
  }
};
