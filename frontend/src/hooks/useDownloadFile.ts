import { useMutation } from "@tanstack/react-query";
import { useToast } from "./useToast";
import { FileParams } from "@/lib/types";
import { downloadFile } from "@/api/downloadFile";

const useDownloadFile = () => {
  const { toast, dismiss } = useToast();
  const { mutate } = useMutation({
    mutationFn: (data: FileParams) =>
      downloadFile(data.folderPath, data.fileName),
    onMutate: (inputData) => {
      toast({
        title: "File Downloading...",
        description: `${inputData.fileName}`,
      });
    },
    onSuccess: async (data, inputData) => {
      const blob = await data.blob();
      const downloadUrl = window.URL.createObjectURL(blob);
      const link = document.createElement("a");
      link.href = downloadUrl;
      link.download = inputData.fileName;
      document.body.appendChild(link);
      link.click();
      document.body.removeChild(link);
      window.URL.revokeObjectURL(downloadUrl);
      dismiss();
    },
    onError: (error, inputData) => {
      const { fileName } = inputData;
      toast({
        title: "Download Failure",
        description: `Failed to download${fileName} due to ${error.message}`,
        variant: "destructive",
      });
    },
  });

  return { mutate };
};

export default useDownloadFile;
