import {
  useDeleteFile,
  useDeleteFolder,
  useDownloadFile,
  useListDirectory,
} from "@/hooks/useDirectory";
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
import { useState } from "react";
import { Dialog } from "./Dialog";
import FolderCreationDialog from "./FolderCreationDialog";
import { FileWithPath, useDropzone } from "react-dropzone";
import FileUploadPanel from "./FileUploadPanel";
import { FileMinusIcon, DownloadIcon } from "@radix-ui/react-icons";
import TableSkeleton from "./Table.skeleton";

interface FileViewerProps {
  currentPath: string;
  addPath: (folder: string) => void;
}
const FileViewer = ({ currentPath, addPath }: FileViewerProps) => {
  const { data: directoryData, isLoading: directoryLoading } =
    useListDirectory(currentPath);
  const [openFolderDialog, setOpenFolderDialog] = useState(false);
  const [showUploadPanel, setShowUploadPanel] = useState(false);
  const [minUploadPanel, setMinUploadPanel] = useState(true);
  const [isDragging, setIsDragging] = useState(false);
  const { mutate: deleteFile } = useDeleteFile();
  const { mutate: deleteFolder } = useDeleteFolder();
  const { mutate: downloadFile } = useDownloadFile();

  const { acceptedFiles, getRootProps, getInputProps, open } = useDropzone({
    noClick: true,
    noKeyboard: true,
  });

  const handleItemClick = (item: DirectoryItemType) => {
    if (item.type === ItemType.FOLDER) {
      addPath(item.name);
    }
  };

  const handleUploadClick = () => {
    open();
    setShowUploadPanel(true);
    setMinUploadPanel(false);
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
      {directoryLoading && <TableSkeleton />}
      {!directoryLoading && (
        <Table>
          <TableHeader>
            <TableRow className="hover:bg-transparent">
              <TableHead>Name</TableHead>
              <TableHead>Last Modified</TableHead>
              <TableHead>File Size</TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {directoryData?.length === 0 && (
              <h1 className="text-xl mt-5"> Woah... this folder is empty!</h1>
            )}
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
                <ContextMenuContent
                  className="w-48 bg-background/5 backdrop-blur-xl border-white/10 text-white"
                  aria-hidden={false}
                  tabIndex={0}
                >
                  {item.type === ItemType.FILE ? (
                    <>
                      <ContextMenuItem
                        onClick={() =>
                          deleteFile({
                            fileName: item.name,
                            folderPath: currentPath,
                          })
                        }
                      >
                        <FileMinusIcon className="text-md" />
                        <span className="ml-2">Delete File</span>
                      </ContextMenuItem>
                      <ContextMenuItem
                        onClick={() =>
                          downloadFile({
                            fileName: item.name,
                            folderPath: currentPath,
                          })
                        }
                      >
                        <DownloadIcon className="text-md" />
                        <span className="ml-2">Download File</span>
                      </ContextMenuItem>
                    </>
                  ) : (
                    <ContextMenuItem
                      onClick={() =>
                        deleteFolder({
                          folderName: item.name,
                          folderPath: currentPath,
                        })
                      }
                    >
                      <i className="bx bx-folder-minus text-md" />
                      <span className="ml-2">Delete Folder</span>
                    </ContextMenuItem>
                  )}
                </ContextMenuContent>
              </ContextMenu>
            ))}
          </TableBody>
        </Table>
      )}
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
