import Spinner from "../Spinner";
import { Entrance } from "../../types/Entrance";
import useApi from "../../hooks/useApi";
import { useQuery } from "@tanstack/react-query";
import { EntrancesDataTable } from "./EntranceTable/data-table";
import { columns } from "./EntranceTable/columns";

const EntranceList = () => {
  const { fetchData } = useApi();

  const { data: entrances, isPending } = useQuery<Entrance[]>({
    queryKey: ["entrances"],
    queryFn: () =>
      fetchData<Entrance[]>("/admin/entrances/", { method: "GET" }),
  });

  if (isPending)
    return (
      <div className="flex justify-center h-screen bg-white w-full pt-20">
        <Spinner />
      </div>
    );

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
