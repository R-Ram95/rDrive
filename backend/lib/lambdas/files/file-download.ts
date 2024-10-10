import { APIGatewayEvent } from "aws-lambda";
import { createResponse } from "../../utils/lambda-helper";
import { generateFileDownloadUrl } from "../../utils/s3-helper";

const bucketName = process.env.BUCKET_NAME;

export async function handler(event: APIGatewayEvent) {
  const requestBody: { folderPath: string; fileName: string } = event.body
    ? JSON.parse(event.body)
    : {};

  if (!requestBody.folderPath || !requestBody.fileName)
    return createResponse(
      400,
      "Invalid Request: you must provide a folderPath and fileName"
    );

  const { folderPath, fileName } = requestBody;

  try {
    const downloadUrl = await generateFileDownloadUrl({
      folderPath: folderPath,
      fileName: fileName,
      bucketName: bucketName,
    });

    return createResponse(
      200,
      `Request success: generated url for ${fileName}`,
      downloadUrl
    );
  } catch (e: any) {
    console.error(e);
    return createResponse(500, `Server error: ${e.message}`);
  }
}
