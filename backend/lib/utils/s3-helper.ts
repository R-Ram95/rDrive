import {
  DeleteObjectCommand,
  DeleteObjectCommandInput,
  GetObjectCommand,
  GetObjectRequest,
  HeadObjectCommand,
  ListObjectsV2Command,
  ListObjectsV2Request,
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
import { ConflictError } from "./lambda-helper";

const s3Client = new S3Client({ region: process.env.REGION });
const bucketName = process.env.BUCKET_NAME;

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

export async function createDirectory(directory: string) {
  const objectExists = await checkIfObjectExists({
    bucketName,
    key: directory,
  });

  if (objectExists) {
    throw new ConflictError(
      409,
      `Request failed: the ${directory} folder already exists`
    );
  }

  const commandInput: PutObjectRequest = {
    Bucket: bucketName,
    Key: directory,
  };

  await s3Client.send(new PutObjectCommand(commandInput));

  return {
    message: `Request successful: the ${directory} folder has been created`,
  };
}

export async function listDirectory(parentFolder: string) {
  const commandInput: ListObjectsV2Request = {
    Bucket: bucketName,
    Delimiter: "/",
    Prefix: parentFolder,
  };

  const response = await s3Client.send(new ListObjectsV2Command(commandInput));

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

  return subFolders.concat(files);
}

async function dirIsEmpty(directory: string) {
  const commandInput: ListObjectsV2Request = {
    Bucket: bucketName,
    Delimiter: "/",
    Prefix: directory,
  };

  const response = await s3Client.send(new ListObjectsV2Command(commandInput));

  if (!response.Contents) return true;

  return response.Contents.length < 1;
}

export async function deleteObject(key: string, folderName?: string) {
  const objectExists = checkIfObjectExists({ key, bucketName });

  if (!objectExists) {
    throw new ConflictError(409, `Request failed: ${key} does not exist`);
  }

  // object is a folder, it must be empty to delete
  if (folderName && !(await dirIsEmpty(folderName))) {
    throw new ConflictError(
      400,
      `Request failed: cannot delete folder '${key}' as it contains children`
    );
  }

  const commandInput: DeleteObjectCommandInput = {
    Bucket: bucketName,
    Key: key,
  };

  await s3Client.send(new DeleteObjectCommand(commandInput));

  return { message: `Request successful: ${key} was deleted` };
}
