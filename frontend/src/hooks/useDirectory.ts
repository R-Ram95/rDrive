import { useQuery } from "@tanstack/react-query";
import { callApi } from "@/lib/callApi";
import { HTTP_METHOD } from "@/lib/enums";
import { DirectoryType } from "@/lib/types";

const getDirectory = async (parentFolder: string): Promise<DirectoryType> => {
  const route = `/directory?parentFolder=${parentFolder}`;
  const response = await callApi(route, HTTP_METHOD.GET);
  return response.data;
};

export const useListDirectory = (parentFolder: string) => {
  const queryKey = ["directory", parentFolder];

  const { data, isLoading, isError, isSuccess } = useQuery<DirectoryType>({
    queryKey: queryKey,
    queryFn: () => getDirectory(parentFolder),
  });

  return { data, isLoading, isError, isSuccess };
};
