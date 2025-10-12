import { ButtonGroup } from "@/components/ui/button-group";
import { InputGroup, InputGroupInput } from "@/components/ui/input-group";

import { Control, Controller } from "react-hook-form";
import { Button } from "../ui/button";

type TicketCounterProps = {
  control: Control<
    {
      fullTickets: number;
      halfTickets: number;
    },
    any,
    {
      fullTickets: number;
      halfTickets: number;
    }
  >;
  onIncrement: (name: "fullTickets" | "halfTickets") => void;
  onDecrement: (name: "fullTickets" | "halfTickets") => void;
  ticketType: "fullTickets" | "halfTickets";
};

const TicketCounter = ({
  control,
  onIncrement,
  onDecrement,
  ticketType,
}: TicketCounterProps) => {
  return (
    <Controller
      control={control}
      name={ticketType}
      render={({ field }) => (
        <ButtonGroup className="w-full h-16">
          <Button
            type="button"
            onClick={() => onDecrement(ticketType)}
            className="h-full w-20 text-lg"
          >
            -
          </Button>
          <InputGroup className="h-full">
            <InputGroupInput
              className="text-center bg-white h-full text-2xl"
              {...field}
            />
          </InputGroup>
          <Button
            type="button"
            onClick={() => onIncrement(ticketType)}
            className="h-full w-20 text-lg"
          >
            +
          </Button>
        </ButtonGroup>
      )}
    />
  );
};

export default TicketCounter;
