import { callApi } from "@/lib/callApi";
import { FILE_STATUS, HTTP_METHOD } from "@/lib/enums";
import { DownloadPresignedUrlData } from "@/lib/types";

export async function downloadFile(folderPath: string, fileName: string) {
  const body = {
    folderPath: folderPath,
    fileName: fileName,
  };

  const response = await callApi<DownloadPresignedUrlData>(
    "/files/download",
    HTTP_METHOD.POST,
    body
  );

  if (!response.data || response.data.status !== FILE_STATUS.CREATED) {
    throw new Error("Failed to retrieve presigned url");
  }

  const url = response.data.url;

  return fetch(url, {
    method: HTTP_METHOD.GET,
  });
}
