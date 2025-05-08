import { ArrowRight } from "lucide-react";
import Header from "../components/app/Header";
import { Link } from "react-router";
import { useEffect, useState } from "react";
import useApi from "../hooks/useApi";
import { Match } from "../types/Match";
import Spinner from "../components/Spinner";
import useAuth from "../hooks/useAuth";

const UserMatchList = () => {
  const [matches, setMatches] = useState<Match[]>([]);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const { fetchData } = useApi();
  const { auth } = useAuth();

  useEffect(() => {
    const fetchMatches = async () => {
      try {
        setIsLoading(true);
        const response = await fetchData<Match[]>("/users-matches", {
          method: "GET",
        });
        if (!response) {
          console.error("Failed to fetch matches.");
          setError("Nastala chyba při načítání zápasů.");
          setMatches([]);
          return;
        }
        setMatches(response);
        setError(null);
      } catch (error) {
        console.error("Error fetching matches:", error);
        setError("Nastala chyba při načítání zápasů.");
        setMatches([]);
      } finally {
        setIsLoading(false);
      }
    };
    fetchMatches();
  }, [fetchData]);

  if (isLoading) {
    return (
      <div className="h-screen w-full">
        <Header />
        <main className="flex justify-center h-full mt-10">
          <Spinner />
        </main>
      </div>
    );
  }

  return (
    <div className="h-screen w-full">
      <Header />
      <main className="p-4">
        <h1 className="text-2xl font-bold">Mé aktivní zápasy</h1>
        {error && <div className="form-error-box">{error}</div>}
        <div className="flex flex-col gap-4 mt-4">
          {matches.map((match) => (
            <Link
              key={match.id}
              to={`/app/ticketing/${match.id}`}
              className="flex flex-row items-center justify-between bg-green-50 p-3 rounded-md"
            >
              <div>
                <h3 className="font-bold">{`Buldok - ${match.rival}`}</h3>
                <p className="text-gray-500 font-bold text-sm">
                  {new Date(match.playedAt).toLocaleDateString("cs-CZ", {
                    year: "numeric",
                    month: "2-digit",
                    day: "2-digit",
                    hour: "2-digit",
                    minute: "2-digit",
                  })}
                </p>
                <p className="text-gray-500 font-bold text-sm">
                  {`Vstup ${auth.user?.entrance?.name}`}
                </p>
              </div>
              <ArrowRight />
            </Link>
          ))}
        </div>
      </main>
    </div>
  );
};

export default UserMatchList;
