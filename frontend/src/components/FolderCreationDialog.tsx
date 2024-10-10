import { ChangeEvent, Dispatch, SetStateAction, useState } from "react";
import {
  DialogContent,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "./library/Dialog";
import { useToast } from "@/hooks/useToast";
import { ROOT_PATH } from "@/lib/constants";
import useCreateFolder from "@/hooks/useCreateFolder";

interface FolderCreationDialogProps {
  currentPath: string;
  setOpenFolderDialog: Dispatch<SetStateAction<boolean>>;
}

const FolderCreationDialog = ({
  currentPath,
  setOpenFolderDialog,
}: FolderCreationDialogProps) => {
  const [folderName, setFolderName] = useState("");
  const [validationError, setValidationError] = useState(true);
  const { toast, dismiss } = useToast();
  const { mutate: createFolder } = useCreateFolder();

  const handleFolderChange = (e: ChangeEvent<HTMLInputElement>) => {
    const folderName = e.currentTarget.value;

    if (!folderName) {
      setValidationError(true);
      return;
    }

    // cant be root
    if (folderName === ROOT_PATH) {
      toast({
        title: "Folder name error",
        description: "Folder name cannot be /",
        variant: "destructive",
      });
      setValidationError(true);
      return;
    }

    if (!folderName.match(/^[\w-]+$/)) {
      setValidationError(true);
      toast({
        title: "Folder name error",
        description:
          "Folder can only contain characters a-z, A-Z, 0-9, and underscores",
        variant: "destructive",
      });
      return;
    }

    setFolderName(folderName);
    setValidationError(false);
    dismiss();
  };

  const handleFolderCreate = () => {
    createFolder({
      folderName: folderName,
      folderPath: currentPath,
    });
    setOpenFolderDialog(false);
  };

  return (
    <DialogContent
      className="w-1/5"
      onEscapeKeyDown={() => setOpenFolderDialog(false)}
    >
      <DialogHeader>
        <DialogTitle>Create new folder</DialogTitle>
      </DialogHeader>
      <input
        type="text"
        className="w-full bg-transparent outline-none border rounded-full py-2 px-4"
        placeholder="Folder name"
        onChange={(e) => handleFolderChange(e)}
      />
      <DialogFooter>
        <button
          className="p-1 px-2 border border-transparent  hover:border-white/50 rounded-full hover:bg-white/10"
          onClick={() => setOpenFolderDialog(false)}
        >
          Cancel
        </button>
        {!validationError && (
          <button
            className="p-1 px-2 border border-transparent  hover:border-white/50 rounded-full hover:bg-white/10"
            onClick={() => handleFolderCreate()}
          >
            Create
          </button>
        )}
      </DialogFooter>
    </DialogContent>
  );
};

export default FolderCreationDialog;
