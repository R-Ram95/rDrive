import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import {
  DirectoryItemType,
  FileParams,
  FileState,
  FolderParams,
  UploadFileBatchParams,
  UploadFileParams,
} from "@/lib/types";
import { useToast } from "./useToast";
import { getDirectory } from "@/api/getDirectory";
import { uploadFile } from "@/api/uploadFile";
import { createFolder } from "@/api/createFolder";
import { ItemType } from "@/lib/enums";
import dayjs from "dayjs";
import { useState } from "react";
import { uploadFileBatch } from "@/api/uploadFileBatch";
import { deleteFile } from "@/api/deleteFile";
import { deleteFolder } from "@/api/deleteFolder";
import { downloadFile } from "@/api/downloadFile";

export const useListDirectory = (parentFolder: string) => {
  const queryKey = ["directory", parentFolder];

  const { data, isLoading, isError, isSuccess } = useQuery<DirectoryItemType[]>(
    {
      queryKey: queryKey,
      queryFn: () => getDirectory(parentFolder),
      select(data) {
        return data.map((item) => {
          return {
            ...item,
            uploadDate:
              item.type === ItemType.FILE
                ? dayjs(item.uploadDate).format("MM-DD-YYYY")
                : "-",
            size: Math.floor(item.size / 1000),
          };
        });
      },
    }
  );

  return { data, isLoading, isError, isSuccess };
};

export const useUploadFile = () => {
  const { toast } = useToast();
  const queryClient = useQueryClient();
  const [uploadItem, setUploadItem] = useState<FileState>();

  const { mutate } = useMutation({
    mutationFn: (data: UploadFileParams) => uploadFile(data),
    onMutate: (inputData: UploadFileParams) => {
      const { file } = inputData;
      const newFileState: FileState = {
        ...file,
        name: file.name,
        isLoading: true,
        isSuccess: false,
        isError: false,
      };
      setUploadItem(newFileState);
    },
    onSuccess: (_, inputData) => {
      const { file, uploadPath } = inputData;
      const newFileState: FileState = {
        ...file,
        name: file.name,
        isLoading: false,
        isSuccess: true,
        isError: false,
      };
      setUploadItem(newFileState);

      toast({
        title: "File Uploaded!",
        description: `${file.name}`,
      });

      const queryKey = ["directory", uploadPath];
      queryClient.invalidateQueries({ queryKey: queryKey });
    },
    onError: (error, inputData) => {
      const { file } = inputData;
      const newFileState: FileState = {
        ...file,
        name: file.name,
        isLoading: false,
        isSuccess: false,
        isError: true,
      };

      setUploadItem(newFileState);
      toast({
        title: `File Upload Failed `,
        description: `${file.name} upload failed due to ${error.message}`,
        variant: "destructive",
      });
    },
  });

  return { mutate, uploadItem };
};

export const useCreateFolder = () => {
  const { toast, dismiss } = useToast();
  const queryClient = useQueryClient();
  const { mutate } = useMutation({
    mutationFn: (data: FolderParams) => createFolder(data),
    onMutate: (inputData) => {
      const { folderName } = inputData;
      toast({
        title: "Creating Folder...",
        description: `${folderName}`,
      });
    },
    onSuccess: (_, inputData) => {
      const { folderName, folderPath } = inputData;
      dismiss();
      toast({
        title: "Folder Created!",
        description: `${folderName}`,
      });
      const queryKey = ["directory", folderPath];
      queryClient.invalidateQueries({ queryKey });
    },
    onError: (error, inputData) => {
      const { folderName } = inputData;
      toast({
        title: "Folder Creation Failed",
        description: `${folderName} creation failed due to ${error.message}`,
        variant: "destructive",
      });
    },
  });

  return { mutate };
};

