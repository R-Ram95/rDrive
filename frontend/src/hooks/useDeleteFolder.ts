import { useMutation, useQueryClient } from "@tanstack/react-query";
import { useToast } from "./useToast";
import { FolderParams } from "@/lib/types";
import { deleteFolder } from "@/api/deleteFolder";

const useDeleteFolder = () => {
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
export default useDeleteFolder;
