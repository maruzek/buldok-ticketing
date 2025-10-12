import { useMediaQuery } from "@/hooks/use-media-query";
import { Button } from "@/components/ui/button";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog";
import {
  Drawer,
  DrawerClose,
  DrawerContent,
  DrawerFooter,
  DrawerHeader,
  DrawerTitle,
  DrawerTrigger,
} from "@/components/ui/drawer";
import QrDialog from "./QrDialog";
import { FieldValues, useForm } from "react-hook-form";
import { PurchaseHistory } from "@/types/PurchaseHistory";
import { TicketPrices } from "@/types/TicketPrices";
import useApi from "@/hooks/useApi";
import { Card, CardDescription, CardHeader, CardTitle } from "../ui/card";
import { Label } from "../ui/label";
import { useState } from "react";
import { toast } from "sonner";
import { useMutation, useQueryClient } from "@tanstack/react-query";
import { PaymentStateMap } from "@/types/PaymentStateMap";

import TicketCounter from "./TicketCounter";

import {
  Table,
  TableBody,
  TableCaption,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";

type PurchaseDrawerProps = {
  matchID: string | undefined;
  ticketPrices: TicketPrices | null;
  onNewQrPayment: (vs: string) => void;
  paymentStates: PaymentStateMap;
};

type PaymentResponse = {
  id: number;
  vs: string;
};

export default function PurchaseDrawer({
  matchID,
  ticketPrices,
  onNewQrPayment,
  paymentStates,
}: PurchaseDrawerProps) {
  const [open, setOpen] = useState(false);
  const isDesktop = useMediaQuery("(min-width: 768px)");

  if (isDesktop) {
    return (
      <Dialog open={open} onOpenChange={setOpen}>
        <DialogTrigger asChild>
          <div className="mx-4">
            <Button className="w-full">Zaznamenat nákup</Button>
          </div>
        </DialogTrigger>
        <DialogContent className="sm:max-w-[425px]">
          <DialogHeader>
            <DialogTitle>Zaznamenat nákup</DialogTitle>
          </DialogHeader>
          {ticketPrices && (
            <>
              <div className="grid grid-cols-2 gap-4 px-5 mb-4">
                <Card className="max-h-[100px]">
                  <CardHeader>
                    <CardDescription>Plná cena</CardDescription>
                    <CardTitle className="text-2xl font-bold tabular-nums @[250px]/card:text-3xl">
                      {ticketPrices?.fullTicket} Kč
                    </CardTitle>
                  </CardHeader>
                  <p></p>
                  <span className="font-bold"></span>
                </Card>
                <Card className="max-h-[100px]">
                  <CardHeader>
                    <CardDescription>Poloviční cena</CardDescription>
                    <CardTitle className="text-2xl font-bold tabular-nums @[250px]/card:text-3xl">
                      {ticketPrices?.halfTicket} Kč
                    </CardTitle>
                  </CardHeader>
                  <p></p>
                  <span className="font-bold"></span>
                </Card>
              </div>
              <PaymentForm
                ticketPrices={ticketPrices}
                matchID={matchID}
                setPurchaseFormOpened={setOpen}
                onNewQrPayment={onNewQrPayment}
                paymentStates={paymentStates}
              />
            </>
          )}
        </DialogContent>
      </Dialog>
    );
  }

  return (
    <Drawer open={open} onOpenChange={setOpen}>
      <DrawerTrigger asChild>
        <div className="mx-4">
          <Button className="w-full">Zaznamenat nákup</Button>
        </div>
      </DrawerTrigger>
      <DrawerContent>
        <DrawerHeader className="text-left">
          <DrawerTitle>Zaznamenat nákup</DrawerTitle>
        </DrawerHeader>
        {ticketPrices && (
          <>
            <TicketPricesDisplay ticketPrices={ticketPrices} />
            <PaymentForm
              ticketPrices={ticketPrices}
              matchID={matchID}
              setPurchaseFormOpened={setOpen}
              onNewQrPayment={onNewQrPayment}
              paymentStates={paymentStates}
            />
          </>
        )}
      </DrawerContent>
    </Drawer>
  );
}

function TicketPricesDisplay({
  ticketPrices,
}: {
  ticketPrices: TicketPrices | null;
}) {
  return (
    <div className="mb-4 px-5">
      <h4 className="text-sm text-muted-foreground">Ceny vstupenek</h4>
      <Table className="text-center">
        <TableHeader>
          <TableRow>
            <TableHead className="text-center">Plná cena</TableHead>
            <TableHead className="text-center">Poloviční cena</TableHead>
          </TableRow>
        </TableHeader>
        <TableBody>
          <TableRow>
            <TableCell>{ticketPrices?.fullTicket} Kč</TableCell>
            <TableCell>{ticketPrices?.halfTicket} Kč</TableCell>
          </TableRow>
        </TableBody>
      </Table>
    </div>
    // <div className="grid grid-cols-2 gap-4 px-5 mb-4">
    //   <Card className="max-h-[100px]">
    //     <CardHeader>
    //       <CardDescription>Plná cena</CardDescription>
    //       <CardTitle className="text-2xl font-bold tabular-nums @[250px]/card:text-3xl">
    //         {ticketPrices?.fullTicket} Kč
    //       </CardTitle>
    //     </CardHeader>
    //   </Card>
    //   <Card className="max-h-[100px]">
    //     <CardHeader>
    //       <CardDescription>Poloviční cena</CardDescription>
    //       <CardTitle className="text-2xl font-bold tabular-nums @[250px]/card:text-3xl">
    //         {ticketPrices?.halfTicket} Kč
    //       </CardTitle>
    //     </CardHeader>
    //   </Card>
    // </div>
  );
}

function PaymentForm({
  ticketPrices,
  matchID,
  setPurchaseFormOpened,
  onNewQrPayment,
  paymentStates,
}: {
  ticketPrices: TicketPrices | null;
  matchID: string | undefined;
  setPurchaseFormOpened: (open: boolean) => void;
  onNewQrPayment: (vs: string) => void;
  paymentStates: PaymentStateMap;
}) {
  const { watch, handleSubmit, control, setValue } = useForm({
    defaultValues: { fullTickets: 0, halfTickets: 0 },
  });

  const { fetchData } = useApi();

  const queryClient = useQueryClient();
  const [qrData, setQrData] = useState<PaymentResponse | null>(null);
  const [isQrLoading, setIsQrLoading] = useState(false);
  const { mutate: purchase, mutateAsync: purchaseAsync } = useMutation({
    mutationFn: (data: FieldValues) =>
      fetchData<PurchaseHistory>(`/purchase/mark`, {
        method: "POST",
        body: JSON.stringify({
          fullTickets: data.fullTickets,
          halfTickets: data.halfTickets,
          matchID: matchID,
          paymentType: data.paymentType || "cash",
        }),
      }),
    onSuccess: () => {
      queryClient.invalidateQueries({
        queryKey: ["match", matchID],
      });
      toast.success("Nákup byl úspěšně zaznamenán.");
    },
    onError: (error) => {
      toast.error("Chyba při zaznamenávání nákupu.");
      console.error("Error purchasing tickets:", error);
    },
  });

  const { mutateAsync: paymentAsync } = useMutation<
    PaymentResponse,
    any,
    { id: number; amount: number }
  >({
    mutationFn: (data) =>
      fetchData<PaymentResponse>("/payment", {
        method: "POST",
        body: JSON.stringify({
          amount: data.amount,
          purchaseId: data.id,
        }),
      }),
    onSuccess: (data) => {
      queryClient.invalidateQueries({
        queryKey: ["payment"],
      });
      toast.success("Platba byla úspěšně vytvořena.");
      console.log("Payment created:", data);
    },
    onError: (error) => {
      toast.error("Chyba při vytváření platby.");
      console.error("Error creating payment:", error);
    },
  });

  const fullTicketsValue = watch("fullTickets", 0);
  const halfTicketsValue = watch("halfTickets", 0);

  const increment = (field: "fullTickets" | "halfTickets") => {
    // @ts-expect-error the input can become a string so it has to be parsed at all times
    setValue(field, (parseInt(watch(field)) || 0) + 1);
  };

  const decrement = (field: "fullTickets" | "halfTickets") => {
    const currentValue = watch(field);
    if (currentValue > 0) {
      // @ts-expect-error the input can become a string so it has to be parsed at all times
      setValue(field, (parseInt(currentValue) || 0) - 1);
    }
  };

  const onQrRequest = async () => {
    if (!ticketPrices) return;

    try {
      setIsQrLoading(true);
      const { id, paymentType } = await purchaseAsync({
        fullTickets: fullTicketsValue,
        halfTickets: halfTicketsValue,
        matchID,
        paymentType: "qr",
      });
      console.log("id", id);
      console.log("paymentType", paymentType);
      const payment = await paymentAsync({
        id,
        amount:
          fullTicketsValue * ticketPrices.fullTicket +
          halfTicketsValue * ticketPrices.halfTicket,
      });
      setQrData(payment);
      if (payment.vs) {
        console.log("vs", payment);
        onNewQrPayment(payment.vs);
      }
    } catch (error) {
      console.error("Error creating payment:", error);
      toast.error("Chyba při vytváření platby");
    } finally {
      setIsQrLoading(false);
    }
  };

  if (!ticketPrices) return null;

  return (
    <form
      className="flex flex-col gap-4"
      onSubmit={handleSubmit((data) => purchase(data))}
    >
      <div className="px-5">
        <div className="flex flex-col gap-3">
          <Label htmlFor="fullTickets">Počet plných vstupenek:</Label>
          <TicketCounter
            control={control}
            onIncrement={increment}
            onDecrement={decrement}
            ticketType="fullTickets"
          />
        </div>
        <div className="flex flex-col gap-3 mt-4">
          <Label htmlFor="halfTickets" className="">
            Počet polovičních vstupenek:
          </Label>
          <TicketCounter
            control={control}
            onIncrement={increment}
            onDecrement={decrement}
            ticketType="halfTickets"
          />
        </div>
        <div className="flex flex-col gap-1 mt-4">
          <div className="flex flex-row justify-between items-center">
            <p>Plné vstupenky: </p>
            <span className="font-bold">
              {fullTicketsValue * ticketPrices?.fullTicket} Kč
            </span>
          </div>
          <div className="flex flex-row justify-between items-center">
            <p>Poloviční vstupenky: </p>
            <span className="font-bold">
              {halfTicketsValue * ticketPrices?.halfTicket} Kč
            </span>
          </div>
          <hr className="my-2" />
          <div className="flex flex-row justify-between items-center font-bold">
            <p>Cena celkem: </p>
            <span>
              {fullTicketsValue * ticketPrices?.fullTicket +
                halfTicketsValue * ticketPrices?.halfTicket}{" "}
              Kč
            </span>
          </div>
        </div>
      </div>
      <DrawerFooter>
        <DrawerClose asChild>
          <Button
            type="submit"
            className="w-full cursor-pointer"
            disabled={fullTicketsValue + halfTicketsValue === 0}
          >
            Platba hotovostí
          </Button>
        </DrawerClose>
        <QrDialog
          fullPrice={
            fullTicketsValue * ticketPrices?.fullTicket +
            halfTicketsValue * ticketPrices?.halfTicket
          }
          onQrRequest={onQrRequest}
          qrData={qrData}
          isQrLoading={isQrLoading}
          triggerDisabled={fullTicketsValue + halfTicketsValue === 0}
          setPurchaseFormOpened={setPurchaseFormOpened}
          livePaymentState={paymentStates[qrData?.vs as string]}
        />
        <DrawerClose asChild>
          <Button variant="outline">Zrušit</Button>
        </DrawerClose>
      </DrawerFooter>
    </form>
  );
}
