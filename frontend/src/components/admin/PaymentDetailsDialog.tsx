import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogDescription,
} from "@/components/ui/dialog";
import { Purchase } from "@/types/Purchase";
import { Separator } from "../ui/separator";
import { Check } from "lucide-react";

type PaymentDetailsDialogProps = {
  isOpen: boolean;
  onOpenChange: (isOpen: boolean) => void;
  payment: Purchase["payment"];
};

export const PaymentDetailsDialog = ({
  isOpen,
  onOpenChange,
  payment,
}: PaymentDetailsDialogProps) => {
  if (!payment) {
    return null;
  }

  const formatCurrency = (amount: number | null) => {
    if (amount === null || isNaN(amount)) return "?";
    return `${amount.toLocaleString("cs-CZ")} Kč`;
  };

  const formatDate = (dateString: string | null) => {
    if (!dateString) return "?";
    return new Date(dateString).toLocaleString("cs-CZ", {
      day: "2-digit",
      month: "2-digit",
      year: "numeric",
      hour: "2-digit",
      minute: "2-digit",
    });
  };

  return (
    <Dialog open={isOpen} onOpenChange={onOpenChange}>
      <DialogContent className="max-w-2xl">
        <DialogHeader>
          <DialogTitle>Detail QR Platby</DialogTitle>
          <DialogDescription>
            Informace o platbě vygenerované pro tento nákup a přijaté z banky.
          </DialogDescription>
        </DialogHeader>
        <div className="grid gap-3 py-4 text-sm">
          <div className="grid grid-cols-4 items-center gap-4">
            <span className="text-right font-semibold">Stav</span>
            <span className="col-span-3 font-medium">
              {payment && payment.status == "pending" ? (
                "Čeká na platbu"
              ) : payment && payment.status === "paid" ? (
                <span className="text-green-600 font-bold flex gap-2">
                  Platba přijata <Check />
                </span>
              ) : (
                "?"
              )}
            </span>
          </div>
          <div className="grid grid-cols-4 items-center gap-4">
            <span className="text-right font-semibold">Termín platby</span>
            <span className="col-span-3">{formatDate(payment.paid_at)}</span>
          </div>
          <div className="grid grid-cols-4 items-center gap-4">
            <span className="text-right font-semibold">Částka</span>
            <span className="col-span-3">{formatCurrency(payment.amount)}</span>
          </div>
          <div className="grid grid-cols-4 items-center gap-4">
            <span className="text-right font-semibold">Variabilní symbol</span>
            <span className="col-span-3">{payment.variableSymbol ?? "?"}</span>
          </div>

          <Separator className="my-2" />

          <h4 className="font-semibold mt-2">Detail z banky</h4>
          <div className="grid grid-cols-4 items-center gap-4">
            <span className="text-right font-semibold">Číslo účtu</span>
            <span className="col-span-3">
              {payment.bankAccountNumber && payment.bankCode
                ? `${payment.bankAccountNumber}/${payment.bankCode}`
                : "?"}
            </span>
          </div>
          <div className="grid grid-cols-4 items-center gap-4">
            <span className="text-right font-semibold">Název účtu</span>
            <span className="col-span-3">{payment.bankAccountName ?? "?"}</span>
          </div>
          <div className="grid grid-cols-4 items-center gap-4">
            <span className="text-right font-semibold">
              Identifikace uživatele banky
            </span>
            <span className="col-span-3">
              {payment.bankUserIdentification ?? "?"}
            </span>
          </div>
          <div className="grid grid-cols-4 items-center gap-4">
            <span className="text-right font-semibold">Banka</span>
            <span className="col-span-3">{payment.bankName ?? "?"}</span>
          </div>
          <div className="grid grid-cols-4 items-center gap-4">
            <span className="text-right font-semibold">Zpráva</span>
            <span className="col-span-3">{payment.paymentMessage ?? "?"}</span>
          </div>
          <div className="grid grid-cols-4 items-center gap-4">
            <span className="text-right font-semibold">ID Pohybu</span>
            <span className="col-span-3">{payment.bankMovementId ?? "?"}</span>
          </div>
          <div className="grid grid-cols-4 items-center gap-4">
            <span className="text-right font-semibold">ID Pokynu</span>
            <span className="col-span-3">
              {payment.bankInstructionId ?? "?"}
            </span>
          </div>
          <div className="grid grid-cols-4 items-center gap-4">
            <span className="text-right font-semibold">Měna</span>
            <span className="col-span-3">
              {payment.bankPaymentCurrancy ?? "?"}
            </span>
          </div>
        </div>
      </DialogContent>
    </Dialog>
  );
};
