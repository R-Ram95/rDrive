import { useListDirectory } from "../hooks/useDirectory";

const FileViewer = () => {
  const { data: directoryData } = useListDirectory("/");
  const { files, subFolders } = directoryData ?? {};
  console.log(subFolders);

  return (
    <div className="text-white mt-10 mx-10 p-5 border w-full h-full border-dotted border-white">
      <ul>
        {files?.map((file) => (
          <li>{file.fileName}</li>
        ))}
      </ul>
      <ul>
        {" "}
        {subFolders?.map((folder) => (
          <li>{folder}</li>
        ))}
      </ul>
    </div>
  );
};

export default FileViewer;
