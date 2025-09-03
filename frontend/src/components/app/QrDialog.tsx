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

type QrDialogProps = {
  fullPrice: number;
};

export default function QrDialog({ fullPrice }: QrDialogProps) {
  return (
    <Dialog>
      <DialogTrigger asChild>
        <Button variant="secondary">QR Platba</Button>
      </DialogTrigger>
      <DialogContent className="sm:max-w-md">
        <DialogHeader>
          <DialogTitle>QR Platba</DialogTitle>
          <DialogDescription>Cena celkem: {fullPrice} Kč</DialogDescription>
        </DialogHeader>
        <div className="flex items-center gap-2 mx-auto my-4">
          <QRCodeSVG
            value={`SPD*1.0*ACC:CZ5855000000001265098001*AM:${fullPrice}*CC:CZK*MSG:Vstupenky Buldok`}
            size={200}
            bgColor={"#ffffff"}
            fgColor={"#000000"}
            level={"M"}
          />
        </div>
        <DialogFooter className="sm:justify-start">
          <DialogClose asChild>
            <Button type="button" variant="outline">
              Zrušit
            </Button>
          </DialogClose>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}
