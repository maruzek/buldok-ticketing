import { ColumnDef } from "@tanstack/react-table";
import { Link } from "react-router";
import { Trash, Dot, Settings2 } from "lucide-react";
import { Entrance } from "@/types/Entrance";

export const columns = (
  onDelete: (id: number) => void
): ColumnDef<Entrance>[] => [
  { accessorKey: "name", header: "Název" },
  // { accessorKey: "location", header: "Lokace" },
  {
    accessorKey: "users",
    header: "Pokladníci",
    cell: ({ getValue }) =>
      (getValue() as { email: string }[]).map((user) => user.email).join(", "),
  },
  {
    accessorKey: "status",
    header: "Status",
    cell: ({ row }) => (
      <span
        className={`p-1 px-2 pr-3 rounded-4xl flex items-center justify-center grow-0 w-30 ${
          row.original.status === "opened"
            ? "bg-green-200 text-green-800"
            : row.original.status === "closed"
            ? "bg-red-200 text-red-800"
            : "bg-gray-200 text-gray-800"
        }`}
      >
        <Dot className="m-0 p-0" size={30} />
        {row.original.status === "opened"
          ? "Otevřený"
          : row.original.status === "closed"
          ? "Uzavřený"
          : "Smazaný"}
      </span>
    ),
  },
  {
    id: "actions",
    header: "Akce",
    cell: ({ row }) => (
      <div className="flex gap-2">
        <Link
          to={`/admin/entrances/${row.original.id}/edit`}
          className="text-blue-800 hover:text-blue-950 px-3 py-1 rounded text-xs flex items-center transition-colors"
        >
          <Settings2 className="w-5 h-5 " />
        </Link>
        <button
          className="cursor-pointer text-red-600 hover:text-red-900 px-3 py-1 rounded text-xs flex items-center transition-colors"
          onClick={() => {
            onDelete(row.original.id);
          }}
        >
          <Trash className="w-5 h-5" />
        </button>
      </div>
    ),
  },
];
