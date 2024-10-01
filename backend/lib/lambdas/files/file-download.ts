import { APIGatewayEvent } from "aws-lambda";
import { createResponse } from "../../utils/lambda-helper";
import { generateFileDownloaddUrl } from "../../utils/s3-helper";

const bucketName = process.env.BUCKET_NAME;

export async function handler(event: APIGatewayEvent) {
  const requestBody: { fileKey: string } = event.body
    ? JSON.parse(event.body)
    : {};

  if (!requestBody.fileKey)
    return createResponse(400, "Invalid Request: you must provide a fileKey");

  const { fileKey } = requestBody;

  try {
    const downloadUrl = await generateFileDownloaddUrl({
      fileKey: fileKey,
      bucketName: bucketName,
    });

    return createResponse(
      200,
      `Request success: generated url for ${fileKey}`,
      downloadUrl
    );
  } catch (e: any) {
    console.error(e);
    return createResponse(500, `Server error: ${e.message}`);
  }
}
