import {
  GetObjectCommand,
  GetObjectRequest,
  HeadObjectCommand,
  PutObjectCommand,
  PutObjectRequest,
  S3Client,
} from "@aws-sdk/client-s3";
import { getSignedUrl } from "@aws-sdk/s3-request-presigner";
import {
  FILE_STATUS,
  GenerateFileDownloadUrlArgs,
  GenerateFileUploadUrlArgs,
} from "./types";

const s3Client = new S3Client({ region: process.env.REGION });

export async function checkIfObjectExists({
  key,
  bucketName,
}: {
  key: string;
  bucketName: string | undefined;
}) {
  const params = {
    Bucket: bucketName,
    Key: key,
  };
  console.log(bucketName);

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

export async function generateFileUploadUrl({
  file,
  bucketName,
  user,
  overwrite = false,
}: GenerateFileUploadUrlArgs) {
  const { fileName, folderPath } = file;
  const key =
    folderPath === "/"
      ? `${folderPath}${fileName}`
      : `${folderPath}/${fileName}`;

  try {
    if (!overwrite) {
      const fileExists = await checkIfObjectExists({
        bucketName,
        key,
      });
      if (fileExists)
        return {
          fileName: fileName,
          status: FILE_STATUS.CONFLICT,
          message: "File already exists, you can overwrite it.",
          url: "",
        };
    }

    const inputCommand: PutObjectRequest = {
      Bucket: bucketName,
      Key: key,
      Metadata: {
        User: user,
      },
    };

    const command = new PutObjectCommand(inputCommand);

    // generate presigned URL
    const preSignedUrl = await getSignedUrl(s3Client, command, {
      expiresIn: 360,
    }); // 5 Minutes

    return {
      fileName: fileName,
      status: FILE_STATUS.CREATED,
      message: "Request successful: presigned url generated",
      url: preSignedUrl,
    };
  } catch (e: any) {
    console.error(e);
    throw new Error("Request Failed: failed due to internal server error");
  }
}

export async function generateFileDownloaddUrl({
  fileKey,
  bucketName,
}: GenerateFileDownloadUrlArgs) {
  try {
    const fileExists = await checkIfObjectExists({
      key: fileKey,
      bucketName,
    });

    if (!fileExists)
      return {
        fileKey: fileKey,
        status: FILE_STATUS.CONFLICT,
        message: `File with key ${fileKey} does not exist`,
        url: "",
      };

    const inputCommand: GetObjectRequest = {
      Bucket: bucketName,
      Key: fileKey,
    };

    const command = new GetObjectCommand(inputCommand);

    // generate presigned URL
    const preSignedUrl = await getSignedUrl(s3Client, command, {
      expiresIn: 720,
    }); // 5 Minutes

    return {
      fileKey: fileKey,
      status: FILE_STATUS.CREATED,
      message: "Request successful: presigned url generated",
      url: preSignedUrl,
    };
  } catch (e: any) {
    console.error(e);
    throw new Error("Request Failed: failed due to internal server error");
  }
}
