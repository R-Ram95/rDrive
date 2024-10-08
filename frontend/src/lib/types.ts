import { FILE_STATUS, ItemType } from "./enums";

export interface DirectoryItemType {
  key: string;
  name: string;
  uploadDate: string;
  size: number;
  type: ItemType;
}

export interface UploadFileParams {
  fileName: string;
  file: File;
  uploadPath: string;
  user: string;
  overwrite?: boolean;
}

export interface UploadFileBatchParams {
  files: {
    fileName: string;
    file: File;
  }[];
  uploadPath: string;
  user: string;
  overwrite?: boolean;
}

export interface CreateFolderParams {
  folderName: string;
  folderPath: string;
}

export interface ApiResponse<T> {
  status: number;
  message: string;
  data?: T;
}

export interface PresignedUrlData {
  fileName: string;
  status: FILE_STATUS;
  url: string;
}

export interface BatchPresignedUrlData extends PresignedUrlData {
  message: string;
}
