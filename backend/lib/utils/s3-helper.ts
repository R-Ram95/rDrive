import {
  HeadObjectCommand,
  PutObjectCommand,
  S3Client,
} from "@aws-sdk/client-s3";
import { getSignedUrl } from "@aws-sdk/s3-request-presigner";
import { FileTags } from "./types";

export async function createPresignedURL({
  client,
  bucketName,
  key,
  metaData,
}: {
  client: S3Client;
  bucketName: string | undefined;
  key: string;
  metaData: FileTags;
}) {
  const command = new PutObjectCommand({
    Bucket: bucketName,
    Key: key,
    Metadata: metaData,
  });
  return getSignedUrl(client, command, { expiresIn: 360 }); // 5 Minutes
}

export async function checkIfImageExists({
  client,
  bucketName,
  key,
}: {
  client: S3Client;
  bucketName: string | undefined;
  key: string;
}) {
  const params = {
    Bucket: bucketName,
    Key: key,
  };

  try {
    await client.send(new HeadObjectCommand(params));
    return true;
  } catch (e: any) {
    console.log(e);
    // file does not exists
    if (e.name === "NotFound" || e.$metadata?.httpStatusCode === 404) {
      return false;
    }
    // other errors
    throw e;
  }
}
