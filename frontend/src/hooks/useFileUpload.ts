import { useMutation, useQueryClient } from "@tanstack/react-query";
import { useToast } from "./useToast";
import { FileState, UploadFileParams } from "@/lib/types";
import { useState } from "react";
import { uploadFile } from "@/api/uploadFile";

const useUploadFile = () => {
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

export default useUploadFile;
