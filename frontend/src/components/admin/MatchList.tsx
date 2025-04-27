import { Trash2, UserCog } from "lucide-react";
import { useEffect, useState } from "react";
import { Link } from "react-router";
import { MatchEditStatus } from "../../types/MatchEditStatus";
import Spinner from "../Spinner";

interface Match {
  id: number;
  rival: string;
  playedAt: string;
  createdAt: string;
  description: string;
  status: string;
}

type MatchListProps = {
  matchCreateStatus: MatchEditStatus | null;
};

const MatchList = ({ matchCreateStatus }: MatchListProps) => {
  const [matches, setMatches] = useState([]);
  const [isLoading, setIsLoading] = useState(false);

  useEffect(() => {
    const fetchMatches = async () => {
      setIsLoading(true);
      try {
        const response = await fetch("http://localhost:8080/api/match/list");
        if (!response.ok) {
          throw new Error("Network response was not ok");
        }
        const data = await response.json();
        setMatches(data);
      } catch (error) {
        console.error("Error fetching matches:", error);
      } finally {
        setIsLoading(false);
      }
    };
    fetchMatches();
  }, []);

  if (isLoading)
    return (
      <div className="flex justify-center h-screen bg-white w-full pt-20">
        <Spinner />
      </div>
    );

  return (
    <div className=" w-full p-5 bg-white rounded-md">
      {matchCreateStatus?.status === "ok" && (
        <div className="form-success-box">{matchCreateStatus.message}</div>
      )}

      <div className="table-none md:table-fixed">
        <table className="table-auto w-full border border-gray-200 rounded-lg overflow-hidden">
          <thead className="bg-gray-100">
            <tr>
              <th className="px-4 py-2 text-left">ID</th>
              <th className="px-4 py-2 text-left">Protivník</th>
              <th className="px-4 py-2 text-left">Termín</th>
              <th className="px-4 py-2 text-left">Status</th>
              <th className="px-4 py-2 text-left">Poznámka</th>
              <th className="px-4 py-2 text-left">Akce</th>
            </tr>
          </thead>
          <tbody>
            {matches.map((match: Match) => (
              <tr
                key={match.id}
                className="border-t border-gray-200 hover:bg-gray-50"
              >
                {/* TODO: conditioal rendering of status */}
                <td className="px-4 py-2">{match.id}</td>
                <td className="px-4 py-2">{match.rival}</td>
                <td className="px-4 py-2">{match.playedAt}</td>
                <td className="px-4 py-2">{match.status}</td>
                <td className="px-4 py-2">{match.description}</td>
                <td className="px-4 py-2 flex gap-2">
                  <Link
                    to={`/admin/matches/${match.id}/edit`}
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

export default MatchList;
