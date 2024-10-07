import { useListDirectory, useUploadFile } from "@/hooks/useDirectory";
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
import { ChangeEvent, useRef, useState } from "react";
import { Dialog } from "./Dialog";
import FolderCreationDialog from "./FolderCreationDialog";

interface FileViewerProps {
  currentPath: string;
  addPath: (folder: string) => void;
}
const FileViewer = ({ currentPath, addPath }: FileViewerProps) => {
  const { data: directoryData } = useListDirectory(currentPath);
  const { mutate: uploadFile } = useUploadFile();
  const fileInputRef = useRef<HTMLInputElement | null>(null);
  const [openFolderDialog, setOpenFolderDialog] = useState(false);

  const handleItemClick = (item: DirectoryItemType) => {
    if (item.type === ItemType.FOLDER) {
      addPath(item.name);
    }
  };

  const handleUploadClick = () => {
    if (fileInputRef.current) {
      fileInputRef.current.click();
    }
  };

  const handleFileUpload = async (e: ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      uploadFile({
        fileName: file.name,
        file: file,
        uploadPath: currentPath === "/" ? "/" : currentPath.slice(0, -1), // kind of hacky but can fix later
        user: "me",
      });
    }
  };

  return (
    <div className="text-white mt-2 p-4 border rounded-2xl h-full w-full border-white/20 bg-white/5">
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

      <Dialog open={openFolderDialog}>
        <ContextMenu>
          <ContextMenuContent className="w-48 bg-white/5 border-white/10 text-white">
            <ContextMenuItem onClick={handleUploadClick}>
              <i className="bx bxs-file-plus text-lg" />
              <span className="ml-2">Upload File</span>
            </ContextMenuItem>
            <ContextMenuItem onClick={() => setOpenFolderDialog(true)}>
              <i className="bx bx-folder-plus text-lg" />
              <span className="ml-2">Create Folder</span>
            </ContextMenuItem>
          </ContextMenuContent>
          <ContextMenuTrigger className="flex h-full"></ContextMenuTrigger>
        </ContextMenu>
        <FolderCreationDialog
          currentPath={currentPath}
          setOpenFolderDialog={setOpenFolderDialog}
        />
      </Dialog>

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
