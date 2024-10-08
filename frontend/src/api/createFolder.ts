import { callApi } from "@/lib/callApi";
import { HTTP_METHOD } from "@/lib/enums";
import { CreateFolderParams } from "@/lib/types";

export async function createFolder({
  folderName,
  folderPath,
}: CreateFolderParams) {
  const folder = `${folderPath}${folderName}`;

  const response = await callApi<undefined>("/directory", HTTP_METHOD.POST, {
    directory: folder,
  });

  return response;
}
