import { User } from "../../types/User";
import useApi from "../../hooks/useApi";
import Spinner from "../Spinner";
import { DataTable } from "./UserTable/data-table";
import { columns } from "./UserTable/columns";
import ContentBoard from "./ContentBoard";
import { useQuery } from "@tanstack/react-query";

const UserList = () => {
  const { fetchData } = useApi();

  const { data: users, isPending } = useQuery<User[]>({
    queryKey: ["users"],
    queryFn: () => fetchData<User[]>("/admin/users/all", { method: "GET" }),
  });

  if (isPending) {
    return (
      <div className="flex justify-center items-center h-full rounded-md">
        <Spinner />
      </div>
    );
  }

  return (
    <ContentBoard>
      <DataTable columns={columns} data={users} />
    </ContentBoard>
  );
};

export default UserList;
