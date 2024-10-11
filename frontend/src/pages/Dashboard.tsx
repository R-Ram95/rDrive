import {
  Breadcrumb,
  BreadcrumbItem,
  BreadcrumbList,
  BreadcrumbSeparator,
} from "@/components/library/BreadCrumbs";
import FileViewer from "@/components/FileViewer";
import { useAuth } from "@/hooks/useAuth";
import { usePath } from "@/hooks/usePath";
import { ROOT_PATH } from "@/lib/constants";
import { FilePlusIcon } from "@radix-ui/react-icons";
import { FileWithPath, useDropzone } from "react-dropzone";
import { Dialog } from "@radix-ui/react-dialog";
import FolderCreationDialog from "@/components/FolderCreationDialog";
import FileUploadPanel from "@/components/FileUploadPanel";
import { useEffect, useState } from "react";

const Dashboard = () => {
  const { logout } = useAuth();
  const { currentPath, pathFragments, addPath, updateCurrentPath } = usePath();
  const [openFolderDialog, setOpenFolderDialog] = useState(false);
  const [showUploadPanel, setShowUploadPanel] = useState(false);
  const [minUploadPanel, setMinUploadPanel] = useState(true);
  const { acceptedFiles, getRootProps, getInputProps, open } = useDropzone({
    noClick: true,
    noKeyboard: true,
  });

  useEffect(() => {
    if (acceptedFiles.length > 0) {
      setShowUploadPanel(true);
      setMinUploadPanel(false);
    }
  }, [acceptedFiles]);

  const handleUploadClick = () => {
    open();
  };

  return (
    <div className="h-full" {...getRootProps()}>
      <header className="flex justify-between  px-10 py-4 bg-cover bg-[url('/image.jpeg')]">
        <h1 className="text-2xl font-semibold text-white">r/Drive</h1>
        <div className=" border px-3 py-1 rounded-xl font-medium backdrop-blur-xl shadow-2xl border-white/50">
          <button className="text-white" onClick={() => logout()}>
            Logout
          </button>
        </div>
      </header>
      <div className="flex flex-col px-10 pb-8 h-[calc(100vh-4rem)]">
        <div className="flex flex-row justify-between items-center mt-5">
          <Breadcrumb>
            <BreadcrumbList className="text-lg text-white">
              {pathFragments.map((fragment) => (
                <div className="flex items-center" key={fragment}>
                  <BreadcrumbItem
                    className="hover:cursor-pointer hover:bg-slate-50/10 rounded-full py-1 px-2 "
                    onClick={() => updateCurrentPath(fragment)}
                  >
                    {fragment === ROOT_PATH ? "Home" : fragment}
                  </BreadcrumbItem>
                  {pathFragments.length > 1 && <BreadcrumbSeparator />}
                </div>
              ))}
            </BreadcrumbList>
          </Breadcrumb>
          <div className="flex flex-row items-center gap-4">
            <button
              onClick={handleUploadClick}
              className="flex flex-row items-center gap-1 text-sm text-white  border-white/20 hover:border-white/80 border bg-transparent px-2 py-1 rounded-lg hover:bg-white/10"
            >
              <FilePlusIcon />
              <span>Upload File</span>
            </button>
            <button className="flex flex-row items-center gap-1 text-sm text-white  border-white/20 hover:border-white/80 border bg-transparent px-2 py-1 rounded-lg hover:bg-white/10">
              <i className="bx bx-folder-plus" />
              <span>Create Folder</span>
            </button>
          </div>
        </div>
        <FileViewer currentPath={currentPath} addPath={addPath} />

        <Dialog open={openFolderDialog}>
          <FolderCreationDialog
            currentPath={currentPath}
            setOpenFolderDialog={setOpenFolderDialog}
          />
        </Dialog>

        {showUploadPanel && (
          <FileUploadPanel
            currentPath={currentPath}
            files={acceptedFiles as FileWithPath[]}
            setShowUploadPanel={setShowUploadPanel}
            minimizeUploadPanel={minUploadPanel}
            setMinimizeUploadPanel={setMinUploadPanel}
          />
        )}

        <input {...getInputProps()} />
      </div>
    </div>
  );
};

export default Dashboard;
