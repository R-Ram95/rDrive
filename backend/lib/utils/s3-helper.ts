import {
  HeadObjectCommand,
  PutObjectCommand,
  S3Client,
} from "@aws-sdk/client-s3";
import { getSignedUrl } from "@aws-sdk/s3-request-presigner";
import { GeneratePresignedUrlArgs } from "./types";

const s3Client = new S3Client({ region: process.env.REGION });

export async function createURL({ command }: { command: PutObjectCommand }) {
  return await getSignedUrl(s3Client, command, { expiresIn: 360 }); // 5 Minutes
}

export async function checkIfImageExists({
  bucketName,
  key,
}: {
  bucketName: string | undefined;
  key: string;
}) {
  const params = {
    Bucket: bucketName,
    Key: key,
  };

  try {
    await s3Client.send(new HeadObjectCommand(params));
    return true;
  } catch (e: any) {
    if (e.name === "NotFound" || e.$metadata?.httpStatusCode === 404) {
      return false;
    }
    console.error(e);
    throw e;
  }
}

export async function generateUploadUrl({
  file,
  user,
  bucketName,
  overwrite = false,
}: GeneratePresignedUrlArgs) {
  const { folderPath, fileName, fileType, fileSize } = file;
  const key = `${folderPath}${fileName}`;

  const metaData = {
    FileSize: fileSize.toString(),
    FileType: fileType,
    UploadUser: user,
  };

  try {
    if (!overwrite) {
      const imageExists = await checkIfImageExists({
        bucketName,
        key,
      });
      if (imageExists) return null;
    }

    const command = new PutObjectCommand({
      Bucket: bucketName,
      Key: key,
      Metadata: metaData,
    });

    // generate presigned URL
    const preSignedUrl = await createURL({ command });
    return preSignedUrl;
  } catch (e: any) {
    console.error(e);
    throw new Error("Failed to add image due to internal server error");
  }
}
