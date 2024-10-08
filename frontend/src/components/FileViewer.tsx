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
import { FileWithPath, useDropzone } from "react-dropzone";
import FileUploadPanel from "./FileUploadPanel";

interface FileViewerProps {
  currentPath: string;
  addPath: (folder: string) => void;
}
const FileViewer = ({ currentPath, addPath }: FileViewerProps) => {
  const { data: directoryData } = useListDirectory(currentPath);
  const { mutate: uploadFile } = useUploadFile();
  const fileInputRef = useRef<HTMLInputElement | null>(null);
  const [openFolderDialog, setOpenFolderDialog] = useState(false);
  const [showUploadPanel, setShowUploadPanel] = useState(true);
  const [minUploadPanel, setMinUploadPanel] = useState(true);
  const [isDragging, setIsDragging] = useState(false);

  const { acceptedFiles, getRootProps, getInputProps } = useDropzone({
    noClick: true,
    noKeyboard: true,
  });

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
    <div
      {...getRootProps({
        onDrop: () => {
          setShowUploadPanel(true);
          setMinUploadPanel(false);
          setIsDragging(false);
        },
        onDragEnter: () => {
          setIsDragging(true);
        },
        onDragEnd: () => {
          setIsDragging(false);
        },
        className: `text-white relative mt-2 p-4 border rounded-2xl h-full w-full overflow-y-scroll ${
          isDragging ? "border-primary" : "border-white/20"
        }  ${isDragging ? "bg-white/50" : "bg-white/5"}`,
      })}
    >
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
            <ContextMenu key={item.key}>
              <ContextMenuTrigger asChild>
                <TableRow onClick={() => handleItemClick(item)}>
                  <TableCell className="flex font-medium items-center">
                    {item.type === ItemType.FILE ? (
                      <i className="bx bx-file text-lg" />
                    ) : (
                      <i className="bx bx-folder text-lg" />
                    )}
                    <span className="ml-2">{item.name}</span>
                  </TableCell>
                  <TableCell>{item.uploadDate}</TableCell>
                  <TableCell>
                    {item.size > 0 ? `${item.size} KB` : "-"}
                  </TableCell>
                </TableRow>
              </ContextMenuTrigger>
            </ContextMenu>
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
          <FolderCreationDialog
            currentPath={currentPath}
            setOpenFolderDialog={setOpenFolderDialog}
          />
        </ContextMenu>
      </Dialog>

      <input
        ref={fileInputRef}
        type="file"
        className="hidden"
        onChange={(e) => handleFileUpload(e)}
      />

      <input {...getInputProps()} />

      {showUploadPanel && (
        <FileUploadPanel
          currentPath={currentPath}
          files={acceptedFiles as FileWithPath[]}
          setShowUploadPanel={setShowUploadPanel}
          minimizeUploadPanel={minUploadPanel}
          setMinimizeUploadPanel={setMinUploadPanel}
        />
      )}
    </div>
  );
};

export default FileViewer;
