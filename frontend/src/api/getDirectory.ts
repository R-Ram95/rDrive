import { callApi } from "@/lib/callApi";
import { HTTP_METHOD, ItemType } from "@/lib/enums";
import { DirectoryItemType } from "@/lib/types";
import dayjs from "dayjs";

export const getDirectory = async (
  parentFolder: string
): Promise<DirectoryItemType[]> => {
  const route = `/directory?parentFolder=${parentFolder}`;
  const response = await callApi(route, HTTP_METHOD.GET);

  return response.data.map((item: DirectoryItemType) => {
    return {
      ...item,
      uploadDate:
        item.type === ItemType.FILE
          ? dayjs(item.uploadDate).format("MM-DD-YYYY")
          : "-",
      size: Math.floor(item.size / 1000),
    };
  });
};
