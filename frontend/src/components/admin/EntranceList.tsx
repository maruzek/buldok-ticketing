import React, { useState, useEffect } from "react";
import Spinner from "../Spinner";
import { Link } from "react-router";
import { Settings, Trash2, UserCog } from "lucide-react";

// Define Entrance type
type Entrance = {
  id: number;
  name: string;
  location?: string | null;
};

const EntranceList = () => {
  // component state
  const [entrances, setEntrances] = useState<Entrance[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  // fetch entrances on mount
  useEffect(() => {
    const fetchEntrances = async () => {
      try {
        const res = await fetch("http://localhost:8080/api/admin/entrance/all");
        if (!res.ok) throw new Error("Failed to fetch entrances");
        const data: Entrance[] = await res.json();
        setEntrances(data);
      } catch (err) {
        setError((err as Error).message);
      } finally {
        setLoading(false);
      }
    };
    fetchEntrances();
  }, []);

  if (loading)
    return (
      <div className="flex justify-center h-screen bg-white w-full pt-20">
        <Spinner />
      </div>
    );
  if (error) return <div className="text-red-500">{error}</div>;

  return (
    <div className=" w-full p-5 bg-white rounded-xl">
      <h2 className="text-lg font-bold mb-4">Entrances</h2>
      <div className="table-none md:table-fixed">
        <table className="table-auto w-full border border-gray-200 rounded-lg overflow-hidden">
          <thead className="bg-gray-100">
            <tr>
              <th className="px-4 py-2 text-left">ID</th>
              <th className="px-4 py-2 text-left">Name</th>
              <th className="px-4 py-2 text-left">Location</th>
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
                <td className="px-4 py-2 flex items-center ">
                  <Link
                    to={`/admin/entrances/${ent.id}`}
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
