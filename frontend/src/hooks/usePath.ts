import { ROOT_PATH } from "@/lib/constants";
import { useState } from "react";

export const usePath = () => {
  const [pathFragments, setPathFragments] = useState([ROOT_PATH]);
  const [currentPath, setCurrentPath] = useState(ROOT_PATH);

  const addPath = (path: string) => {
    setPathFragments((prev) => [...prev, path]);
    setCurrentPath((prevPath) => {
      if (prevPath === ROOT_PATH) {
        return `${prevPath}${path}`;
      }
      return `${prevPath}/${path}`;
    });
  };

  const updateCurrentPath = (path: string) => {
    if (path === ROOT_PATH) {
      setCurrentPath("/");
      setPathFragments(["/"]);
      return;
    }

    // need the pieces of the path up to and including the specified path
    const pathIndex = pathFragments.indexOf(path);
    const newPathFragments = pathFragments.slice(0, pathIndex + 1);
    setPathFragments(newPathFragments);

    //construct the new path with the delimiters
    const newPath = newPathFragments[0] + newPathFragments.slice(1).join("/");
    setCurrentPath(newPath);
  };

  return { currentPath, pathFragments, addPath, updateCurrentPath };
};
