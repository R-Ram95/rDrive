import { callApi } from "@/lib/callApi";
import { HTTP_METHOD } from "@/lib/enums";
import { UploadFileParams, PresignedUrl } from "@/lib/types";
import { transformFolderPath } from "@/lib/utils";

export async function uploadFile({
  file,
  uploadPath,
  user,
  overwrite = false,
}: UploadFileParams) {
  const path = transformFolderPath(uploadPath);
  const body = {
    file: {
      fileName: file.name,
      folderPath: path,
      overwrite: overwrite,
    },
    user: user,
  };

  const urlResponse = await callApi<PresignedUrl>(
    "/files",
    HTTP_METHOD.POST,
    body
  );

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
