import { clsx, type ClassValue } from "clsx";
import { twMerge } from "tailwind-merge";
import { ROOT_PATH } from "./constants";

export function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs));
}

export function transformFolderPath(folderPath: string) {
  if (folderPath === ROOT_PATH) {
    return folderPath;
  }

  return `${folderPath}/`;
}
