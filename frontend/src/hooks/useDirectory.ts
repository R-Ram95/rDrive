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
      const newFileState: FileState = {
        ...inputData.file,
        name: inputData.file.name,
        isLoading: true,
        isSuccess: false,
        isError: false,
      };

      setUploadItem(newFileState);
    },
    onSuccess: (_, inputData) => {
      const newFileState: FileState = {
        ...inputData.file,
        name: inputData.file.name,
        isLoading: false,
        isSuccess: true,
        isError: false,
      };

      setUploadItem(newFileState);

      toast({
        title: `${inputData.file.name} uploaded successfully!`,
      });

      const queryKey = ["directory", inputData.uploadPath];
      queryClient.invalidateQueries({ queryKey: queryKey });
    },
    onError: (error, inputData) => {
      const newFileState: FileState = {
        ...inputData.file,
        name: inputData.file.name,
        isLoading: false,
        isSuccess: false,
        isError: true,
      };

      setUploadItem(newFileState);
      toast({
        title: `Failed to upload ${inputData.file.name}`,
        description: error.message,
        variant: "destructive",
      });
    },
  });

  return { mutate, uploadItem };
};

export const useCreateFolder = () => {
  const { toast } = useToast();
  const queryClient = useQueryClient();
  const { mutate } = useMutation({
    mutationFn: (data: FolderParams) => createFolder(data),
    onSuccess: (_, inputData) => {
      toast({
        title: `${inputData.folderName} has been created!`,
      });
      const queryKey = ["directory", inputData.folderPath];
      queryClient.invalidateQueries({ queryKey });
    },
    onError: (error, inputData) => {
      toast({
        title: `Failed to create ${inputData.folderName}`,
        description: error.message,
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
    onMutate: (data: UploadFileBatchParams) => {
      const newFiles: FileState[] = data.files.map((file) => {
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
      const queryKey = ["directory", inputData.uploadPath];
      queryClient.invalidateQueries({ queryKey: queryKey });
    },
    onError: (error) => {
      setUploadItems((prevItems) =>
        prevItems.map((item) => ({ ...item, isError: true, isLoading: false }))
      );
      toast({
        title: "File conflict",
        description: error.message,
        variant: "destructive",
      });
    },
  });

  return { mutate, error, uploadItems };
};

export const useDeleteFile = () => {
  const { toast } = useToast();
  const queryClient = useQueryClient();

  const { mutate } = useMutation({
    mutationFn: (data: FileParams) => deleteFile(data),
    onSuccess: (_, inputData) => {
      toast({
        title: `${inputData.fileName} has been deleted!`,
      });
      const queryKey = ["directory", inputData.folderPath];
      queryClient.invalidateQueries({ queryKey: queryKey });
    },
    onError: (error, inputData) => {
      toast({
        title: `Failed to delete ${inputData.fileName} :(`,
        description: error.message,
        variant: "destructive",
      });
    },
  });

  return { mutate };
};

export const useDeleteFolder = () => {
  const { toast } = useToast();
  const queryClient = useQueryClient();
  const { mutate } = useMutation({
    mutationFn: (data: FolderParams) => deleteFolder(data),
    onSuccess: (_, inputData) => {
      const queryKey = ["directory", inputData.folderPath];
      queryClient.invalidateQueries({ queryKey: queryKey });

      toast({
        title: `${inputData.folderName} has been deleted!`,
      });
    },
    onError: (error, inputData) => {
      toast({
        title: `Failed to delete ${inputData.folderName} :(`,
        description: error.message,
        variant: "destructive",
      });
    },
  });

  return { mutate };
};

export const useDownloadFile = () => {
  const { mutate } = useMutation({
    mutationFn: (data: FileParams) =>
      downloadFile(data.folderPath, data.fileName),
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
    },
  });

  return { mutate };
};
