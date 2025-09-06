import { XCircle } from "lucide-react";
import {
  Card,
  CardAction,
  CardDescription,
  CardHeader,
  CardTitle,
} from "../ui/card";
import { PurchaseHistory } from "@/types/PurchaseHistory";

type PurchaseCardProps = {
  purchase: PurchaseHistory;
  handleDeletePurchase: (id: number) => void;
};

const PurchaseCard = ({
  purchase,
  handleDeletePurchase,
}: PurchaseCardProps) => {
  return (
    <Card className="w-full my-3 py-3 px-3">
      <CardHeader className="px-0">
        <CardTitle className="font-bold text-2xl">
          {purchase.purchaseItems.reduce(
            (acc, cur) => acc + Number(cur.priceAtPurchase),
            0
          )}{" "}
          Kč
        </CardTitle>
        <CardDescription>
          {purchase.purchaseItems.map((item) => (
            <p key={item.id} className="text-gray-500 text-sm mt-0">
              {item.quantity}x{" "}
              {item.ticketType.name == "fullTicket" ? "plná" : "poloviční"}
            </p>
          ))}
        </CardDescription>
        <CardAction className="h-full flex items-center">
          <XCircle
            className="text-red-500 hover:text-red-800 transition ease-in-out cursor-pointer"
            onClick={() => handleDeletePurchase(purchase.id as number)}
            aria-label="Smazat nákup"
          />
        </CardAction>
      </CardHeader>
    </Card>
  );
};

export default PurchaseCard;
