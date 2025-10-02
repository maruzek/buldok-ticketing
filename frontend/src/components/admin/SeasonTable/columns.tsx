import { ColumnDef } from "@tanstack/react-table";
import { ChartColumnIncreasing, Dot, Settings2, Trash } from "lucide-react";
import { Season } from "@/types/Season";
import { Link } from "react-router";

export const columns = (
  onDelete: (id: number) => void
): ColumnDef<Season>[] => [
  {
    accessorKey: "id",
    header: "#",
  },
  {
    accessorKey: "years",
    header: "Sezóna",
  },
  {
    id: "startAt",
    header: "Začátek",
    cell: ({ row }) => {
      return new Date(row.original.startAt).toLocaleDateString("cs-CZ", {
        year: "numeric",
        month: "long",
        day: "numeric",
      });
    },
  },
  {
    id: "endAt",
    header: "Konec",
    cell: ({ row }) => {
      return new Date(row.original.endAt).toLocaleDateString("cs-CZ", {
        year: "numeric",
        month: "long",
        day: "numeric",
      });
    },
  },
  {
    accessorKey: "status",
    header: "Stav",
    cell: ({ row }) => (
      <span
        className={`p-1 px-2 pr-3 rounded-4xl flex items-center justify-center grow-0 w-30 ${
          row.original.status === "active"
            ? "bg-green-200 text-green-800"
            : row.original.status === "inactive"
            ? "bg-red-200 text-red-800"
            : "bg-gray-100 text-gray-800"
        }`}
      >
        <Dot className="m-0 p-0" size={30} />
        {row.original.status === "active"
          ? "Aktivní"
          : row.original.status === "inactive"
          ? "Neaktivní"
          : "Neznámý"}
      </span>
    ),
  },
  {
    id: "actions",
    header: "Akce",
    cell: ({ row }) => (
      <div className="flex gap-2">
        <Link
          to={`/admin/seasons/${row.original.id}/edit`}
          className="text-blue-800 hover:text-blue-950 px-3 py-1 rounded text-xs flex items-center transition-colors"
        >
          <Settings2 className="w-5 h-5 " />
        </Link>
        <Link
          to={`/admin/seasons/${row.original.id}/stats`}
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
