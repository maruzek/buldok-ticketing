import { ArrowRight } from "lucide-react";
import Header from "../components/Header";
import { Link } from "react-router";
import useApi from "../hooks/useApi";
import { Match } from "../types/Match";
import Spinner from "../components/Spinner";
import useAuth from "../hooks/useAuth";
import { Card, CardContent } from "@/components/ui/card";
import { useQuery } from "@tanstack/react-query";
import { toast } from "sonner";

const UserMatchList = () => {
  const { fetchData } = useApi();
  const { auth } = useAuth();

  const {
    data: matches,
    error,
    isPending,
  } = useQuery<Match[]>({
    queryKey: ["matches"],
    queryFn: () =>
      fetchData<Match[]>("/matches?status=active", {
        method: "GET",
      }),
  });

  console.log("matches", matches);

  if (isPending) {
    return (
      <div className="h-screen w-full">
        <Header />
        <main className="flex justify-center h-full mt-10">
          <Spinner />
        </main>
      </div>
    );
  }

  if (error) {
    toast.error("Nastala chyba při načítání zápasů.");
    return (
      <div className="h-screen w-full">
        <Header />
        <main className="p-4">
          <h1 className="text-2xl font-bold">Mé aktivní zápasy</h1>
          <h3 className="text-gray-500 font-semibold">{`${auth.user?.entrance?.name}`}</h3>
          <div className="form-error-box">{error.message}</div>
        </main>
      </div>
    );
  }

  return (
    <div className="h-screen w-full">
      <Header />
      <main className="p-4">
        <h1 className="text-2xl font-bold">Mé aktivní zápasy</h1>
        <h3 className="text-gray-500 font-semibold">{`${auth.user?.entrance?.name}`}</h3>
        {error && <div className="form-error-box">{error}</div>}
        <div className="flex flex-col gap-4 mt-4">
          {matches.map((match) => (
            <Link key={match.id} to={`/app/ticketing/${match.id}`} className="">
              <Card className="flex flex-row items-center justify-between px-5">
                <CardContent className="p-0">
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
                </CardContent>
                <ArrowRight />
              </Card>
            </Link>
          ))}
        </div>
      </main>
    </div>
  );
};

export default UserMatchList;
