export interface FileTags {
  [key: string]: string;
}

export interface File {
  folderPath: string;
  fileName: string;
  fileType: string;
  fileSize: number;
  overwrite?: boolean;
}

export interface UploadSingleRequestBody {
  file: File;
  user: string;
}
