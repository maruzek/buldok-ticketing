import Spinner from "../Spinner";
import { Entrance } from "../../types/Entrance";
import useApi from "../../hooks/useApi";
import { useQuery } from "@tanstack/react-query";
import { EntrancesDataTable } from "./EntranceTable/data-table";
import { columns } from "./EntranceTable/columns";
import { ApiError } from "@/types/ApiError";
import BasicError from "../errors/BasicError";
import { Frown, ShieldBan } from "lucide-react";

const EntranceList = () => {
  const { fetchData } = useApi();

  const {
    data: entrances,
    isPending,
    isError,
    error,
  } = useQuery<Entrance[], ApiError>({
    queryKey: ["entrances"],
    queryFn: () =>
      fetchData<Entrance[]>("/admin/entrances/", { method: "GET" }),
  });

  if (isPending)
    return (
      <div className="flex justify-center h-screen w-full pt-20">
        <Spinner />
      </div>
    );

  if (isError) {
    if (error.status === 403) {
      return (
        <BasicError
          title={`Přístup odepřen`}
          icon={<ShieldBan />}
          message="Nemáte oprávnění zobrazit vstupy."
        />
      );
    } else if (error.status === 500) {
      return (
        <BasicError
          title={`Chyba serveru`}
          icon={<Frown />}
          message="Nastala chyba na straně serveru. Zkuste to prosím znovu později."
        />
      );
    }

    return (
      <BasicError
        title={`Nastala chyba při načítání vstupů`}
        icon={<Frown />}
        message={error.message}
      />
    );
  }

  if (!entrances || entrances.length === 0) {
    return (
      <div className="flex justify-center h-screen bg-white w-full pt-20">
        <p className="text-gray-500">Žádné vstupy k zobrazení.</p>
      </div>
    );
  }

  return (
    <>
      <EntrancesDataTable columns={columns} data={entrances} />
    </>
  );
};

export default EntranceList;
