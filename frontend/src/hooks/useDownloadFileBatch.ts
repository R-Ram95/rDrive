import { downloadFileBatch } from "@/api/downloadFileBatch";
import { DownloadFileBatchParams } from "@/lib/types";
import { useQuery } from "@tanstack/react-query";

const useDownloadBatchFile = ({
  files,
  folderPath,
}: DownloadFileBatchParams) => {
  const queryKey = ["/files", folderPath];
  const { data, isLoading, isError } = useQuery({
    queryKey,
    queryFn: () => downloadFileBatch({ files, folderPath }),
  });

  return { data, isLoading, isError };
};

export default useDownloadBatchFile;
