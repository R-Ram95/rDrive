import { downloadFileBatch } from "@/api/downloadFileBatch";
import { BATCH_SIZE } from "@/lib/constants";
import { DownloadFileBatchParams } from "@/lib/types";
import { useInfiniteQuery } from "@tanstack/react-query";

const useDownloadBatchFile = ({
  files,
  folderPath,
  currentIndex,
}: DownloadFileBatchParams) => {
  const startIndex = Math.max(currentIndex - Math.floor(BATCH_SIZE / 2), 0);
  const endIndex = Math.min(
    currentIndex + Math.floor(BATCH_SIZE / 2),
    files.length
  );

  const queryKey = ["files-download", folderPath, startIndex, endIndex];

  const { data, fetchNextPage, fetchPreviousPage, isLoading } =
    useInfiniteQuery({
      queryKey: queryKey,
      queryFn: ({ pageParam = startIndex }) =>
        downloadFileBatch({
          files,
          folderPath,
          currentIndex: pageParam,
        }),
      initialPageParam: startIndex,
      getNextPageParam: (_, pages) => {
        const nextIndex = pages.flat().length;
        return nextIndex < files.length ? nextIndex : undefined;
      },
    });

  return { data, fetchNextPage, fetchPreviousPage, isLoading };
};

export default useDownloadBatchFile;
