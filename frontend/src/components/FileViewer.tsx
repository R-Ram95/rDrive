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

interface FileViewerProps {
  currentPath: string;
  addPath: (folder: string) => void;
}
const FileViewer = ({ currentPath, addPath }: FileViewerProps) => {
  const { data: directoryData } = useListDirectory(currentPath);

  const handleItemClick = (item: DirectoryItemType) => {
    if (item.type === ItemType.FOLDER) {
      addPath(item.name);
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
              <TableCell className="font-medium">{item.name}</TableCell>
              <TableCell>{item.uploadDate}</TableCell>
              <TableCell>{item.size > 0 ? `${item.size} KB` : "-"}</TableCell>
            </TableRow>
          ))}
        </TableBody>
      </Table>
    </div>
  );
};

export default FileViewer;
