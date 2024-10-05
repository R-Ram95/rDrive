import { useQuery } from "@tanstack/react-query";
import { callApi } from "@/lib/callApi";
import { HTTP_METHOD, ItemType } from "@/lib/enums";
import { DirectoryItemType } from "@/lib/types";
import dayjs from "dayjs";

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
