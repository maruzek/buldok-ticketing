import { Trash2, UserCog } from "lucide-react";
import { Link } from "react-router";

const UserList = () => {
  // Dummy data for users
  const users = [
    {
      id: 1,
      email: "jan.novak@email.cz",
      fullName: "Jan Novák",
      roles: ["ADMIN", "USER"],
      entrance: "Hlavní vchod",
      createdAt: "2024-04-01 10:15:00",
    },
    {
      id: 2,
      email: "eva.svobodova@email.cz",
      fullName: "Eva Svobodová",
      roles: ["USER"],
      entrance: "Vedlejší vchod",
      createdAt: "2024-03-15 09:30:00",
    },
    {
      id: 3,
      email: "petr.kral@email.cz",
      fullName: "Petr Král",
      roles: ["USER"],
      entrance: "Zadní vchod",
      createdAt: "2024-02-20 14:45:00",
    },
  ];

  return (
    <div>
      <div className="table-none md:table-fixed w-full p-5 bg-white rounded-xl">
        <table className="table-auto w-full border border-gray-200 rounded-lg overflow-hidden">
          <thead className="bg-gray-100">
            <tr>
              <th className="px-4 py-2 text-left">ID</th>
              <th className="px-4 py-2 text-left">Uživatelské jméno (email)</th>
              <th className="px-4 py-2 text-left">Celé jméno</th>
              <th className="px-4 py-2 text-left">Role</th>
              <th className="px-4 py-2 text-left">Přiřazený vchod</th>
              <th className="px-4 py-2 text-left">Vytvořeno</th>
              <th className="px-4 py-2 text-left">Akce</th>
            </tr>
          </thead>
          <tbody>
            {users.map((user) => (
              <tr
                key={user.id}
                className="border-t border-gray-200 hover:bg-gray-50"
              >
                <td className="px-4 py-2">{user.id}</td>
                <td className="px-4 py-2">{user.email}</td>
                <td className="px-4 py-2">{user.fullName}</td>
                <td className="px-4 py-2">{user.roles.join(", ")}</td>
                <td className="px-4 py-2">{user.entrance}</td>
                <td className="px-4 py-2">{user.createdAt}</td>
                <td className="px-4 py-2 flex gap-2">
                  <Link
                    to={`/admin/users/${user.id}/edit`}
                    className="bg-blue-500 hover:bg-blue-600 text-white px-3 py-1 rounded text-xs cursor-pointer"
                  >
                    <UserCog className="w-5 h-5" />
                  </Link>
                  <button className="bg-red-500 hover:bg-red-600 text-white px-3 py-1 rounded text-xs cursor-pointer">
                    <Trash2 className="w-5 h-5" />
                  </button>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  );
};

export default UserList;
