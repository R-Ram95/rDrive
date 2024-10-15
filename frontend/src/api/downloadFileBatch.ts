import { callApi } from "@/lib/callApi";
import { BATCH_SIZE } from "@/lib/constants";
import { HTTP_METHOD } from "@/lib/enums";
import { DownloadFileBatchParams, PresignedUrl } from "@/lib/types";
import { transformFolderPath } from "@/lib/utils";

export async function downloadFileBatch({
  files,
  folderPath,
  currentIndex,
}: DownloadFileBatchParams) {
  const path = transformFolderPath(folderPath);
  const startIndex = currentIndex;
  const endIndex = currentIndex + BATCH_SIZE;

  const filesToDownload = files.slice(startIndex, endIndex);

  const body = {
    files: filesToDownload.map((file) => ({
      folderPath: path,
      fileName: file.name,
    })),
  };

  const response = await callApi<PresignedUrl[]>(
    "/files/download/batch",
    HTTP_METHOD.POST,
    body
  );

  return response.data ?? null;
}
