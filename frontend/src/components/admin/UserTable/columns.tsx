import { ColumnDef } from "@tanstack/react-table";
import type { User } from "@/types/User";
import { Link } from "react-router";
import { UserCog, Trash, Dot } from "lucide-react";

export const columns = (onDelete: (id: number) => void): ColumnDef<User>[] => [
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
    accessorKey: "status",
    header: "Stav",
    cell: ({ row }) => (
      <span
        className={`p-1 px-2 pr-3 rounded-4xl flex items-center justify-center grow-0 w-30 ${
          row.original.status === "active"
            ? "bg-green-200 text-green-800"
            : row.original.status === "pending"
            ? "bg-yellow-200 text-yellow-800"
            : "bg-gray-100 text-gray-800"
        }`}
      >
        <Dot className="m-0 p-0" size={30} />
        {row.original.status === "active"
          ? "Aktivní"
          : row.original.status === "pending"
          ? "Čekající"
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
          to={`/admin/users/${row.original.id}/edit`}
          className="text-blue-800 hover:text-blue-950 px-3 py-1 rounded text-xs flex items-center transition-colors"
        >
          <UserCog className="w-5 h-5 " />
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
