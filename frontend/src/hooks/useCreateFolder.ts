import { useMutation, useQueryClient } from "@tanstack/react-query";
import { useToast } from "./useToast";
import { FolderParams } from "@/lib/types";
import { createFolder } from "@/api/createFolder";

const useCreateFolder = () => {
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

export default useCreateFolder;
