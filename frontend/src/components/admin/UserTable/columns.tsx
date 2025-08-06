import { ColumnDef } from "@tanstack/react-table";
import type { User } from "@/types/User";
import MatchStatus from "../MatchStatus";
import { Link } from "react-router";
import { UserCog, Trash } from "lucide-react";
import { Checkbox } from "@/components/ui/checkbox";

// export type Match = {
//   id: string;
//   opponent: string;
//   date: string;
//   status: "upcoming" | "finished";
// };

export const columns: ColumnDef<User>[] = [
  {
    id: "select",
    header: ({ table }) => (
      <Checkbox
        checked={
          table.getIsAllPageRowsSelected() ||
          (table.getIsSomePageRowsSelected() && "indeterminate")
        }
        onCheckedChange={(value) => table.toggleAllPageRowsSelected(!!value)}
        aria-label="Select all"
      />
    ),
    cell: ({ row }) => (
      <Checkbox
        checked={row.getIsSelected()}
        onCheckedChange={(value) => row.toggleSelected(!!value)}
        aria-label="Select row"
      />
    ),
    enableSorting: false,
    enableHiding: false,
  },
  { accessorKey: "fullName", header: "Jméno" },
  { accessorKey: "email", header: "Email" },
  {
    accessorKey: "roles",
    header: "Role",
  },
  {
    accessorKey: "entrance.name",
    header: "Vstup",
  },
  {
    id: "actions",
    header: "Akce",
    cell: ({ row }) => (
      <div className="flex gap-2">
        <Link
          to={`/admin/users/${row.original.id}/edit`}
          className="bg-blue-500 hover:bg-blue-600 text-white px-3 py-1 rounded text-xs flex items-center transition-colors"
        >
          <UserCog className="w-6 h-6 " />
        </Link>
        <button
          className="cursor-pointer bg-red-500 hover:bg-red-600 text-white px-3 py-1 rounded text-xs flex items-center transition-colors"
          onClick={() => {
            // Call your delete handler here, e.g.:
            // handleDelete(row.original.id)
          }}
        >
          <Trash className="w-6 h-6" />
        </button>
      </div>
    ),
  },
];
