import { useEffect, useState } from "react";
import { FieldValues, useForm } from "react-hook-form";
import { useNavigate, useParams } from "react-router";
// import { useParams } from "react-router";

import { User } from "../../types/User";
import Spinner from "../Spinner";
import { EditStatus } from "../../types/EditStatus";

type UserData = Omit<User, "registeredAt">;

type EditUserProps = {
  onUserSave: (status: EditStatus) => void;
};

const EditUser = ({ onUserSave }: EditUserProps) => {
  //   const { userID } = useParams();
  const {
    register,
    handleSubmit,
    setError,
    setValue,
    formState: { errors, isSubmitting, isSubmitSuccessful },
  } = useForm();

  const { userID } = useParams<{ userID: string }>();
  const [editedUser, setEditedUser] = useState<UserData | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const navigate = useNavigate();

  useEffect(() => {
    const fetchUser = async () => {
      try {
        setIsLoading(true);
        const response = await fetch(
          `http://localhost:8080/api/admin/users/user/${userID}`
        );
        if (!response.ok) {
          throw new Error("Failed to fetch user");
        }
        const data = await response.json();
        setEditedUser(data);
        setValue("verified", data.verified);
        setValue("admin", data.roles.includes("ROLE_ADMIN"));
      } catch (error) {
        console.error("Error fetching user:", error);
      } finally {
        setIsLoading(false);
      }
    };

    fetchUser();
  }, [userID, setValue]);

  const onSubmit = async (data: FieldValues) => {
    if (!editedUser) {
      setError("root", {
        type: "faker",
        message: "Nastala chyba při aktualizaci uživatele.",
      });
      console.error("No user data available for submission");
      return;
    }

    let newRoles = [...editedUser.roles];

    /*if (data.admin && editedUser?.roles.includes("ROLE_ADMIN")) {
      setError("admin", {
        type: "manual",
        message: "Uživatel je již správcem.",
      });

      throw new Error("Uživatel je již správcem.");
    } else*/
    if (data.admin && !editedUser.roles.includes("ROLE_ADMIN")) {
      newRoles = [...newRoles, "ROLE_ADMIN"];
    } else if (!data.admin && editedUser.roles.includes("ROLE_ADMIN")) {
      newRoles = newRoles.filter((role) => role !== "ROLE_ADMIN");
    }

    try {
      console.log(editedUser);
      const response = await fetch(
        `http://localhost:8080/api/admin/users/user/${userID}`,
        {
          method: "PUT",
          headers: {
            "Content-Type": "application/json",
          },
          body: JSON.stringify({
            ...editedUser,
            roles: newRoles,
            verified: data.verified,
          }),
        }
      );

      if (!response.ok) {
        setError("root", {
          type: "server",
          message: "Nastala chyba při aktualizaci uživatele.",
        });
        throw new Error("Failed to update user");
      }

      // const result = await response.json();
      onUserSave({
        status: "ok",
        message: `Uživatel ${editedUser.fullName} byl úspěšně upraven!`,
      });
      navigate("/admin/users");
    } catch (error) {
      setError("root", {
        type: "server",
        message: "Nastala chyba při aktualizaci uživatele.",
      });
      console.error("Error updating user:", error);
    }
  };

  return (
    <div className="form-page-card">
      {isLoading && (
        <div className="flex justify-center items-center h-full">
          <Spinner />
        </div>
      )}
      {!isLoading && editedUser && (
        <>
          <h2 className="text-2xl font-bold text-center">
            Upravit uživatele{` ${editedUser.fullName} (${editedUser.email})`}
          </h2>
          {errors.root && (
            <div className="bg-red-100 text-red-700 p-4 mb-4 rounded-md">
              {errors.root.message as string}
            </div>
          )}
          {isSubmitSuccessful && (
            <div className="bg-green-100 text-green-700 p-4 mb-4 rounded-md">
              Uživatel byl úspěšně upraven!
            </div>
          )}
          <form
            onSubmit={handleSubmit((data) => onSubmit(data))}
            className="space-y-4"
          >
            <div className="flex flex-col gap-1">
              <h3 className="font-bold">Ověření</h3>

              <div className="flex items-center">
                <input
                  type="checkbox"
                  {...register("verified")}
                  className="form-checkbox"
                />
                <label className="ml-2">Uživatel ověřen</label>
              </div>
              {errors.verified && (
                <span className="text-red-500 text-sm">
                  {errors.verified.message as string}
                </span>
              )}
            </div>
            {/* TODO: Add entrance selection */}
            <div className="flex flex-col gap-1">
              <h3 className="font-bold ">Role</h3>
              <div className="flex items-center">
                <input
                  type="checkbox"
                  className="form-checkbox"
                  disabled
                  checked
                />
                <label className="ml-2">Pokladník (běžný uživatel)</label>
              </div>

              <div className="flex items-center">
                <input
                  type="checkbox"
                  {...register("admin")}
                  className="form-checkbox"
                />
                <label className="ml-2">Správce</label>
              </div>
              {errors.admin && (
                <span className="text-red-500 text-sm">
                  {errors.admin.message as string}
                </span>
              )}
            </div>
            <button
              type="submit"
              className={`${
                isSubmitting
                  ? "btn-disabled w-full mt-3"
                  : "btn-lime w-full mt-3"
              }`}
            >
              Uložit
            </button>
          </form>
        </>
      )}
    </div>
  );
};

export default EditUser;
