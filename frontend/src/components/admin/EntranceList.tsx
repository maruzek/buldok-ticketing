import Spinner from "../Spinner";
import { Entrance } from "../../types/Entrance";
import useApi from "../../hooks/useApi";
import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { EntrancesDataTable } from "./EntranceTable/data-table";
import { columns } from "./EntranceTable/columns";
import { ApiError } from "@/types/ApiError";
import BasicError from "../errors/BasicError";
import { Frown, Plus, ShieldBan } from "lucide-react";
import ContentBoard from "./ContentBoard";
import RemoveConfirmDialog from "../RemoveConfirmDialog";
import { toast } from "sonner";
import { useState } from "react";
import { Button } from "../ui/button";
import { Link } from "react-router";

const EntranceList = () => {
  const { fetchData } = useApi();

  const [isDialogOpen, setIsDialogOpen] = useState(false);
  const [matchToDelete, setMatchToDelete] = useState<number | null>(null);

  const {
    data: entrances,
    isPending,
    isError,
    error,
  } = useQuery<Entrance[], ApiError>({
    queryKey: ["entrances"],
    queryFn: () =>
      fetchData<Entrance[]>("/admin/entrances/", { method: "GET" }),
  });

  const queryClient = useQueryClient();

  const { mutate: deleteMatch, isPending: isDeleting } = useMutation({
    mutationFn: (id: number) =>
      fetchData(`/admin/entrances/${id}`, { method: "DELETE" }),
    onSuccess: () => {
      toast.success("Vstup byl úspěšně smazán.");
      queryClient.invalidateQueries({ queryKey: ["entrances"] });
      setIsDialogOpen(false);
      setMatchToDelete(null);
    },
    onError: (err: ApiError) => {
      toast.error(
        `Nepodařilo se smazat zápas: ${err.message || "Neznámá chyba"}`
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
    if (error.status === 403) {
      return (
        <BasicError
          title={`Přístup odepřen`}
          icon={<ShieldBan />}
          message="Nemáte oprávnění zobrazit vstupy."
        />
      );
    } else if (error.status === 500) {
      return (
        <BasicError
          title={`Chyba serveru`}
          icon={<Frown />}
          message="Nastala chyba na straně serveru. Zkuste to prosím znovu později."
        />
      );
    }

    return (
      <BasicError
        title={`Nastala chyba při načítání vstupů`}
        icon={<Frown />}
        message={error.message}
      />
    );
  }

  if (!entrances || entrances.length === 0) {
    return (
      <div className="flex justify-center h-screen bg-white w-full pt-20">
        <p className="text-gray-500">Žádné vstupy k zobrazení.</p>
      </div>
    );
  }

  return (
    <>
      {/* TODO: Add button to create new entrance */}
      <ContentBoard
        cardAction={
          <Button>
            <Link
              to="/admin/entrances/create"
              className="flex items-center gap-2"
            >
              <Plus /> Vytvořit vstup
            </Link>
          </Button>
        }
      >
        <EntrancesDataTable
          columns={columns(handleOpenDialog)}
          data={entrances}
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

export default EntranceList;
