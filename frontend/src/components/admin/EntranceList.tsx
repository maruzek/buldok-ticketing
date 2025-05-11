import { useState, useEffect } from "react";
import Spinner from "../Spinner";
import { Link } from "react-router";
import { Settings, Trash2 } from "lucide-react";
import { Entrance } from "../../types/Entrance";
import useApi from "../../hooks/useApi";
import { EditStatus } from "../../types/EditStatus";

type EntranceListProps = {
  entranceStatus: EditStatus | null;
};

const EntranceList = ({ entranceStatus }: EntranceListProps) => {
  const [entrances, setEntrances] = useState<Entrance[]>([]);
  // const [error, setError] = useState<string | null>(null);
  const { fetchData, error, isLoading } = useApi();

  // fetch entrances on mount
  useEffect(() => {
    const fetchEntrances = async () => {
      try {
        const data = await fetchData<Entrance[]>("/admin/entrances/all", {
          method: "GET",
        });
        setEntrances(data);
      } catch (err) {
        console.log(err);
      }
    };
    fetchEntrances();
  }, [fetchData]);

  if (isLoading)
    return (
      <div className="flex justify-center h-screen bg-white w-full pt-20">
        <Spinner />
      </div>
    );

  return (
    <div className=" w-full p-5 bg-white rounded-xl">
      {error && <div className="form-error-box">{error}</div>}
      {entranceStatus?.status == "ok" && (
        <div className="form-success-box">{entranceStatus.message}</div>
      )}
      <div className="table-none md:table-fixed">
        <table className="table-auto w-full border border-gray-200 rounded-lg overflow-hidden">
          <thead className="bg-gray-100">
            <tr>
              <th className="px-4 py-2 text-left">ID</th>
              <th className="px-4 py-2 text-left">Název</th>
              <th className="px-4 py-2 text-left">Lokace</th>
              <th className="px-4 py-2 text-left">Pokladníci</th>
              <th className="px-4 py-2 text-left">Akce</th>
            </tr>
          </thead>
          <tbody>
            {entrances.map((ent) => (
              <tr
                key={ent.id}
                className="border-t border-gray-200 hover:bg-gray-50"
              >
                <td className="px-4 py-2">{ent.id}</td>
                <td className="px-4 py-2">{ent.name}</td>
                <td className="px-4 py-2">{ent.location || "-"}</td>
                <td>
                  {ent.users &&
                    ent.users.map((user, i) => {
                      if (i > 0)
                        return <span key={user.id}>, {user.email}</span>;
                      return <span key={user.id}>{user.email}</span>;
                    })}
                </td>
                <td className="px-4 py-2 flex items-center ">
                  <Link
                    to={`/admin/entrances/${ent.id}/edit`}
                    className="bg-blue-500 hover:bg-blue-600 text-white py-1 px-3 rounded text-xs cursor-pointer"
                  >
                    <Settings className="w-5 h-5" />
                  </Link>
                  <button className="bg-red-500 hover:bg-red-600 text-white py-1 px-3 rounded text-xs cursor-pointer ml-2">
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

export default EntranceList;
