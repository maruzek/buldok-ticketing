import { ColumnDef } from "@tanstack/react-table";
import { Purchase } from "@/types/Purchase";
import { Banknote, QrCode } from "lucide-react";

export const columns = (
  onQrClick: (payment: Purchase["payment"]) => void
): ColumnDef<Purchase>[] => [
  {
    accessorKey: "id",
    header: "#",
  },
  {
    accessorKey: "purchasedAt",
    header: "Čas",
    cell: ({ row }) => {
      const date = new Date(row.getValue("purchasedAt"));
      return date.toLocaleTimeString("cs-CZ", {
        hour: "2-digit",
        minute: "2-digit",
        second: "2-digit",
      });
    },
  },
  {
    id: "entranceName",
    header: "Vchod",
    accessorFn: (row) => row.entrance.name,
  },
  {
    accessorKey: "purchaseItems",
    header: "Položky",
    cell: ({ row }) => {
      const items = row.getValue("purchaseItems") as Purchase["purchaseItems"];
      return items
        .map(
          (item) =>
            `${item.quantity}x ${
              item.ticketType.name === "fullTicket" ? "plná" : "poloviční"
            }`
        )
        .join(", ");
    },
  },
  {
    id: "totalPrice",
    header: "Částka",
    cell: ({ row }) => {
      const items = row.original.purchaseItems;
      const total = items.reduce(
        (sum, item) => sum + Number(item.priceAtPurchase),
        0
      );
      return `${total.toLocaleString("cs-CZ")} Kč`;
    },
  },
  {
    accessorKey: "paymentType",
    header: "Platba",
    cell: ({ row }) => {
      const paymentType = row.getValue("paymentType");
      const payment = row.original.payment;

      if (paymentType === "qr") {
        return (
          <QrCode
            className="w-5 h-5 cursor-pointer hover:text-primary"
            onClick={() => onQrClick(payment)}
          />
        );
      }
      return <Banknote className="w-5 h-5" />;
    },
  },
];
