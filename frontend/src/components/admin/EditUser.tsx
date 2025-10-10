import { FieldValues, useForm } from "react-hook-form";
import { useNavigate, useParams } from "react-router";
import { User } from "../../types/User";
import Spinner from "../Spinner";
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
import { Button } from "../ui/button";
import { Label } from "../ui/label";
import { Checkbox } from "../ui/checkbox";
import { RadioGroup, RadioGroupItem } from "../ui/radio-group";

type UserData = Omit<User, "registeredAt">;

const EditUser = () => {
  const { userID } = useParams<{ userID: string }>();
  const navigate = useNavigate();
  const { fetchData } = useApi();

  const {
    data: editedUser,
    isPending,
    isError,
    error,
  } = useQuery({
    queryKey: ["user", userID],
    queryFn: () =>
      fetchData<UserData>(`/admin/users/user/${userID}`, { method: "GET" }),
    retry: false,
  });
  console.log(editedUser);

  const form = useForm({
    values: {
      verified: editedUser ? editedUser.verified : false,
      admin: editedUser ? editedUser.roles.includes("ROLE_ADMIN") : false,
      status: editedUser ? editedUser.status : "active",
    },
  });

  const queryClient = useQueryClient();

  const { mutate, isPending: isSubmitting } = useMutation({
    mutationFn: (data: FieldValues) => {
      return fetchData<User>(`/admin/users/user/${userID}`, {
        method: "PUT",
        body: JSON.stringify({
          ...editedUser,
          roles: data.admin
            ? [...(editedUser?.roles || []), "ROLE_ADMIN"]
            : (editedUser?.roles || []).filter((role) => role !== "ROLE_ADMIN"),
          verified: data.verified,
          status: data.status,
        }),
      });
    },
    onSuccess: (res, variables) => {
      console.log(res, variables);
      queryClient.invalidateQueries({ queryKey: ["user", userID] });
      queryClient.invalidateQueries({ queryKey: ["users"] });
      toast.success(`Uživatel ${res?.fullName} byl úspěšně upraven!`);
      navigate("/admin/users");
    },
    onError: (error: any) => {
      console.error("Error updating user:", error);
      toast.error(
        error?.message ||
          "Nastala chyba při aktualizaci uživatele. Zkuste to prosím znovu."
      );
    },
  });

  if (isPending) {
    return (
      <Card className="w-full lg:max-w-2/5 h-screen lg:max-h-2/5 mx-auto flex justify-center items-center">
        <CardContent className="flex justify-center items-center">
          <Spinner />
        </CardContent>
      </Card>
    );
  }

  if (isError) {
    return (
      <Card className="w-full lg:max-w-2/5 h-screen lg:max-h-2/5 mx-auto flex justify-center items-center">
        <CardContent className="flex justify-center items-center">
          <p className="text-red-500">
            {error?.message || "Nastala chyba při načítání uživatele."}
          </p>
        </CardContent>
      </Card>
    );
  }
  // TODO: pridat vyber entrance
  return (
    <Card className="w-full lg:max-w-1/3 mx-auto">
      <CardHeader>
        <CardTitle>
          Upravit uživatele {`${editedUser?.fullName} (${editedUser?.email})`}
        </CardTitle>
      </CardHeader>
      <CardContent>
        <Form {...form}>
          <form
            className="w-full flex gap-2 flex-col"
            onSubmit={form.handleSubmit((data) => mutate(data))}
          >
            <FormField
              control={form.control}
              name="status"
              render={({ field }) => (
                <FormItem className="space-y-3">
                  <FormLabel>Vyberte stav účtu</FormLabel>
                  <FormControl>
                    <RadioGroup
                      onValueChange={field.onChange}
                      value={field.value}
                      className="flex flex-col"
                    >
                      <FormItem className="flex items-center gap-3">
                        <FormControl>
                          <RadioGroupItem value="pending" />
                        </FormControl>
                        <FormLabel className="font-normal">
                          Čekající na aktivaci
                        </FormLabel>
                      </FormItem>
                      <FormItem className="flex items-center gap-3">
                        <FormControl>
                          <RadioGroupItem value="active" />
                        </FormControl>
                        <FormLabel className="font-normal">Aktivní</FormLabel>
                      </FormItem>
                      <FormItem className="flex items-center gap-3">
                        <FormControl>
                          <RadioGroupItem value="suspended" />
                        </FormControl>
                        <FormLabel className="font-normal">
                          Pozastavený
                        </FormLabel>
                      </FormItem>
                    </RadioGroup>
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />

            <FormField
              control={form.control}
              name="admin"
              render={({ field }) => (
                <FormItem className="flex flex-col mb-4">
                  <FormLabel>Role</FormLabel>
                  <FormControl>
                    <div className="flex flex-col">
                      <div className="flex items-center mb-2">
                        <Checkbox checked disabled />
                        <Label className="ml-2">
                          Pokladník (běžný uživatel)
                        </Label>
                      </div>

                      <div className="flex items-center">
                        <Checkbox
                          checked={field.value}
                          onCheckedChange={(checked) =>
                            field.onChange(!!checked)
                          }
                        />
                        <Label className="ml-2">Správce</Label>
                      </div>
                    </div>
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />
            <Button
              className="w-full mt-3"
              type="submit"
              disabled={isSubmitting}
            >
              Uložit
            </Button>
          </form>
        </Form>
      </CardContent>
    </Card>
  );
};

export default EditUser;
