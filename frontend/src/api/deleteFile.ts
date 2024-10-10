import { callApi } from "@/lib/callApi";
import { HTTP_METHOD } from "@/lib/enums";
import { FileParams } from "@/lib/types";
import { transformFolderPath } from "@/lib/utils";

export async function deleteFile({ fileName, folderPath }: FileParams) {
  const path = transformFolderPath(folderPath);
  const body = {
    fileName: fileName,
    folderPath: path,
  };

  const response = await callApi("/files", HTTP_METHOD.DELETE, body);

  return response;
}
