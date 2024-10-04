import { ROOT_PATH } from "@/lib/constants";
import { useState } from "react";

export const usePath = () => {
  const [pathFragments, setPathFragments] = useState([ROOT_PATH]);
  const [currentPath, setCurrentPath] = useState(ROOT_PATH);
};
