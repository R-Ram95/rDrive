import { APIGatewayEvent } from "aws-lambda";
import { createResponse } from "../../utils/lambda-helper";
import { checkIfObjectExists } from "../../utils/s3-helper";
import {
  PutObjectCommand,
  PutObjectRequest,
  S3Client,
} from "@aws-sdk/client-s3";

const bucketName = process.env.BUCKET_NAME;
const s3Client = new S3Client({ region: process.env.REGION });

export async function handler(event: APIGatewayEvent) {
  const requestBody: { directory: string } = event.body
    ? JSON.parse(event.body)
    : {};
  if (!requestBody.directory)
    return createResponse(400, "Invalid request: directory must be provded");

  let directory = requestBody.directory;

  if (directory === "/")
    return createResponse(400, "Invalid request: cannot create root folder");

  // ensure proper formatting
  if (!directory.startsWith("/")) directory = `/${directory}`;
  if (!directory.endsWith("/")) directory = `${directory}/`;

  try {
    const objectExists = await checkIfObjectExists({
      bucketName,
      key: directory,
    });

    if (objectExists) {
      return createResponse(
        409,
        `Request failed: the ${directory} folder already exists`
      );
    }

    const commandInput: PutObjectRequest = {
      Bucket: bucketName,
      Key: directory,
    };

    await s3Client.send(new PutObjectCommand(commandInput));

    return createResponse(
      200,
      `Request successful: the ${directory} folder has been created`
    );
  } catch (e: any) {
    console.error(e);
    return createResponse(500, `Server error: ${e.message}`);
  }
}
