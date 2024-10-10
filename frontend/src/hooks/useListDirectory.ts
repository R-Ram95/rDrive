import { getDirectory } from "@/api/getDirectory";
import { ItemType } from "@/lib/enums";
import { GetDirectoryResponse } from "@/lib/types";
import { useQuery } from "@tanstack/react-query";
import dayjs from "dayjs";

const useListDirectory = (parentFolder: string) => {
  const queryKey = ["directory", parentFolder];

  const { data, isLoading, isError, isSuccess } =
    useQuery<GetDirectoryResponse | null>({
      queryKey: queryKey,
      queryFn: () => getDirectory(parentFolder),
      select(data) {
        return {
          folders:
            data?.folders.map((item) => ({
              ...item,
              uploadDate:
                item.type === ItemType.FILE
                  ? dayjs(item.uploadDate).format("MM-DD-YYYY")
                  : "-",
              size: Math.floor(item.size / 1000),
            })) ?? [],
          files:
            data?.files.map((item) => ({
              ...item,
              uploadDate:
                item.type === ItemType.FILE
                  ? dayjs(item.uploadDate).format("MM-DD-YYYY")
                  : "-",
              size: Math.floor(item.size / 1000),
            })) ?? [],
        };
      },
    });

  return { data, isLoading, isError, isSuccess };
};
export default useListDirectory;
