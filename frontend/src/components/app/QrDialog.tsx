import { Button } from "@/components/ui/button";
import {
  Dialog,
  DialogClose,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog";
import { QRCodeSVG } from "qrcode.react";
import Spinner from "../Spinner";
import { useMutation, useQueryClient } from "@tanstack/react-query";
import useApi from "@/hooks/useApi";
// import { useEffect, useState } from "react";
import { useParams } from "react-router";
import { toast } from "sonner";
import { Check, CircleX, Coins, QrCode } from "lucide-react";
import { Alert, AlertDescription, AlertTitle } from "../ui/alert";
import { PaymentState } from "@/types/PaymentStateMap";

type QrDialogProps = {
  fullPrice: number;
  onQrRequest?: () => void;
  qrData: any;
  isQrLoading?: boolean;
  triggerDisabled?: boolean;
  setPurchaseFormOpened?: (open: boolean) => void;
  isTriggerIcon?: boolean;
  paymentStatus?: string;
  livePaymentState?: PaymentState;
};

export default function QrDialog({
  fullPrice,
  onQrRequest,
  qrData,
  isQrLoading = false,
  triggerDisabled = false,
  setPurchaseFormOpened,
  isTriggerIcon = false,
  paymentStatus,
  livePaymentState,
}: QrDialogProps) {
  const { fetchData } = useApi();
  const queryClient = useQueryClient();
  const { matchID } = useParams<{ matchID: string }>();
  const status = livePaymentState?.status ?? paymentStatus ?? "pending";
  const paymentMessage = livePaymentState?.message;
  const { mutate: cancelPayment } = useMutation({
    mutationFn: () =>
      fetchData("/payment/cancel", {
        method: "POST",
        body: JSON.stringify({ vs: qrData.vs }),
      }),
    onSuccess: (data) => {
      console.log(data);
      queryClient.invalidateQueries({ queryKey: ["match", matchID] });
      console.log("Payment cancelled");
      toast.error("Nákup i QR platba byly zrušeny.");
    },
    onError: (error) => {
      console.error("Error cancelling payment:", error);
    },
  });

  const onCancelClick = () => {
    if (status === "pending") {
      cancelPayment();
    }
  };

  return (
    <Dialog onOpenChange={setPurchaseFormOpened}>
      {isTriggerIcon ? (
        <DialogTrigger asChild>
          <QrCode className="w-5 h-5 cursor-pointer hover:text-black" />
        </DialogTrigger>
      ) : (
        <DialogTrigger asChild>
          <Button
            variant="secondary"
            onClick={() => {
              if (onQrRequest) {
                onQrRequest();
              }
            }}
            disabled={triggerDisabled}
            type="button"
          >
            Uložit nákup a platit QR kódem
          </Button>
        </DialogTrigger>
      )}
      <DialogContent className="sm:max-w-md">
        <DialogHeader>
          <DialogTitle>QR Platba</DialogTitle>
          <DialogDescription>
            Cena celkem: <strong>{fullPrice} Kč</strong>
          </DialogDescription>
          <DialogDescription>
            Variabilní symbol: <strong>{qrData && qrData.vs}</strong>
          </DialogDescription>
        </DialogHeader>
        <div className="flex items-center gap-2 mx-auto my-4 flex-col">
          {isQrLoading && <Spinner />}
          {!isQrLoading && qrData && status === "pending" && (
            <div className="flex flex-col items-center">
              <QRCodeSVG
                value={`SPD*1.0*ACC:CZ4120100000002803306141*AM:${fullPrice}*CC:CZK*X-VS:${qrData.vs}*MSG:Vstupenky Buldok`}
                size={200}
                bgColor={"#ffffff"}
                fgColor={"#000000"}
                level={"M"}
                marginSize={3}
                className="rounded-lg"
                // imageSettings={
                //   {
                //     src: "../../public/logo-buldok-transparent.png",
                //     height: 50,
                //     width: 50,
                //     excavate: true,
                //   } as any
                // }
              />
              {status === "pending" && (
                <Alert className="flex flex-row justify-center items-center text-center gap-3 mt-3">
                  <Coins className="animate-bounce" />
                  <AlertTitle>Čekání na platbu...</AlertTitle>
                  <AlertDescription></AlertDescription>
                </Alert>
              )}
            </div>
          )}
          {status === "paid" && (
            <Alert variant="success">
              <Check />
              <AlertTitle>Platba úspěšně přijata!</AlertTitle>
              <AlertDescription></AlertDescription>
            </Alert>
          )}
          {status === "failed" && (
            <Alert variant="destructive">
              <CircleX />
              <AlertTitle>Platba selhala!</AlertTitle>
              <AlertDescription>{paymentMessage}</AlertDescription>
            </Alert>
          )}
        </div>
        <DialogFooter className="sm:justify-center sm:flex-col">
          <DialogClose asChild>
            <Button type="button" variant="outline">
              Zavřít
            </Button>
          </DialogClose>
          <DialogClose asChild>
            <Button
              type="button"
              className="bg-red-500 hover:bg-red-600 text-white"
              onClick={() => {
                onCancelClick();
              }}
              disabled={status !== "pending"}
            >
              Zrušit platbu QR kódem a smazat nákup
            </Button>
          </DialogClose>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}
