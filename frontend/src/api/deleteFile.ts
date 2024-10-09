import { callApi } from "@/lib/callApi";
import { HTTP_METHOD } from "@/lib/enums";
import { FileParams } from "@/lib/types";

export async function deleteFile({ fileName, folderPath }: FileParams) {
  const body = {
    fileName: fileName,
    folderPath: folderPath,
  };

  const response = await callApi("/files", HTTP_METHOD.DELETE, body);

  return response;
}
