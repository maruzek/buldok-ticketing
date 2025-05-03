import { Trash2, UserCog } from "lucide-react";
import { useEffect, useState } from "react";
import { Link } from "react-router";

import { User } from "../../types/User";
import { EditStatus } from "../../types/EditStatus";

type UserListProps = {
  userEdit: EditStatus | null;
};

const UserList = ({ userEdit }: UserListProps) => {
  // Dummy data for users
  const [users, setUsers] = useState<User[]>([]);

  useEffect(() => {
    // Fetch users from the server
    const fetchUsers = async () => {
      try {
        const response = await fetch(
          "http://localhost:8080/api/admin/users/all"
        );
        if (!response.ok) {
          throw new Error("Failed to fetch users");
        }
        const data = await response.json();
        setUsers(data);
      } catch (error) {
        console.error("Error fetching users:", error);
      }
    };

    fetchUsers();
  }, []);

  return (
    <div>
      {userEdit?.status == "ok" && (
        <div className="form-success-box">{userEdit.message}</div>
      )}
      {userEdit?.status == "error" && (
        <div className="form-error-box">{userEdit.message}</div>
      )}
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
                <td className="px-4 py-2">{user.registeredAt}</td>
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
