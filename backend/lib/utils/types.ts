import { GetObjectCommand, PutObjectCommand } from "@aws-sdk/client-s3";

export interface File {
  folderPath: string;
  fileName: string;
  overwrite?: boolean;
}

export interface Folder {
  folderName: string;
  parentFolderPath: string;
}

export interface GenerateFileUploadUrlArgs {
  file: File;
  bucketName: string | undefined;
  user: string;
  overwrite?: boolean;
}

export interface GenerateFileDownloadUrlArgs {
  folderPath: string;
  fileName: string;
  bucketName: string | undefined;
}

export interface UploadSingleRequestBody {
  file: File;
  user: string;
}

export interface UploadMultipleRequestBody {
  files: File[];
  user: string;
}

export enum FILE_STATUS {
  CONFLICT = "CONFLICT",
  CREATED = "CREATED",
}
