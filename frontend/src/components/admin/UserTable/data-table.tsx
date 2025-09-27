import {
  ColumnDef,
  flexRender,
  getCoreRowModel,
  useReactTable,
  getPaginationRowModel,
  ColumnFiltersState,
  getFilteredRowModel,
  getFacetedRowModel,
  getFacetedUniqueValues,
} from "@tanstack/react-table";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import { Button } from "@/components/ui/button";
import { useState } from "react";
import { Input } from "@/components/ui/input";
import {
  Select,
  SelectTrigger,
  SelectValue,
  SelectContent,
  SelectItem,
} from "@/components/ui/select";
// import { Trash } from "lucide-react";

interface DataTableProps<TData, TValue> {
  columns: ColumnDef<TData, TValue>[];
  data: TData[];
}

export function DataTable<TData, TValue>({
  columns,
  data,
}: DataTableProps<TData, TValue>) {
  const [rowSelection, setRowSelection] = useState({});
  const [columnFilters, setColumnFilters] = useState<ColumnFiltersState>([]);
  const table = useReactTable({
    data,
    columns,
    getCoreRowModel: getCoreRowModel(),
    getPaginationRowModel: getPaginationRowModel(),
    onRowSelectionChange: setRowSelection,
    onColumnFiltersChange: setColumnFilters,
    getFilteredRowModel: getFilteredRowModel(), // Add this
    getFacetedRowModel: getFacetedRowModel(), // Add this
    getFacetedUniqueValues: getFacetedUniqueValues(),
    state: {
      rowSelection,
      columnFilters,
    },
  });

  return (
    <div>
      {/* <div className="flex items-center justify-between mb-4">
        <Button
          className="bg-red-500 cursor-pointer hover:bg-red-600 flex items-center"
          disabled={!table.getIsSomeRowsSelected()}
        >
          <Trash />
          Smazat vybrané
        </Button>
      </div> */}
      <div className="flex items-center py-4 gap-2">
        <Select
          value={
            (table.getColumn("entranceName")?.getFilterValue() as string) ?? ""
          }
          onValueChange={(value) =>
            table.getColumn("entranceName")?.setFilterValue(value)
          }
        >
          <SelectTrigger>
            <SelectValue placeholder="Vstup..." />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value={undefined}>Všechny vchody</SelectItem>
            {Array.from(
              table
                .getColumn("entranceName")
                ?.getFacetedUniqueValues()
                ?.keys() ?? []
            )
              .sort()
              .map((value) => (
                <SelectItem key={value} value={value}>
                  {value}
                </SelectItem>
              ))}
          </SelectContent>
        </Select>
        <Select
          value={
            (table.getColumn("paymentType")?.getFilterValue() as string) ?? ""
          }
          onValueChange={(value) =>
            table.getColumn("paymentType")?.setFilterValue(value)
          }
        >
          <SelectTrigger>
            <SelectValue placeholder="Platba..." />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value={undefined}>Všechny platby</SelectItem>
            <SelectItem value="cash">Hotovost</SelectItem>
            <SelectItem value="qr">QR</SelectItem>
          </SelectContent>
        </Select>
        {/* <Input
          placeholder="Filter emails..."
          value={(table.getColumn("email")?.getFilterValue() as string) ?? ""}
          onChange={(event) =>
            table.getColumn("email")?.setFilterValue(event.target.value)
          }
          className="max-w-sm"
        /> */}
      </div>
      <div className="rounded-md border">
        <Table>
          <TableHeader>
            {table.getHeaderGroups().map((headerGroup) => (
              <TableRow key={headerGroup.id}>
                {headerGroup.headers.map((header) => (
                  <TableHead key={header.id}>
                    {header.isPlaceholder
                      ? null
                      : flexRender(
                          header.column.columnDef.header,
                          header.getContext()
                        )}
                  </TableHead>
                ))}
              </TableRow>
            ))}
          </TableHeader>
          <TableBody>
            {table.getRowModel().rows.length ? (
              table.getRowModel().rows.map((row) => (
                <TableRow key={row.id}>
                  {row.getVisibleCells().map((cell) => (
                    <TableCell key={cell.id}>
                      {flexRender(
                        cell.column.columnDef.cell,
                        cell.getContext()
                      )}
                    </TableCell>
                  ))}
                </TableRow>
              ))
            ) : (
              <TableRow>
                <TableCell
                  colSpan={columns.length}
                  className="h-24 text-center"
                >
                  Žádná data.
                </TableCell>
              </TableRow>
            )}
          </TableBody>
        </Table>
      </div>
      <div className="flex items-center justify-end space-x-2 py-4">
        {/* <Button
          onClick={() =>
            console.log(
              table.getSelectedRowModel().rows.map((row) => row.original)
            )
          }
        >
          selected
        </Button> */}
        <Button
          variant="outline"
          size="sm"
          onClick={() => table.previousPage()}
          disabled={!table.getCanPreviousPage()}
        >
          Předchozí
        </Button>
        <Button
          variant="outline"
          size="sm"
          onClick={() => table.nextPage()}
          disabled={!table.getCanNextPage()}
        >
          Další
        </Button>
      </div>
    </div>
  );
}
