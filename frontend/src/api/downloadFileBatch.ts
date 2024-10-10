import { callApi } from "@/lib/callApi";
import { HTTP_METHOD } from "@/lib/enums";
import { DownloadFileBatchParams, PresignedUrl } from "@/lib/types";

export async function downloadFileBatch({
  files,
  folderPath,
}: DownloadFileBatchParams) {
  const body = {
    files: files.map((file) => ({
      folderPath: folderPath,
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
