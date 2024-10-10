import { callApi } from "@/lib/callApi";
import { HTTP_METHOD } from "@/lib/enums";
import { DirectoryItemType } from "@/lib/types";
import { transformFolderPath } from "@/lib/utils";

export async function getDirectory(
  parentFolder: string
): Promise<DirectoryItemType[]> {
  const path = transformFolderPath(parentFolder);
  console.log(path);
  const route = `/directory?parentFolder=${path}`;

  const response = await callApi<DirectoryItemType[]>(route, HTTP_METHOD.GET);

  return response.data ?? [];
}
