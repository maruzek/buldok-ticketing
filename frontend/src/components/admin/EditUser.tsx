import { useEffect } from "react";
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

type UserData = Omit<User, "registeredAt">;

const EditUser = () => {
  const { userID } = useParams<{ userID: string }>();
  const navigate = useNavigate();
  const { fetchData } = useApi();

  const { data: editedUser, isPending } = useQuery({
    queryKey: ["user", userID],
    queryFn: () =>
      fetchData<UserData>(`/admin/users/user/${userID}`, { method: "GET" }),
  });

  const form = useForm({
    defaultValues: {
      verified: editedUser ? editedUser.verified : false,
      admin: editedUser ? editedUser.roles.includes("ROLE_ADMIN") : false,
    },
  });

  useEffect(() => {
    if (editedUser) {
      form.reset({
        verified: editedUser.verified,
        admin: editedUser.roles.includes("ROLE_ADMIN"),
      });
    }
  }, [editedUser, form]);

  const queryClient = useQueryClient();

  const { mutate, isPending: isSubmitting } = useMutation({
    mutationFn: (data: FieldValues) => {
      return fetchData<{ status: string; message: string; updatedUser: User }>(
        `/admin/users/user/${userID}`,
        {
          method: "PUT",
          body: JSON.stringify({
            ...editedUser,
            roles: data.admin
              ? [...(editedUser?.roles || []), "ROLE_ADMIN"]
              : (editedUser?.roles || []).filter(
                  (role) => role !== "ROLE_ADMIN"
                ),
            verified: data.verified,
          }),
        }
      );
    },
    onSuccess: (res, variables) => {
      console.log(res, variables);
      queryClient.invalidateQueries({ queryKey: ["user", userID] });
      queryClient.invalidateQueries({ queryKey: ["users"] });
      toast.success(
        `Uživatel ${res?.updatedUser.fullName} byl úspěšně upraven!`
      );
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

  return (
    <Card className="w-full lg:max-w-2/5 mx-auto">
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
              name="verified"
              render={({ field }) => (
                <FormItem className="flex flex-col mb-4">
                  <FormLabel>Ověření</FormLabel>
                  <FormControl>
                    <div className="flex items-center">
                      <Checkbox
                        checked={field.value}
                        onCheckedChange={(checked) => field.onChange(!!checked)}
                      />
                      <Label className="ml-2">Uživatel ověřen</Label>
                    </div>
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
