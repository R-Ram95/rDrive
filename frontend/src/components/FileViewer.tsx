import { useListDirectory } from "@/hooks/useDirectory";

interface FileViewerProps {
  currentPath: string;
  addPath: (folder: string) => void;
}
const FileViewer = ({ currentPath, addPath }: FileViewerProps) => {
  const { data: directoryData } = useListDirectory(currentPath);
  const { files, subFolders } = directoryData ?? {};

  const handleFolderClick = (folder: string) => {
    addPath(folder);
  };

  return (
    <div className="text-white mt-10 border w-full border-dotted border-white">
      <ul>
        {files?.map((file) => (
          <li>{file.fileName}</li>
        ))}
      </ul>
      <ul>
        {subFolders?.map((folder) => (
          <li onClick={() => handleFolderClick(folder)}>{folder}</li>
        ))}
      </ul>
    </div>
  );
};

export default FileViewer;
