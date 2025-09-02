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
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";

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
        <div className="flex items-center gap-2">QRKO</div>
        <DialogFooter className="sm:justify-start">
          <DialogClose asChild>
            <Button type="button" variant="outline">
              Close
            </Button>
          </DialogClose>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}
