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
import { useEffect, useState } from "react";
import { useParams } from "react-router";
import { toast } from "sonner";
import { Check, CircleX, Coins, QrCode } from "lucide-react";
import { Alert, AlertDescription, AlertTitle } from "../ui/alert";

type QrDialogProps = {
  fullPrice: number;
  onQrRequest?: () => void;
  qrData: any;
  isQrLoading?: boolean;
  triggerDisabled?: boolean;
  setPurchaseFormOpened?: (open: boolean) => void;
  isTriggerIcon?: boolean;
  paymentStatus?: string;
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
}: QrDialogProps) {
  const { fetchData } = useApi();
  const queryClient = useQueryClient();
  const { matchID } = useParams<{ matchID: string }>();
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

  console.log("paymentStatus qr:", paymentStatus, qrData);

  const [status, setStatus] = useState<
    "pending" | "paid" | "failed" | "canceled"
  >(
    paymentStatus === "paid"
      ? "paid"
      : paymentStatus === "failed"
      ? "failed"
      : "pending"
  );
  console.log("status state", status);
  const [paymentMessage, setPaymentMessage] = useState<string | null>(null);
  function beep() {
    const snd = new Audio("/pay-success.mp3");
    snd.play();
  }
  console.log(status, paymentStatus);

  useEffect(() => {
    if (status !== "pending" || !qrData || !qrData.vs) {
      return;
    }

    let eventSource: EventSource | null = null;

    const connectToMercure = async () => {
      try {
        const isAuthEnabled =
          import.meta.env.VITE_MERCURE_AUTH_ENABLED === "true";
        if (isAuthEnabled) {
          await fetchData("/mercure/token", {
            method: "POST",
            body: JSON.stringify({ paymentId: qrData.vs }),
          });
        }

        const hubUrl = new URL(import.meta.env.VITE_MERCURE_PUBLIC_URL);

        const topic = `https://buldok.app/payments/${qrData.vs}`;
        hubUrl.searchParams.append("topic", topic);

        eventSource = new EventSource(hubUrl.toString(), {
          withCredentials: isAuthEnabled,
        });

        eventSource.onmessage = (event) => {
          const data = JSON.parse(event.data);
          console.log(data);

          if (data.status === "completed") {
            setStatus("paid");
            queryClient.invalidateQueries({ queryKey: ["match", matchID] });
            beep();
            toast.success("Platba byla přijata!");
          } else if (data.status === "failed") {
            setStatus("failed");
            queryClient.invalidateQueries({ queryKey: ["match", matchID] });
            if (data.reason === "amount_mismatch") {
              setPaymentMessage("Nesouhlasí částka platby.");
              toast.error("Platba selhala. Nesouhlasí částka platby.");
            } else {
              setPaymentMessage("Zkuste to prosím znovu.");
              toast.error("Platba selhala. Zkuste to prosím znovu.");
            }
          }
          // TODO: ma tu toto byt?
          eventSource?.close();
        };

        eventSource.onerror = (err) => {
          console.error("Mercure EventSource failed:", err);
          eventSource?.close();
        };
      } catch (error) {
        console.error("Failed to authorize or connect to Mercure:", error);
        toast.error("Chyba spojení s notifikačním serverem.");
      }
    };

    connectToMercure();

    return () => {
      if (eventSource) {
        console.log("Closing Mercure connection for payment:", qrData.vs);
        eventSource.close();
      }
    };
  }, [qrData, status, queryClient, matchID, fetchData]);

  const onCancelClick = () => {
    if (status === "pending") {
      cancelPayment();
      setStatus("canceled");
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