export const useUploadFileBatch = () => {
  const [uploadItems, setUploadItems] = useState<FileState[]>([]);
  const queryClient = useQueryClient();
  const { toast } = useToast();

  const updateProgress = (
    fileIndex: number,
    progress: { isLoading: boolean; isSuccess: boolean; isError: boolean }
  ) => {
    setUploadItems((prevItems) =>
      prevItems.map((item, index) =>
        index === fileIndex ? { ...item, ...progress } : item
      )
    );
  };

  const { mutate, error } = useMutation({
    mutationFn: (data: UploadFileBatchParams) => {
      return uploadFileBatch({
        ...data,
        onProgressUpdate: updateProgress,
      });
    },
    onMutate: (inputData: UploadFileBatchParams) => {
      const { files } = inputData;
      const newFiles: FileState[] = files.map((file) => {
        return {
          ...file,
          name: file.name,
          isLoading: true,
          isSuccess: false,
          isError: false,
        };
      });

      setUploadItems(newFiles);
    },
    onSuccess: (_, inputData) => {
      const { uploadPath } = inputData;
      const queryKey = ["directory", uploadPath];
      queryClient.invalidateQueries({ queryKey: queryKey });
    },
    onError: (error, inputData) => {
      const { files } = inputData;
      setUploadItems((prevItems) =>
        prevItems.map((item) => ({ ...item, isError: true, isLoading: false }))
      );
      const fileNames = files.map((file) => file.name).join(", ");
      toast({
        title: "File Upload Failed",
        description: `${fileNames} failed to upload due to ${error.message}`,
        variant: "destructive",
      });
    },
  });

  return { mutate, error, uploadItems };
};

export const useDeleteFile = () => {
  const { toast, dismiss } = useToast();
  const queryClient = useQueryClient();

  const { mutate } = useMutation({
    mutationFn: (inputData: FileParams) => deleteFile(inputData),
    onMutate: (inputData) => {
      const { fileName } = inputData;
      toast({ title: "Deleting File...", description: `${fileName}` });
    },
    onSuccess: (_, inputData) => {
      const { fileName } = inputData;
      dismiss();
      toast({
        title: "File Deleted!",
        description: `${fileName}`,
      });
      const queryKey = ["directory", inputData.folderPath];
      queryClient.invalidateQueries({ queryKey: queryKey });
    },
    onError: (error, inputData) => {
      const { fileName } = inputData;
      toast({
        title: "File Deletion Failed",
        description: `Failed to delete ${fileName} due to ${error.message}`,
        variant: "destructive",
      });
    },
  });

  return { mutate };
};

export const useDeleteFolder = () => {
  const { toast, dismiss } = useToast();
  const queryClient = useQueryClient();
  const { mutate } = useMutation({
    mutationFn: (inputData: FolderParams) => deleteFolder(inputData),
    onMutate: (inputData) => {
      const { folderName } = inputData;
      toast({ title: "Deleting Folder...", description: `${folderName}` });
    },
    onSuccess: (_, inputData) => {
      const queryKey = ["directory", inputData.folderPath];
      queryClient.invalidateQueries({ queryKey: queryKey });
      dismiss();
      toast({
        title: "Folder Deleted",
        description: `${inputData.folderName}`,
      });
    },
    onError: (error, inputData) => {
      const { folderName } = inputData;
      toast({
        title: `Folder Deletion Failed`,
        description: `Failed to delete ${folderName} due to ${error.message}`,
        variant: "destructive",
      });
    },
  });

  return { mutate };
};

export const useDownloadFile = () => {
  const { toast, dismiss } = useToast();
  const { mutate } = useMutation({
    mutationFn: (data: FileParams) =>
      downloadFile(data.folderPath, data.fileName),
    onMutate: (inputData) => {
      toast({
        title: "File Downloading...",
        description: `${inputData.fileName}`,
      });
    },
    onSuccess: async (data, inputData) => {
      const blob = await data.blob();
      const downloadUrl = window.URL.createObjectURL(blob);
      const link = document.createElement("a");
      link.href = downloadUrl;
      link.download = inputData.fileName;
      document.body.appendChild(link);
      link.click();
      document.body.removeChild(link);
      window.URL.revokeObjectURL(downloadUrl);
      dismiss();
    },
    onError: (error, inputData) => {
      const { fileName } = inputData;
      toast({
        title: "Download Failure",
        description: `Failed to download${fileName} due to ${error.message}`,
        variant: "destructive",
      });
    },
  });

  return { mutate };
};
