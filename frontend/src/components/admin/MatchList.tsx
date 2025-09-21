import { Plus } from "lucide-react";
import { Link } from "react-router";
import Spinner from "../Spinner";
import useApi from "../../hooks/useApi";
import ContentBoard from "./ContentBoard";
import { DataTable } from "./MatchTable/data-table";
import { columns } from "./MatchTable/columns";
import { Button } from "../ui/button";
import { useQuery } from "@tanstack/react-query";
import { toast } from "sonner";

interface Match {
  id: number;
  rival: string;
  playedAt: string;
  createdAt: string;
  description: string;
  status: string;
}

const MatchList = () => {
  const { fetchData } = useApi();

  const {
    data: matches,
    isPending,
    error,
  } = useQuery<Match[]>({
    queryKey: ["matches"],
    queryFn: () => fetchData<Match[]>("/matches", { method: "GET" }),
  });

  // TODO: Custom component for loading screens?
  if (isPending)
    return (
      <div className="flex justify-center h-screen  w-full pt-20">
        <Spinner />
      </div>
    );

  if (error) {
    toast.error(error.message);

    return (
      <div className="flex justify-center h-screen  w-full pt-20">
        <p className="text-red-500">Nastala chyba při načítání zápasů.</p>
      </div>
    );
  }

  return (
    <ContentBoard
      cardAction={
        <Button>
          <Link to="/admin/matches/create" className="flex items-center gap-2">
            <Plus /> Vytvořit zápas
          </Link>
        </Button>
      }
    >
      {/* TODO: implementovat server-side pagination */}
      <DataTable columns={columns} data={matches} />
    </ContentBoard>
  );
};

export default MatchList;
