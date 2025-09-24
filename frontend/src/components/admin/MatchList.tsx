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
import { ApiError } from "@/types/ApiError";

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
    isError,
    error,
  } = useQuery<Match[], ApiError>({
    queryKey: ["matches"],
    queryFn: () => fetchData<Match[]>("/matches", { method: "GET" }),
  });

  // TODO: Custom global component for loading screens?
  if (isPending)
    return (
      <div className="flex justify-center h-screen w-full pt-20">
        <Spinner />
      </div>
    );

  if (isError) {
    toast.error(error.message);

    if (error.status === 403) {
      return (
        <div className="flex justify-center h-screen  w-full pt-20">
          <p className="text-red-500">Nemáte oprávnění zobrazit zápasy.</p>
        </div>
      );
    } else if (error.status === 500) {
      return (
        <div className="flex justify-center h-screen  w-full pt-20">
          <p className="text-red-500">
            Nastala chyba na straně serveru. Zkuste to prosím znovu později.
          </p>
        </div>
      );
    }

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
