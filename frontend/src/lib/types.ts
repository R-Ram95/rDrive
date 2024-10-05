import { ItemType } from "./enums";

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

export interface CreateFolderParams {
  folderName: string;
  folderPath: string;
}
