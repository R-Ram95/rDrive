import { S3Client } from "@aws-sdk/client-s3";

export interface File {
  folderPath: string;
  fileName: string;
  fileType: string;
  fileSize: number;
  overwrite?: boolean;
}

export interface GeneratePresignedUrlArgs {
  file: File;
  user: string;
  bucketName: string | undefined;
  overwrite?: boolean;
}

export interface UploadSingleRequestBody {
  file: File;
  user: string;
}

export interface UploadMultipleRequestBody {
  files: File[];
  user: string;
}
