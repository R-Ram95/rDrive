import { callApi } from "@/lib/callApi";
import { HTTP_METHOD } from "@/lib/enums";
import { GetDirectoryResponse } from "@/lib/types";
import { transformFolderPath } from "@/lib/utils";

export async function getDirectory(parentFolder: string) {
  const path = transformFolderPath(parentFolder);
  const route = `/directory?parentFolder=${path}`;

  const response = await callApi<GetDirectoryResponse | null>(
    route,
    HTTP_METHOD.GET
  );

  return response.data ?? null;
}
