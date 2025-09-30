import { ColumnDef } from "@tanstack/react-table";
import type { Match } from "@/types/Match";
import MatchStatus from "../MatchStatus";
import { Link } from "react-router";
import { Trash, ChartColumnIncreasing, Settings2 } from "lucide-react";

export const columns = (onDelete: (id: number) => void): ColumnDef<Match>[] => [
  {
    accessorKey: "id",
    header: "ID",
  },
  {
    accessorKey: "rival",
    header: "Soupeř",
    cell: ({ getValue, row }) => (
      <Link
        to={`/admin/matches/${row.original.id as unknown}/stats`}
        className="font-medium"
      >
        {getValue() as string}
      </Link>
    ),
  },
  {
    accessorKey: "playedAt",
    header: "Termín",
    cell: ({ getValue }) => {
      return new Date(getValue() as string).toLocaleDateString("cs-CZ", {
        year: "numeric",
        month: "2-digit",
        day: "2-digit",
        hour: "2-digit",
        minute: "2-digit",
      });
    },
  },
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
          className="text-blue-800 hover:text-blue-950 px-3 py-1 rounded text-xs flex items-center transition-colors"
        >
          <Settings2 className="w-5 h-5 " />
        </Link>
        <Link
          to={`/admin/matches/${row.original.id}/stats`}
          className="text-fuchsia-600 hover:text-fuchsia-800 px-3 py-1 rounded text-xs flex items-center transition-colors"
        >
          <ChartColumnIncreasing className="w-5 h-5 " />
        </Link>
        <button
          className="cursor-pointer text-red-600 hover:text-red-900 px-3 py-1 rounded text-xs flex items-center transition-colors"
          onClick={() => {
            onDelete(row.original.id);
          }}
        >
          <Trash className="w-5 h-5 " />
        </button>
      </div>
    ),
  },
];
