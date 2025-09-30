import { User } from "../../types/User";
import useApi from "../../hooks/useApi";
import Spinner from "../Spinner";
import { DataTable } from "./UserTable/data-table";
import { columns } from "./UserTable/columns";
import ContentBoard from "./ContentBoard";
import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import RemoveConfirmDialog from "../RemoveConfirmDialog";
import { useState } from "react";
import { toast } from "sonner";
import { ApiError } from "@/types/ApiError";

const UserList = () => {
  const { fetchData } = useApi();

  const [isDialogOpen, setIsDialogOpen] = useState(false);
  const [matchToDelete, setMatchToDelete] = useState<number | null>(null);

  const { data: users, isPending } = useQuery<User[]>({
    queryKey: ["users"],
    queryFn: () => fetchData<User[]>("/admin/users/all", { method: "GET" }),
  });

  const queryClient = useQueryClient();

  const { mutate: deleteUser, isPending: isDeleting } = useMutation({
    mutationFn: (id: number) =>
      fetchData(`/admin/users/user/${id}`, { method: "DELETE" }),
    onSuccess: () => {
      toast.success("Uživatel byl úspěšně smazán.");
      queryClient.invalidateQueries({ queryKey: ["users"] });
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
      deleteUser(matchToDelete);
    }
  };

  if (isPending) {
    return (
      <div className="flex justify-center items-center h-full rounded-md">
        <Spinner />
      </div>
    );
  }

  return (
    <>
      <ContentBoard>
        <DataTable columns={columns(handleOpenDialog)} data={users} />
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

export default UserList;
