import useApi from "@/hooks/useApi";
import { useQuery } from "@tanstack/react-query";
import { Purchase } from "@/types/Purchase";
import { ApiError } from "@/types/ApiError";
import { DataTable } from "../UserTable/data-table";
import { columns } from "./columns";
import Spinner from "@/components/Spinner";

type PaymentTableProps = {
  matchId: string;
};

export const PaymentTable = ({ matchId }: PaymentTableProps) => {
  const { fetchData } = useApi();

  const { data: purchases, isPending } = useQuery<Purchase[], ApiError>({
    queryKey: ["match", matchId, "purchases"],
    queryFn: () =>
      fetchData<Purchase[]>(`/purchase/match/${matchId}/purchases`, {
        method: "GET",
      }),
    enabled: !!matchId,
  });

  if (isPending) {
    return (
      <div className="flex justify-center items-center p-8">
        <Spinner />
      </div>
    );
  }

  if (!purchases) {
    return <p>Platby se nepodařilo načíst.</p>;
  }

  return <DataTable columns={columns} data={purchases} />;
};
