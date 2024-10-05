import { APIGatewayEvent } from "aws-lambda";
import { createResponse } from "../../utils/lambda-helper";
import {
  ListObjectsV2Command,
  ListObjectsV2Request,
  S3Client,
} from "@aws-sdk/client-s3";

const s3Client = new S3Client({ region: process.env.REGION });
const bucketName = process.env.BUCKET_NAME;

export async function handler(event: APIGatewayEvent) {
  if (!event.queryStringParameters)
    return createResponse(
      400,
      "Invalid request, must specify parentFolder path parameter"
    );
  const parentFolder = event.queryStringParameters["parentFolder"];

  const commandInput: ListObjectsV2Request = {
    Bucket: bucketName,
    Delimiter: "/",
    Prefix: parentFolder,
  };

  // TODO: Separate out the logic from the handler
  try {
    const response = await s3Client.send(
      new ListObjectsV2Command(commandInput)
    );

    // TODO: Clean up the mapping and logic
    const files =
      response.Contents && response.Contents.length > 0
        ? response.Contents.filter(
            (content) => content.Size && content.Size > 0
          ).map((content) => {
            return {
              key: content.Key,
              name: content.Key?.split("/").slice(-1).pop(),
              uploadDate:
                content.LastModified?.toString() ?? new Date().toISOString(),
              size: content.Size ?? 0,
              type: "file",
            };
          })
        : [];

    const subFolders =
      response.CommonPrefixes && response.CommonPrefixes.length > 0
        ? response.CommonPrefixes.map((prefix) => {
            return {
              key: prefix.Prefix,
              name:
                prefix.Prefix &&
                prefix.Prefix.replace(parentFolder!, "/").slice(1, -1),
              uploadDate: "-",
              size: 0,
              type: "folder",
            };
          })
        : [];

    return createResponse(
      200,
      "Successfully retrieved files",
      subFolders.concat(files)
    );
  } catch (e) {
    console.error(e);
    return createResponse(500, "Interal server error");
  }
}
