import { ColumnDef } from "@tanstack/react-table";
import type { Match } from "@/types/Match";
import MatchStatus from "../MatchStatus";
import { Link } from "react-router";
import { UserCog, Trash2, Trash } from "lucide-react";
import { Checkbox } from "@/components/ui/checkbox";

// export type Match = {
//   id: string;
//   opponent: string;
//   date: string;
//   status: "upcoming" | "finished";
// };

export const columns: ColumnDef<Match>[] = [
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
  { accessorKey: "rival", header: "Soupeř" },
  { accessorKey: "playedAt", header: "Termín" },
  {
    accessorKey: "status",
    header: "Stav",
    cell: ({ getValue }) => <MatchStatus status={getValue() as string} />,
  },
  {
    id: "actions",
    header: "Akce",
    cell: ({ row }) => (
      <div className="flex gap-2">
        <Link
          to={`/admin/matches/${row.original.id}/edit`}
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
          <Trash className="w-6 h-6 " />
        </button>
      </div>
    ),
  },
];
