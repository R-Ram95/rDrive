import { callApi } from "@/lib/callApi";
import { HTTP_METHOD } from "@/lib/enums";
import { FolderParams } from "@/lib/types";
import { transformFolderPath } from "@/lib/utils";

export async function deleteFolder({ folderName, folderPath }: FolderParams) {
  const path = transformFolderPath(folderPath);
  const body = {
    parentFolderPath: path,
    folderName: `${folderName}/`,
  };

  const response = await callApi("/directory", HTTP_METHOD.DELETE, body);

  return response;
}
