import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { DirectoryItemType, UploadFileParams } from "@/lib/types";
import { useToast } from "./useToast";
import { getDirectory } from "@/api/getDirectory";
import { uploadFile } from "@/api/uploadFile";

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
    onSuccess: (_, variables) => {
      toast({
        title: `${variables.fileName} uploaded successfully!`,
      });

      const queryKey = ["directory", variables.uploadPath];
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
