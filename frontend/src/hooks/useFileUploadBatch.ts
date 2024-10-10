import { FileState, UploadFileBatchParams } from "@/lib/types";
import { useMutation, useQueryClient } from "@tanstack/react-query";
import { useState } from "react";
import { useToast } from "./useToast";
import { uploadFileBatch } from "@/api/uploadFileBatch";

const useFileUploadBatch = () => {
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

export default useFileUploadBatch;
