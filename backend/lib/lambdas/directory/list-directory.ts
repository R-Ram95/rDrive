import { APIGatewayEvent } from "aws-lambda";
import { createResponse } from "../../utils/lambda-helper";
import {
  ListObjectsV2Command,
  ListObjectsV2Request,
  S3Client,
} from "@aws-sdk/client-s3";

const s3Client = new S3Client({ region: process.env.REGION });
const bucketName = process.env.BUCKET_NAME;

// /api/images?parentFolder={parentFolder}
export async function handler(event: APIGatewayEvent) {
  if (!event.queryStringParameters)
    return createResponse(
      400,
      "Invalid request, must specify parentFolder path parameter"
    );
  const parentFolder = event.queryStringParameters["parentFolder"];

  const commandInput: ListObjectsV2Request = {
    Bucket: bucketName,
    Delimiter: parentFolder ?? "/",
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
        ? response.Contents.map((content) => {
            return {
              fileKey: content.Key,
              fileName: content.Key?.split("/").slice(-1).pop(),
              uploadDate: content.LastModified,
              fileSize: content.Size,
            };
          })
        : [];

    // TODO: Clean up the mapping and logic
    const subFolders =
      response.CommonPrefixes && response.CommonPrefixes.length > 0
        ? response.CommonPrefixes.map((prefix) => {
            return prefix.Prefix;
          })
        : [];

    return createResponse(200, "Successfully retrieved files", {
      files: files,
      subFolders: subFolders,
    });
  } catch (e) {
    console.error(e);
    return createResponse(500, "Interal server error");
  }
}
