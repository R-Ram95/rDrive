import { callApi } from "@/lib/callApi";
import { HTTP_METHOD } from "@/lib/enums";
import { FolderParams } from "@/lib/types";

export async function deleteFolder({ folderName, folderPath }: FolderParams) {
  const body = {
    parentFolderPath: `${folderPath}/`,
    folderName: `${folderName}/`,
  };

  const response = await callApi("/directory", HTTP_METHOD.DELETE, body);

  return response;
}
