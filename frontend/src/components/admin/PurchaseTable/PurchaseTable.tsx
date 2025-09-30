import useApi from "@/hooks/useApi";
import { useQuery } from "@tanstack/react-query";
import { Purchase } from "@/types/Purchase";
import { ApiError } from "@/types/ApiError";
import { DataTable } from "./data-table";
import { columns } from "./columns";
import Spinner from "@/components/Spinner";
import { useState } from "react";
import { PaymentDetailsDialog } from "../PaymentDetailsDialog";

type PurchaseTableProps = {
  matchID: string;
};

export const PurchaseTable = ({ matchID }: PurchaseTableProps) => {
  const { fetchData } = useApi();
  const [selectedPayment, setSelectedPayment] =
    useState<Purchase["payment"]>(null);

  const { data: purchases, isPending } = useQuery<Purchase[], ApiError>({
    queryKey: ["match", matchID, "purchases"],
    queryFn: () =>
      fetchData<Purchase[]>(`/purchase/match/${matchID}/purchases`, {
        method: "GET",
      }),
    enabled: !!matchID,
  });

  if (isPending) {
    return (
      <div className="flex justify-center items-center p-8">
        <Spinner />
      </div>
    );
  }

  if (!purchases) {
    return <p>Nákupy se nepodařilo načíst.</p>;
  }

  return (
    <>
      <DataTable columns={columns(setSelectedPayment)} data={purchases} />
      <PaymentDetailsDialog
        isOpen={!!selectedPayment}
        onOpenChange={(isOpen) => !isOpen && setSelectedPayment(null)}
        payment={selectedPayment}
      />
    </>
  );
};
