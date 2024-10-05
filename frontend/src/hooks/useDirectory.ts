import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { callApi } from "@/lib/callApi";
import { HTTP_METHOD, ItemType } from "@/lib/enums";
import { DirectoryItemType } from "@/lib/types";
import dayjs from "dayjs";
import { useToast } from "./useToast";

interface UploadFileParams {
  fileName: string;
  file: File;
  uploadPath: string;
  user: string;
  overwrite?: boolean;
}

const getDirectory = async (
  parentFolder: string
): Promise<DirectoryItemType[]> => {
  const route = `/directory?parentFolder=${parentFolder}`;
  const response = await callApi(route, HTTP_METHOD.GET);

  return response.data.map((item: DirectoryItemType) => {
    return {
      ...item,
      uploadDate:
        item.type === ItemType.FILE
          ? dayjs(item.uploadDate).format("MM-DD-YYYY")
          : "-",
      size: Math.floor(item.size / 1000),
    };
  });
};

export async function uploadFile({
  fileName,
  file,
  uploadPath,
  user,
  overwrite = false,
}: UploadFileParams) {
  const body = {
    file: {
      fileName: fileName,
      folderPath: uploadPath,
      overwrite: overwrite,
    },
    user: user,
  };

  const urlResponse = await callApi("/files", HTTP_METHOD.POST, body);

  if (!urlResponse || !urlResponse.data || !urlResponse.data.url) {
    throw new Error("Failed to retrieve presigned URL");
  }

  const presignedUrl = urlResponse.data.url;

  return fetch(presignedUrl, {
    method: HTTP_METHOD.PUT,
    body: file,
    headers: {
      "Content-Type": file.type,
    },
  });
}

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
      });
    },
  });

  return { mutate };
};
