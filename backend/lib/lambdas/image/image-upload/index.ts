import {
  HeadObjectCommand,
  NotFound,
  PutObjectCommand,
  S3Client,
} from "@aws-sdk/client-s3";
import { APIGatewayEvent } from "aws-lambda";
import { getSignedUrl } from "@aws-sdk/s3-request-presigner";

const bucketName = process.env.BUCKET_NAME;
const s3Client = new S3Client({ region: process.env.REGION });

export interface ObjectTags {
  [key: string]: string;
}

export interface RequestBody {
  folderPath: string;
  fileName: string;
  overWrite?: boolean;
  metaData: ObjectTags;
}

const createPresignedURL = async ({
  key,
  metaData,
}: {
  key: string;
  metaData: ObjectTags;
}) => {
  const command = new PutObjectCommand({
    Bucket: bucketName,
    Key: key,
    Metadata: metaData,
  });
  return getSignedUrl(s3Client, command, { expiresIn: 360 }); // 5 Minutes
};

const checkIfImageExists = async ({ key }: { key: string }) => {
  const params = {
    Bucket: bucketName,
    Key: key,
  };

  try {
    await s3Client.send(new HeadObjectCommand(params));
    return true;
  } catch (e: any) {
    console.log(e);
    // Check the error code to see if it was a "NotFound" (NoSuchKey) error
    if (e.name === "NotFound" || e.$metadata?.httpStatusCode === 404) {
      return false; // File does not exist
    }
    throw e;
  }
};

async function uploadImage({
  folderPath,
  fileName,
  overWrite = false,
  metaData,
}: {
  folderPath: string;
  fileName: string;
  metaData: ObjectTags;
  overWrite?: boolean;
}) {
  const key = `${folderPath}${fileName}`;

  try {
    const imageExists = await checkIfImageExists({ key });

    if (imageExists && !overWrite) {
      return {
        statusCode: 409,
        body: JSON.stringify({
          message:
            "Image already exists. Choose to overwrite or create a copy.",
        }),
      };
    }

    // generate presigned URL
    const clientUrl = await createPresignedURL({
      key: key,
      metaData,
    });

    return {
      statusCode: 200,
      body: JSON.stringify({
        message: "Successfully generated presignedURL.",
        fileKey: `${folderPath}${fileName}`,
        presignedUrl: clientUrl,
      }),
    };
  } catch (e) {
    console.log(e);
    return {
      statusCode: 400,
      body: JSON.stringify({
        message: "Failed to add file.",
      }),
    };
  }
}

export async function handler(event: APIGatewayEvent) {
  // check event request body for the fields we need RequestBody
  const requestBody: RequestBody = event.body ? JSON.parse(event.body) : {};
  const { folderPath, fileName, metaData } = requestBody;

  // check event request body for the fields we need RequestBody
  if (!folderPath || !fileName) {
    return {
      statusCode: 400,
      body: JSON.stringify({ message: "Invalid request body" }),
    };
  }

  return uploadImage({ folderPath, fileName, metaData });
}
