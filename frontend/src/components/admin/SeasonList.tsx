import { Plus } from "lucide-react";
import { Link } from "react-router";
import Spinner from "../Spinner";
import useApi from "../../hooks/useApi";
import ContentBoard from "./ContentBoard";
import { DataTable } from "./data-table";
import { columns } from "./SeasonTable/columns";
import { Button } from "../ui/button";
import { useQueryClient, useMutation, useQuery } from "@tanstack/react-query";
import { toast } from "sonner";
import { ApiError } from "@/types/ApiError";
import { useState } from "react";
import RemoveConfirmDialog from "../RemoveConfirmDialog";
import { Season } from "@/types/Season";

const SeasonList = () => {
  const { fetchData } = useApi();

  const [isDialogOpen, setIsDialogOpen] = useState(false);
  const [matchToDelete, setMatchToDelete] = useState<number | null>(null);

  const queryClient = useQueryClient();

  const {
    data: seasons,
    isPending,
    isError,
    error,
  } = useQuery<Season[], ApiError>({
    queryKey: ["seasons"],
    queryFn: () => fetchData<Season[]>("/season", { method: "GET" }),
  });
  console.log(seasons);

  const { mutate: deleteMatch, isPending: isDeleting } = useMutation({
    mutationFn: (id: number) =>
      fetchData(`/admin/match/${id}`, { method: "DELETE" }),
    onSuccess: () => {
      toast.success("Sezóna byla úspěšně smazána.");
      queryClient.invalidateQueries({ queryKey: ["seasons"] });
      setIsDialogOpen(false);
      setMatchToDelete(null);
    },
    onError: (err: ApiError) => {
      toast.error(
        `Nepodařilo se smazat sezónu: ${err.message || "Neznámá chyba"}`
      );
    },
  });

  const handleOpenDialog = (id: number) => {
    setMatchToDelete(id);
    setIsDialogOpen(true);
  };

  const handleConfirmDelete = () => {
    if (matchToDelete) {
      deleteMatch(matchToDelete);
    }
  };

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
          <p className="text-red-500">Nemáte oprávnění zobrazit sezóny.</p>
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
        <p className="text-red-500">Nastala chyba při načítání sezón.</p>
      </div>
    );
  }

  return (
    <>
      <ContentBoard
        cardAction={
          <Button>
            <Link
              to="/admin/seasons/create"
              className="flex items-center gap-2"
            >
              <Plus /> Vytvořit sezónu
            </Link>
          </Button>
        }
      >
        <DataTable
          columns={columns(handleOpenDialog)}
          data={seasons}
          entity="season"
        />
      </ContentBoard>
      <RemoveConfirmDialog
        isOpen={isDialogOpen}
        onOpenChange={setIsDialogOpen}
        onConfirm={handleConfirmDelete}
        isPending={isDeleting}
        title="Opravdu smazat tento zápas?"
        message="Všechna data spojená s tímto zápasem, včetně prodaných lístků, budou smazána."
      />
    </>
  );
};

export default SeasonList;
