import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "./library/Table";
import { Skeleton } from "./library/Skeleton";

const TableSkeleton = () => {
  return (
    <Table>
      <TableHeader>
        <TableRow>
          <TableHead>Name</TableHead>
          <TableHead>Last Modified</TableHead>
          <TableHead>File Size</TableHead>
        </TableRow>
      </TableHeader>
      <TableBody>
        {[...Array(10).keys()].map((index) => (
          <TableRow key={`key-${index}`}>
            <TableCell>
              <Skeleton className="h-8 w-2/3" />
            </TableCell>
            <TableCell>
              <Skeleton className="h-8 w-2/3" />
            </TableCell>
            <TableCell>
              <Skeleton className="h-8 w-2/3" />
            </TableCell>
          </TableRow>
        ))}
      </TableBody>
    </Table>
  );
};

export default TableSkeleton;
