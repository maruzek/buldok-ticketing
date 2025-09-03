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
import { Controller, FieldValues, useForm } from "react-hook-form";
import { PurchaseHistory } from "@/types/PurchaseHistory";
import { TicketPrices } from "@/types/TicketPrices";
import useApi from "@/hooks/useApi";
import { Card, CardDescription, CardHeader, CardTitle } from "../ui/card";
import { Input } from "../ui/input";
import { Slider } from "../ui/slider";
import { Label } from "../ui/label";
import { useState } from "react";

type PurchaseDrawerProps = {
  matchID: string | undefined;
  ticketPrices: TicketPrices | null;
  onHistoryUpdate: (data: PurchaseHistory) => void;
};

export default function PurchaseDrawer({
  matchID,
  ticketPrices,
  onHistoryUpdate,
}: PurchaseDrawerProps) {
  const [open, setOpen] = useState(false);
  const isDesktop = useMediaQuery("(min-width: 768px)");

  if (isDesktop) {
    return (
      <Dialog open={open} onOpenChange={setOpen}>
        <DialogTrigger asChild>
          <Button className="w-full">Zaznamenat nákup</Button>
        </DialogTrigger>
        <DialogContent className="sm:max-w-[425px]">
          <DialogHeader>
            <DialogTitle>Zaznamenat nákup</DialogTitle>
          </DialogHeader>
          <PaymentForm
            ticketPrices={ticketPrices}
            matchID={matchID}
            onHistoryUpdate={onHistoryUpdate}
          />
        </DialogContent>
      </Dialog>
    );
  }

  return (
    <Drawer open={open} onOpenChange={setOpen}>
      <DrawerTrigger asChild>
        <Button className="w-full">Zaznamenat nákup</Button>
      </DrawerTrigger>
      <DrawerContent>
        <DrawerHeader className="text-left">
          <DrawerTitle>Zaznamenat nákup</DrawerTitle>
        </DrawerHeader>
        <PaymentForm
          ticketPrices={ticketPrices}
          matchID={matchID}
          onHistoryUpdate={onHistoryUpdate}
        />
      </DrawerContent>
    </Drawer>
  );
}

function PaymentForm({
  ticketPrices,
  matchID,
  onHistoryUpdate,
}: {
  ticketPrices: TicketPrices | null;
  matchID: string | undefined;
  onHistoryUpdate: (data: PurchaseHistory) => void;
}) {
  const { watch, handleSubmit, control } = useForm({
    defaultValues: { fullTickets: 0, halfTickets: 0 },
  });

  const onSubmit = async (data: FieldValues) => {
    try {
      if (data.fullTickets < 0 && data.halfTickets < 0) {
        console.error("Invalid ticket count");
        return;
      }

      const response = await fetchData<PurchaseHistory>(`/purchase/mark`, {
        method: "POST",
        body: JSON.stringify({
          fullTickets: data.fullTickets,
          halfTickets: data.halfTickets,
          matchID: matchID,
        }),
      });
      if (!response) {
        console.error("Failed to purchase tickets");
        return;
      }
      console.log("response: ", response);
      onHistoryUpdate(response);
      // onModalToggle(false);
    } catch (error) {
      console.error("Error purchasing tickets:", error);
    }
  };

  const { fetchData } = useApi();

  const fullTicketsValue = watch("fullTickets", 0);
  const halfTicketsValue = watch("halfTickets", 0);

  return (
    <>
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
          <form
            className="flex flex-col gap-4"
            onSubmit={handleSubmit(onSubmit)}
          >
            <div className="px-5">
              <div className="flex flex-col gap-3">
                <Controller
                  control={control}
                  name="fullTickets"
                  render={({ field }) => (
                    <div className="flex flex-col items-center gap-2">
                      <div className="flex flex-row justify-between items-center w-full">
                        <Label htmlFor="fullTickets">
                          Počet plných vstupenek:{" "}
                        </Label>
                        <Input type="number" {...field} className="w-1/5" />
                      </div>
                      <Slider
                        value={[field.value]}
                        max={10}
                        step={1}
                        onValueChange={([v]) => field.onChange(v)}
                      />
                    </div>
                  )}
                />
              </div>
              <div className="flex flex-col gap-3 mt-4">
                <Controller
                  control={control}
                  name="halfTickets"
                  render={({ field }) => (
                    <div className="flex flex-col items-center gap-2">
                      <div className="flex flex-row justify-between items-center w-full">
                        <Label htmlFor="halfTickets">
                          Počet polovičních vstupenek:{" "}
                        </Label>
                        <Input type="number" {...field} className="w-1/5" />
                      </div>
                      <Slider
                        value={[field.value]}
                        max={10}
                        step={1}
                        onValueChange={([v]) => field.onChange(v)}
                      />
                    </div>
                  )}
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
            <DrawerFooter className="">
              <DrawerClose asChild>
                <Button type="submit" className="w-full cursor-pointer">
                  Uložit
                </Button>
              </DrawerClose>

              <DrawerClose asChild>
                <Button variant="outline">Zrušit</Button>
              </DrawerClose>
              <QrDialog
                fullPrice={
                  fullTicketsValue * ticketPrices?.fullTicket +
                  halfTicketsValue * ticketPrices?.halfTicket
                }
              />
            </DrawerFooter>
          </form>
        </>
      )}
    </>
  );
}
