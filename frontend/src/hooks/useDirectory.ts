import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import {
  CreateFolderParams,
  DirectoryItemType,
  UploadFileParams,
} from "@/lib/types";
import { useToast } from "./useToast";
import { getDirectory } from "@/api/getDirectory";
import { uploadFile } from "@/api/uploadFile";
import { createFolder } from "@/api/createFolder";

export const useListDirectory = (parentFolder: string) => {
  const queryKey = ["directory", parentFolder];

  const { data, isLoading, isError, isSuccess } = useQuery<DirectoryItemType[]>(
    {
      queryKey: queryKey,
      queryFn: () => getDirectory(parentFolder),
    }
  );

  return { data, isLoading, isError, isSuccess };
};

export const useUploadFile = () => {
  const { toast } = useToast();
  const queryClient = useQueryClient();

  const { mutate } = useMutation({
    mutationFn: (data: UploadFileParams) => uploadFile(data),
    onSuccess: (_, inputData) => {
      toast({
        title: `${inputData.fileName} uploaded successfully!`,
      });

      const queryKey = ["directory", inputData.uploadPath];
      queryClient.invalidateQueries({ queryKey: queryKey });
    },
    onError: (error, variables) => {
      toast({
        title: `Failed to upload ${variables.fileName}`,
        description: error.message,
        variant: "destructive",
      });
    },
  });

  return { mutate };
};

export const useCreateFolder = () => {
  const { toast } = useToast();
  const queryClient = useQueryClient();
  const { mutate } = useMutation({
    mutationFn: (data: CreateFolderParams) => createFolder(data),
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
