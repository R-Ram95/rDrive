export interface File {
  folderPath: string;
  fileName: string;
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

export enum FILE_STATUS {
  CONFLICT = "CONFLICT",
  CREATED = "CREATED",
}
