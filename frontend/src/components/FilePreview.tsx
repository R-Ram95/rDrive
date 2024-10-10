import { useDownloadBatchFile } from "@/hooks/useDirectory";
import { DirectoryItemType } from "@/lib/types";

interface FilePreviewProps {
  currentPath: string;
  currentFileIndex: number;
  directoryList: DirectoryItemType[];
  close: () => void;
}

const FilePreview = ({
  currentPath,
  currentFileIndex,
  directoryList,
  close,
}: FilePreviewProps) => {
  const { data } = useDownloadBatchFile({
    files: directoryList,
    folderPath: currentPath,
  });

  const fileUrl = data?.at(currentFileIndex)?.url;

  console.log(data);
  return (
    <div
      className="fixed top-0 left-0 bg-black/50 h-full w-full"
      onClick={() => close()}
    >
      <div className=" absolute">close icon</div>
      <div className=" absolute top-1/2">left arrow</div>
      <div className=" absolute top-1/2 right-0">right arrow</div>
      <div className="relative left-1/2 top-1/2">
        <img src={fileUrl} alt="" className="max-w-1/2" />
      </div>
    </div>
  );
};

export default FilePreview;
