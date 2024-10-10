import { callApi } from "@/lib/callApi";
import { HTTP_METHOD } from "@/lib/enums";
import { FolderParams } from "@/lib/types";
import { transformFolderPath } from "@/lib/utils";

export async function createFolder({ folderName, folderPath }: FolderParams) {
  const path = transformFolderPath(folderPath);
  const folder = `${path}${folderName}`;

  const response = await callApi<undefined>("/directory", HTTP_METHOD.POST, {
    directory: folder,
  });

  return response;
}
