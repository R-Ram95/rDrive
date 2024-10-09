import { FileWithPath } from "react-dropzone";
import { FILE_STATUS, ItemType } from "./enums";

export interface DirectoryItemType {
  key: string;
  name: string;
  uploadDate: string;
  size: number;
  type: ItemType;
}
export interface UploadFileParams {
  file: FileWithPath;
  uploadPath: string;
  user: string;
  overwrite?: boolean;
}

export interface FileState extends FileWithPath {
  isLoading: boolean;
  isSuccess: boolean;
  isError: boolean;
}

export interface UploadFileBatchParams {
  files: FileWithPath[];
  uploadPath: string;
  user: string;
  overwrite?: boolean;
}

export interface UploadFileAPIArgs extends UploadFileBatchParams {
  onProgressUpdate: (
    index: number,
    progress: { isLoading: boolean; isSuccess: boolean; isError: boolean }
  ) => void;
}

export interface FolderParams {
  folderName: string;
  folderPath: string;
}

export interface FileParams {
  fileName: string;
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
