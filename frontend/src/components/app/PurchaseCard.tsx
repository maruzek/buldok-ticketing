import { Banknote, XCircle } from "lucide-react";
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

type PurchaseCardProps = {
  purchase: PurchaseHistory;
};

const PurchaseCard = ({ purchase }: PurchaseCardProps) => {
  const { fetchData } = useApi();
  const { matchID } = useParams<{ matchID: string }>();
  const queryClient = useQueryClient();

  const { mutate: deletePurchase } = useMutation({
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

  return (
    <>
      <Card className="w-full my-3 py-3 px-3">
        <CardHeader className="px-0">
          <CardDescription className="text-gray-500 text-sm">
            #{purchase.id}
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
            <CardAction className="h-full flex items-center">
              <XCircle
                className="text-red-500 hover:text-red-800 transition ease-in-out cursor-pointer"
                onClick={() => deletePurchase(purchase.id as number)}
                aria-label="Smazat nákup"
              />
            </CardAction>
          )}
        </CardHeader>
      </Card>
    </>
  );
};

export default PurchaseCard;
