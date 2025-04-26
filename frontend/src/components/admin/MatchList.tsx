import { Trash2, UserCog } from "lucide-react";
import { useEffect, useState } from "react";
import { Link } from "react-router";

// const matches = [
//   {
//     id: 1,
//     rival: "SK Slavia Praha",
//     date: "2024-05-15 15:00",
//     createdAt: "2024-04-01 10:15:00",
//     status: "active",
//     description: "Zápas 1. kola",
//   },
//   {
//     id: 2,
//     rival: "FC Banik Ostrava",
//     date: "2024-06-20 18:00",
//     createdAt: "2024-03-15 09:30:00",
//     status: "inactive",
//     description: "Zápas 2. kola",
//   },
//   {
//     id: 3,
//     rival: "FC Viktoria Plzeň",
//     date: "2024-07-25 20:00",
//     createdAt: "2024-02-20 14:45:00",
//     status: "active",
//     description: "Zápas 3. kola",
//   },
// ];

interface Match {
  id: number;
  rival: string;
  playedAt: string;
  createdAt: string;
  description: string;
  status: string;
}

const MatchList = () => {
  const [matches, setMatches] = useState([]);
  useEffect(() => {
    const fetchMatches = async () => {
      try {
        const response = await fetch("http://localhost:8080/api/match/list");
        if (!response.ok) {
          throw new Error("Network response was not ok");
        }
        const data = await response.json();
        setMatches(data);
      } catch (error) {
        console.error("Error fetching matches:", error);
      }
    };
    fetchMatches();
  }, []);
  return (
    <div>
      <div className="table-none md:table-fixed w-full p-5 bg-white rounded-xl">
        <table className="table-auto w-full border border-gray-200 rounded-lg overflow-hidden">
          <thead className="bg-gray-100">
            <tr>
              <th className="px-4 py-2 text-left">ID</th>
              <th className="px-4 py-2 text-left">Protivník</th>
              <th className="px-4 py-2 text-left">Termín</th>
              <th className="px-4 py-2 text-left">Status</th>
              <th className="px-4 py-2 text-left">Vytvořeno</th>
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
                <td className="px-4 py-2">{match.createdAt}</td>
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
