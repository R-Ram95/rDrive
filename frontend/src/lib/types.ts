export interface FileType {
  fileKey: string;
  fileName: string;
  uploadDate: string;
  fileSize: number;
}

export interface DirectoryType {
  files: FileType[];
  subFolders: string[];
}
