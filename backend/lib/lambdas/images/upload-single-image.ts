import { S3Client } from "@aws-sdk/client-s3";
import { APIGatewayEvent } from "aws-lambda";
import { checkIfImageExists, createPresignedURL } from "../../utils/s3-helper";
import {
  createResponse,
  validateSingleUploadRequest,
} from "../../utils/lambda-helper";
import { File, UploadSingleRequestBody } from "../../utils/types";

const bucketName = process.env.BUCKET_NAME;
const s3Client = new S3Client({ region: process.env.REGION });

interface UploadImageArgs {
  file: File;
  user: string;
  overwrite?: boolean;
}

async function uploadImage({ file, user, overwrite = false }: UploadImageArgs) {
  const { folderPath, fileName, fileType, fileSize } = file;
  const key = `${folderPath}${fileName}`;
  const metaData = {
    FileSize: fileSize.toString(),
    FileType: fileType,
    UploadUser: user,
  };

  try {
    const imageExists = await checkIfImageExists({
      client: s3Client,
      bucketName,
      key,
    });

    if (imageExists && !overwrite) {
      return createResponse(409, "Image already exists.");
    }

    // generate presigned URL
    const clientUrl = await createPresignedURL({
      client: s3Client,
      bucketName,
      key: key,
      metaData: metaData,
    });

    return createResponse(200, "Successfully generate presignedURL", {
      fileKey: `${folderPath}${fileName}`,
      presignedUrl: clientUrl,
    });
  } catch (e) {
    console.error(
      `Failed to generate presigned URL for user ${user} and file ${file.fileName}:`,
      e
    );
    return createResponse(
      500,
      "Failed to add image due to internal server error"
    );
  }
}

export async function handler(event: APIGatewayEvent) {
  const requestBody: UploadSingleRequestBody = event.body
    ? JSON.parse(event.body)
    : {};
  // validation
  const error = validateSingleUploadRequest(requestBody);

  if (error) return createResponse(400, `Invalid request: ${error}`);

  const { file, user } = requestBody;
  const { overwrite } = file;
  return uploadImage({ file, user, overwrite });
}
