import { ColumnDef } from "@tanstack/react-table";
import type { Match } from "@/types/Match";
import MatchStatus from "../MatchStatus";
import { Link } from "react-router";

export const columns: ColumnDef<Match>[] = [
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
        className=""
      >
        <span className="max-w-sm truncate block font-bold underline hover:text-blue-800">
          {getValue() as string}
        </span>
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
];
