import { APIGatewayEvent } from "aws-lambda";
import { createResponse } from "../../utils/lambda-helper";
import { checkIfObjectExists, createURL } from "../../utils/s3-helper";
import { GetObjectCommand, GetObjectRequest } from "@aws-sdk/client-s3";

const bucketName = process.env.BUCKET_NAME;

export async function handler(event: APIGatewayEvent) {
  const requestBody: { fileKey: string } = event.body
    ? JSON.parse(event.body)
    : {};

  if (!requestBody.fileKey)
    return createResponse(400, "Invalid Request: you must provide a fileKey");

  const { fileKey } = requestBody;

  try {
    const fileExists = checkIfObjectExists({ bucketName, key: fileKey });

    if (!fileExists) {
      return createResponse(404, `Error: ${fileKey} file does not exists`);
    }

    const inputCommand: GetObjectRequest = {
      Bucket: bucketName,
      Key: fileKey,
    };

    const command = new GetObjectCommand(inputCommand);

    const url = await createURL({ command });

    return createResponse(
      200,
      `Request success: generated url for ${fileKey}`,
      {
        url: url,
      }
    );
  } catch (e: any) {
    console.error(e);
    return createResponse(500, `Server error: ${e.message}`);
  }
}
