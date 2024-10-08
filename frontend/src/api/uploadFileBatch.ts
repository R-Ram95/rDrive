import { callApi } from "@/lib/callApi";
import { FILE_STATUS, HTTP_METHOD } from "@/lib/enums";
import { BatchPresignedUrlData, UploadFileAPIArgs } from "@/lib/types";

export async function uploadFileBatch({
  files,
  uploadPath,
  user,
  onProgressUpdate,
  overwrite = false,
}: UploadFileAPIArgs) {
  const filesRequest = files.map((file) => {
    return {
      folderPath: uploadPath,
      fileName: file.name,
      overwrite: overwrite,
    };
  });
  const body = {
    files: filesRequest,
    user: user,
  };

  const urlResponse = await callApi<BatchPresignedUrlData[]>(
    "/files/batch",
    HTTP_METHOD.POST,
    body
  );

  const urlList = urlResponse?.data;

  const existingFiles: string[] = [];
  urlList?.forEach((url) => {
    if (url.status === FILE_STATUS.CONFLICT) {
      existingFiles.push(url.fileName);
    }
  });

  if (existingFiles.length > 0) {
    throw new Error("One or more of the files you added already exist.");
  }

  const filePromiseList =
    urlList?.map(async (item, index) => {
      const file = files.find((file) => file.name === item.fileName);

      return await fetch(item.url, {
        method: HTTP_METHOD.PUT,
        body: file,
        headers: {
          "Content-Type": file?.type ?? "",
        },
      })
        .then(() => {
          // update state on success
          onProgressUpdate(index, {
            isLoading: false,
            isSuccess: true,
            isError: false,
          });
        })
        // update state on failure
        .catch(() => {
          onProgressUpdate(index, {
            isLoading: false,
            isSuccess: false,
            isError: true,
          });
        });
    }) ?? [];

  return Promise.all(filePromiseList);
}
