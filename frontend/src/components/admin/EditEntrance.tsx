import { useEffect, useState } from "react";
import { FieldValues, useForm } from "react-hook-form";
import { useNavigate, useParams } from "react-router";
import { Entrance } from "../../types/Entrance";
import Spinner from "../Spinner";
import { XCircle } from "lucide-react";
import { useDebounce } from "react-use";
import { User } from "../../types/User";
import useApi from "../../hooks/useApi";
import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { toast } from "sonner";
import { Card, CardContent, CardHeader, CardTitle } from "../ui/card";
import {
  Form,
  FormControl,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
} from "../ui/form";
import { Input } from "../ui/input";
import { Button } from "../ui/button";
import { Label } from "../ui/label";

const EditEntrance = () => {
  const { entranceID } = useParams<{ entranceID: string }>();

  const { fetchData } = useApi();
  const navigate = useNavigate();

  const [userSearchResults, setUserSearchResults] = useState<User[]>([]);
  const [userList, setUserList] = useState<User[]>([]);
  const [userSearchQuery, setUserSearchQuery] = useState<string>("");

  const { data: editedEntrance, isPending } = useQuery({
    queryKey: ["entrances", entranceID],
    queryFn: () =>
      fetchData<Entrance>(`/admin/entrances/${entranceID}`, {
        method: "GET",
      }),
  });

  const form = useForm({
    defaultValues: {
      name: editedEntrance ? editedEntrance.name : "",
      location: editedEntrance ? editedEntrance.location : "",
    },
  });

  useEffect(() => {
    if (editedEntrance) {
      setUserList(editedEntrance.users || []);
      form.reset({
        name: editedEntrance.name,
        location: editedEntrance.location,
      });
    }
  }, [editedEntrance, form]);

  useDebounce(
    () => {
      if (userSearchQuery && userSearchQuery.length > 2) {
        const fetchUser = async () => {
          try {
            const data = await fetchData<User[]>(
              `/admin/users/search?q=${userSearchQuery}`,
              {
                method: "GET",
              }
            );
            console.log(data);
            setUserSearchResults(data || []);
          } catch (error) {
            console.error("Error fetching user:", error);
          }
        };
        fetchUser();
      } else {
        setUserSearchResults([]);
      }
    },
    1000,
    [userSearchQuery, fetchData]
  );

  const queryClient = useQueryClient();

  const { mutate } = useMutation({
    mutationFn: (data: FieldValues) =>
      fetchData<Entrance>(`/admin/entrances/${entranceID}`, {
        method: "PUT",
        body: JSON.stringify({
          ...editedEntrance,
          name: data.name,
          location: data.location,
        }),
      }),
    onSuccess: (res, variables) => {
      queryClient.invalidateQueries({ queryKey: ["entrances"] });
      queryClient.invalidateQueries({ queryKey: ["entrance", entranceID] });
      console.log(res);
      toast.success(`Vstup ${variables.name} byl úspěšně upraven.`);
      navigate("/admin/entrances");
    },
    onError: (error: any) => {
      toast.error("Nastala chyba při aktualizaci vstupu.");
      form.setError("root", {
        type: "server",
        message: "Nastala chyba při aktualizaci vstupu.",
      });
      console.error("Error updating entrance:", error);
    },
  });

  const { mutate: handleUserAdd } = useMutation({
    mutationFn: (user: User) =>
      fetchData(`/admin/users/user/${user.id}/change-entrance`, {
        method: "PUT",
        body: JSON.stringify({
          entranceID: editedEntrance?.id,
        }),
      }),
    onSuccess: (res, variables) => {
      queryClient.invalidateQueries({ queryKey: ["entrances", entranceID] });
      setUserSearchQuery("");
      toast.success(
        `Uživatel ${variables.fullName} byl úspěšně přidán ke vstupu.`
      );
      console.log(res);
    },
    onError: (error: any) => {
      form.setError("root", {
        type: "server",
        message: "Nastala chyba při přidávání uživatele.",
      });
      console.error("Error adding user:", error);
    },
  });

  const { mutate: handleUserRemove } = useMutation({
    mutationFn: (user: User) =>
      fetchData<User>(`/admin/users/user/${user.id}/remove-entrance`, {
        method: "PUT",
      }),
    onSuccess: (res, variables) => {
      toast.success(
        `Uživatel ${variables.fullName} byl úspěšně odebrán ze vstupu.`
      );
      queryClient.invalidateQueries({ queryKey: ["entrances", entranceID] });
    },
    onError: (error: any) => {
      toast.error("Nastala chyba při odebírání uživatele.");
      console.error("Error removing user:", error);
    },
  });

  if (isPending)
    return (
      <div className="flex justify-center h-screen bg-white w-full pt-20">
        <Spinner />
      </div>
    );

  return (
    <Card className="w-full lg:max-w-3/5 mx-auto">
      <CardHeader>
        <CardTitle>Úprava vstupu</CardTitle>
      </CardHeader>
      <CardContent>
        <Form {...form}>
          <form
            className="w-full flex flex-col gap-4"
            onSubmit={form.handleSubmit((data) => mutate(data))}
          >
            <FormField
              control={form.control}
              name="name"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Název vstupu</FormLabel>
                  <FormControl>
                    <Input {...field} />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />
            <FormField
              control={form.control}
              name="location"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Umístění</FormLabel>
                  <FormControl>
                    <Input {...field} />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />

            <div className="flex flex-col gap-1">
              <h4 className="font-medium">Uživatelé přiřazení ke vstupu</h4>
              <ul>
                {userList &&
                  userList.map((user) => (
                    <li
                      key={user.id}
                      className="flex items-center justify-start gap-3"
                    >
                      <span className="">{user.fullName}</span>
                      <button
                        type="button"
                        onClick={() => {
                          setUserList((prev) =>
                            prev.filter((u) => u.id !== user.id)
                          );
                          handleUserRemove(user);
                        }}
                        className="btn-red cursor-pointer text-red-500 hover:text-red-700"
                      >
                        <XCircle className="w-5 h-5 " />
                      </button>
                    </li>
                  ))}
              </ul>
            </div>
            <div className="flex flex-col gap-2">
              <Label htmlFor="name">Přidat uživatele</Label>
              <div className="flex flex-row gap-2">
                <Input
                  type="text"
                  name="user"
                  id="user"
                  placeholder="Zadejte jméno uživatele..."
                  onChange={(e) => {
                    setUserSearchQuery(e.target.value);
                  }}
                  value={userSearchQuery}
                />
              </div>

              {userSearchResults.length > 0 && (
                <ul className="w-full border border-t-0 border-gray-300 rounded-b-md">
                  {userSearchResults
                    .filter((sr) => !userList.some((u) => u.id === sr.id))
                    .map((user) => (
                      <li
                        key={user.id}
                        className="flex itemsditen-center justify-between p-2"
                      >
                        <span className="ml-2">{user.fullName}</span>
                        <Button
                          type="button"
                          onClick={() => {
                            handleUserAdd(user);
                          }}
                          variant={"secondary"}
                        >
                          Přidat
                        </Button>
                      </li>
                    ))}
                </ul>
              )}
            </div>

            <Button type="submit">Uložit změny</Button>
          </form>
        </Form>
      </CardContent>
    </Card>
  );
};

export default EditEntrance;
