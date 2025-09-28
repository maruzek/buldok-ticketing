import { ColumnDef } from "@tanstack/react-table";
import { Link } from "react-router";
import { UserCog, Trash } from "lucide-react";
import { Entrance } from "@/types/Entrance";

export const columns: ColumnDef<Entrance>[] = [
  { accessorKey: "name", header: "Název" },
  { accessorKey: "location", header: "Lokace" },
  {
    accessorKey: "users",
    header: "Pokladníci",
    cell: ({ getValue }) =>
      (getValue() as { email: string }[]).map((user) => user.email).join(", "),
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
          <UserCog className="w-5 h-5 " />
        </Link>
        <button
          className="cursor-pointer text-red-600 hover:text-red-900 px-3 py-1 rounded text-xs flex items-center transition-colors"
          onClick={() => {
            // handleDelete(row.original.id)
          }}
        >
          <Trash className="w-5 h-5" />
        </button>
      </div>
    ),
  },
];
