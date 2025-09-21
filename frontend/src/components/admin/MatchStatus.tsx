import { Dot } from "lucide-react";

type matchStatusProps = {
  status: string;
};

const MatchStatus = ({ status }: matchStatusProps) => {
  return (
    <span
      className={`${
        status === "active"
          ? "bg-green-300 text-green-800"
          : "bg-red-300 text-red-800"
      } p-1 px-2 pr-3 rounded-4xl flex items-center justify-center grow-0 w-30`}
    >
      <Dot className="m-0 p-0" size={30} />
      {status === "active" ? "Probíhá" : "Ukončen"}
    </span>
  );
};

export default MatchStatus;
