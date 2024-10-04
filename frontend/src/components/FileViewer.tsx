import { useListDirectory } from "@/hooks/useDirectory";
import {
  Breadcrumb,
  BreadcrumbItem,
  BreadcrumbList,
  BreadcrumbSeparator,
} from "@/components/BreadCrumbs";
import { useState } from "react";

const ROOT_PATH = "/";

const FileViewer = () => {
  const rootPath = "/";
  const [pathFragments, setPathFragments] = useState([rootPath]);
  const [currentPath, setCurrentPath] = useState(rootPath);
  const { data: directoryData } = useListDirectory(currentPath);
  const { files, subFolders } = directoryData ?? {};

  const addPath = (path: string) => {
    setPathFragments((prev) => [...prev, path]);
    setCurrentPath((prevPath) => prevPath + `${path}/`);
  };

  const updateCurrentPath = (path: string) => {
    if (path === ROOT_PATH) {
      setCurrentPath("/");
      setPathFragments(["/"]);
      return;
    }

    // need the pieces of the path up and including the specified path
    const pathIndex = pathFragments.indexOf(path);
    const newPathFragments = pathFragments.slice(0, pathIndex + 1);
    setPathFragments(newPathFragments);

    //construct the new path with the delimiters
    const newPath =
      newPathFragments[0] + newPathFragments.slice(1).join("/") + "/";
    setCurrentPath(newPath);
  };

  const handleFolderClick = (folder: string) => {
    addPath(folder);
  };

  return (
    <div className="text-white mt-10 mx-10 p-5 border w-full border-dotted border-white">
      <Breadcrumb>
        <BreadcrumbList className="text-lg text-white">
          {pathFragments.map((fragment) => (
            <>
              <BreadcrumbItem
                className="hover:cursor-pointer hover:bg-slate-50/10 rounded-full py-1 px-2 "
                onClick={() => updateCurrentPath(fragment)}
              >
                {fragment === ROOT_PATH ? "Home" : fragment}
              </BreadcrumbItem>
              {pathFragments.length > 1 && <BreadcrumbSeparator />}
            </>
          ))}
        </BreadcrumbList>
      </Breadcrumb>
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
