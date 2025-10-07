import { Banknote, Dot, XCircle } from "lucide-react";
import {
  Card,
  CardAction,
  CardDescription,
  CardHeader,
  CardTitle,
} from "../ui/card";
import { PurchaseHistory } from "@/types/PurchaseHistory";
import { toast } from "sonner";
import { useMutation, useQueryClient } from "@tanstack/react-query";
import useApi from "@/hooks/useApi";
import { useParams } from "react-router";
import QrDialog from "./QrDialog";
import { PaymentState } from "@/types/PaymentStateMap";
import { useState } from "react";
import RemoveConfirmDialog from "../RemoveConfirmDialog";

type PurchaseCardProps = {
  purchase: PurchaseHistory;
  livePaymentState?: PaymentState;
};

const PurchaseCard = ({ purchase, livePaymentState }: PurchaseCardProps) => {
  const { fetchData } = useApi();
  const { matchID } = useParams<{ matchID: string }>();
  const queryClient = useQueryClient();

  const [isDeleteDialogOpen, setIsDeleteDialogOpen] = useState(false);
  const [purchaseToDelete, setPurchaseToDelete] = useState<number | null>(null);

  const { mutate: deletePurchase, isPending: isDeleting } = useMutation({
    mutationFn: (purchaseID: number) =>
      fetchData(`/purchase/${purchaseID}`, {
        method: "DELETE",
      }),
    onSuccess: () => {
      queryClient.invalidateQueries({
        queryKey: ["match", matchID],
      });
      toast.success("Nákup byl úspěšně smazán.");
    },
    onError: (error) => {
      console.error("Error deleting purchase:", error);
      toast.error("Chyba při mazání nákupu. Zkontrolujte konzoli.");
    },
  });

  const amount = purchase.purchaseItems.reduce(
    (acc, cur) => acc + Number(cur.priceAtPurchase),
    0
  );

  const qrData = {
    vs: purchase?.payment?.variableSymbol,
  };

  const handleOpenDeleteDialog = (id: number) => {
    setPurchaseToDelete(id);
    setIsDeleteDialogOpen(true);
  };

  const handleConfirmDelete = () => {
    if (purchaseToDelete) {
      deletePurchase(purchaseToDelete);
    }
  };

  return (
    <>
      <Card className="w-full my-3 py-3 px-3 gap-0">
        <CardHeader className="p-0 ">
          <CardDescription className="text-gray-500 text-sm flex items-center">
            #{purchase.id}
            {purchase.payment &&
              purchase.paymentType === "qr" &&
              purchase.payment.variableSymbol && (
                <span className="flex items-center">
                  {" "}
                  <Dot />
                  VS: {purchase.payment.variableSymbol}
                </span>
              )}{" "}
          </CardDescription>
          <CardTitle className="font-bold text-2xl flex items-center gap-3 ">
            {`${amount} Kč`}
            <span className="text-gray-500 text-sm ">
              {purchase.paymentType === "qr" ? (
                <QrDialog
                  fullPrice={amount}
                  qrData={qrData}
                  isTriggerIcon={true}
                  paymentStatus={purchase.payment?.status}
                  livePaymentState={livePaymentState}
                />
              ) : (
                <Banknote className="w-5 h-5" />
              )}
            </span>
          </CardTitle>
          <CardDescription>
            {purchase.purchaseItems.map((item) => (
              <p key={item.id} className="text-gray-500 text-sm mt-0">
                {item.quantity}x{" "}
                {item.ticketType.name == "fullTicket" ? "plná" : "poloviční"}
              </p>
            ))}
          </CardDescription>
          {purchase.paymentType !== "qr" && (
            // <CardAction className="h-full flex items-start">
            //   <XCircle
            //     className="text-red-500 hover:text-red-800 transition ease-in-out cursor-pointer"
            //     onClick={() => deletePurchase(purchase.id as number)}
            //     aria-label="Smazat nákup"
            //   />
            // </CardAction>

            <CardAction className="h-full flex items-start">
              <XCircle
                className="text-red-500 hover:text-red-800 transition ease-in-out cursor-pointer"
                onClick={() => handleOpenDeleteDialog(purchase.id as number)}
                aria-label="Smazat nákup"
              />
              <RemoveConfirmDialog
                isOpen={isDeleteDialogOpen}
                onOpenChange={setIsDeleteDialogOpen}
                onConfirm={handleConfirmDelete}
                isPending={isDeleting}
                title="Opravdu smazat tento nákup?"
                message="Všechna data spojená s tímto nákupem, včetně prodaných lístků, budou smazána."
              />
            </CardAction>
          )}
        </CardHeader>
      </Card>
    </>
  );
};

export default PurchaseCard;
