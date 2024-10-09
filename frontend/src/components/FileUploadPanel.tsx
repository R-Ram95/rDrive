import { Dispatch, SetStateAction, useEffect } from "react";
import { ScrollArea } from "@/components/ScrollArea";
import { FileWithPath } from "react-dropzone";
import { Separator } from "./Separator";
import Spinner from "./Spinner";
import { useUploadFile, useUploadFileBatch } from "@/hooks/useDirectory";
import {
  CheckCircledIcon,
  ExclamationTriangleIcon,
  CaretUpIcon,
  CaretDownIcon,
  Cross1Icon,
} from "@radix-ui/react-icons";

interface FileUploadPanelProps {
  files: FileWithPath[];
  currentPath: string;
  setShowUploadPanel: Dispatch<SetStateAction<boolean>>;
  minimizeUploadPanel: boolean;
  setMinimizeUploadPanel: Dispatch<SetStateAction<boolean>>;
}

const FileUploadPanel = ({
  files,
  currentPath,
  setShowUploadPanel,
  minimizeUploadPanel,
  setMinimizeUploadPanel,
}: FileUploadPanelProps) => {
  const { mutate: uploadFiles, uploadItems } = useUploadFileBatch();
  const { mutate: uploadFile, uploadItem } = useUploadFile();

  useEffect(() => {
    if (files.length > 1) {
      uploadFiles({
        files: files,
        uploadPath: currentPath === "/" ? "/" : currentPath.slice(0, -1), // bit hacky, fix later
        user: "me",
        overwrite: false,
      });
    }

    if (files.length === 1) {
      uploadFile({
        file: files[0],
        uploadPath: currentPath === "/" ? "/" : currentPath.slice(0, -1), // bit hacky, fix later
        user: "me",
      });
    }
  }, [currentPath, files, uploadFile, uploadFiles]);

  const togglePanel = () => setMinimizeUploadPanel(!minimizeUploadPanel);

  return (
    <div className="fixed bottom-0 right-16 w-96 bg-background/10 border-x border-t border-white/20 rounded-t-lg shadow-lg">
      <button
        className="w-full flex justify-between bg-background backdrop-blur-sm items-center rounded-t-lg rounded-b-none pt-3 px-3 pb-3"
        onClick={togglePanel}
      >
        <span>Uploads</span>
        <div className="flex flex-row gap-2 items-center">
          {!minimizeUploadPanel ? (
            <CaretDownIcon className="h-6 w-6" />
          ) : (
            <CaretUpIcon className="h-6 w-6" />
          )}

          <Cross1Icon
            className="h-4 w-4"
            onClick={() => setShowUploadPanel(false)}
          />
        </div>
      </button>
      {!minimizeUploadPanel && (
        <ScrollArea className="h-64 p-0 bg-white/10 backdrop-blur-sm">
          <Separator className=" bg-white/20" />
          <div className=" w-full">
            {[...uploadItems, uploadItem].map((item) => (
              <div
                key={item?.name}
                className="border-t p-2 last:border-b bg-background/70 backdrop-blur-xl"
              >
                <div className="flex justify-between items-center pr-2">
                  <div className="flex items-center">
                    <i className="bx bx-file text-lg" />
                    <span className="text-sm font-medium ml-2">
                      {item?.name}
                    </span>
                  </div>
                  {item?.isLoading && <Spinner className="w-5 h-5" />}
                  {item?.isSuccess && (
                    <CheckCircledIcon className="w-5 h-5 text-green-500" />
                  )}
                  {item?.isError && (
                    <ExclamationTriangleIcon className="w-5 h-5 text-red-500" />
                  )}
                </div>
              </div>
            ))}
          </div>
        </ScrollArea>
      )}
    </div>
  );
};

export default FileUploadPanel;
