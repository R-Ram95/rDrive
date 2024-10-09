import { callApi } from "@/lib/callApi";
import { ROOT_PATH } from "@/lib/constants";
import { HTTP_METHOD } from "@/lib/enums";
import { DirectoryItemType } from "@/lib/types";

export async function getDirectory(
  parentFolder: string
): Promise<DirectoryItemType[]> {
  const route =
    parentFolder === ROOT_PATH
      ? `/directory?parentFolder=${parentFolder}`
      : `/directory?parentFolder=${parentFolder}/`;
  const response = await callApi<DirectoryItemType[]>(route, HTTP_METHOD.GET);

  return response.data ?? [];
}
