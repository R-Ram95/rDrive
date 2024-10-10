import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "./Table";
import { Skeleton } from "./Skeleton";

const TableSkeleton = () => {
  return (
    <Table>
      <TableHeader>
        <TableRow>
          <TableHead>
            <Skeleton className="h-8 w-2/3" />
          </TableHead>
          <TableHead>
            <Skeleton className="h-8 w-2/3" />
          </TableHead>
          <TableHead>
            <Skeleton className="h-8 w-2/3" />
          </TableHead>
        </TableRow>
      </TableHeader>
      <TableBody>
        {[...Array(10)].map(() => (
          <TableRow>
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
