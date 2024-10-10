import { useMutation, useQueryClient } from "@tanstack/react-query";
import { useToast } from "./useToast";
import { FileParams } from "@/lib/types";
import { deleteFile } from "@/api/deleteFile";

const useDeleteFile = () => {
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
export default useDeleteFile;
