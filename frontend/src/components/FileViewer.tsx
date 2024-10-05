import { useListDirectory } from "@/hooks/useDirectory";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "./Table";
import { DirectoryItemType } from "@/lib/types";
import { ItemType } from "@/lib/enums";
import {
  ContextMenu,
  ContextMenuContent,
  ContextMenuItem,
  ContextMenuTrigger,
} from "./ContextMenu";
import { uploadFile } from "@/lib/fileUpload";
import { useRef } from "react";

interface FileViewerProps {
  currentPath: string;
  addPath: (folder: string) => void;
}
const FileViewer = ({ currentPath, addPath }: FileViewerProps) => {
  const { data: directoryData } = useListDirectory(currentPath);
  const fileInputRef = useRef<HTMLInputElement | null>(null);

  console.log(currentPath.slice(0, -1));
  const handleItemClick = (item: DirectoryItemType) => {
    if (item.type === ItemType.FOLDER) {
      addPath(item.name);
    }
  };

  const handleFileUploadClick = () => {
    if (fileInputRef.current) {
      fileInputRef.current.click();
    }
  };

  const handleFileUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      await uploadFile({
        fileName: file.name,
        file: file,
        uploadPath: currentPath.slice(0, -1), // kind of hacky but can fix later
        user: "me",
      });
    }
  };

  return (
    <div className="text-white mt-2 p-4 border rounded-2xl h-full w-full border-white/20 bg-white/5">
      <ContextMenu>
        <Table>
          <TableHeader>
            <TableRow className="hover:bg-transparent">
              <TableHead>Name</TableHead>
              <TableHead>Last Modified</TableHead>
              <TableHead>File Size</TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {directoryData?.map((item) => (
              <TableRow key={item.key} onClick={() => handleItemClick(item)}>
                <TableCell className="flex font-medium items-center">
                  {item.type === ItemType.FILE ? (
                    <i className="bx bx-file text-lg" />
                  ) : (
                    <i className="bx bx-folder text-lg" />
                  )}
                  <span className="ml-2">{item.name}</span>
                </TableCell>
                <TableCell>{item.uploadDate}</TableCell>
                <TableCell>{item.size > 0 ? `${item.size} KB` : "-"}</TableCell>
              </TableRow>
            ))}
          </TableBody>
        </Table>

        <ContextMenuContent className="w-48 bg-white/5 border-white/10 text-white">
          <ContextMenuItem onClick={handleFileUploadClick}>
            <i className="bx bxs-file-plus text-lg" />
            <span className="ml-2">Upload File</span>
          </ContextMenuItem>
          <ContextMenuItem>
            <i className="bx bx-folder-plus text-lg" />
            <span className="ml-2">Create Folder</span>
          </ContextMenuItem>
        </ContextMenuContent>
        <ContextMenuTrigger className="flex h-full"></ContextMenuTrigger>
      </ContextMenu>

      <input
        ref={fileInputRef}
        type="file"
        className="hidden"
        onChange={(e) => handleFileUpload(e)}
      />
    </div>
  );
};

export default FileViewer;
