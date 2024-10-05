import { callApi } from "./callApi";
import { HTTP_METHOD } from "./enums";

interface UploadFileProps {
  fileName: string;
  file: File;
  uploadPath: string;
  user: string;
  overwrite?: boolean;
}

export async function uploadFile({
  fileName,
  file,
  uploadPath,
  user,
  overwrite = false,
}: UploadFileProps) {
  const body = {
    file: {
      fileName: fileName,
      folderPath: uploadPath,
      overwrite: overwrite,
    },
    user: user,
  };

  const urlResponse = await callApi("/files", HTTP_METHOD.POST, body);

  if (!urlResponse || !urlResponse.data || !urlResponse.data.url) {
    throw new Error("Failed to retrieve presigned URL");
  }

  const presignedUrl = urlResponse.data.url;

  try {
    const response = await fetch(presignedUrl, {
      method: HTTP_METHOD.PUT,
      body: file,
      headers: {
        "Content-Type": file.type,
      },
    });

    if (response.ok) {
      console.log("File uploaded successfully");
    } else {
      console.log(`Failed to upload file. Status code: ${response.status}`);
    }
  } catch (error) {
    console.error("Error uploading file:", error);
  }
}
