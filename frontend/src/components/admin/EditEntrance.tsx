import { useEffect, useState } from "react";
import { FieldValues, useForm } from "react-hook-form";
import { useParams } from "react-router";
import { Entrance } from "../../types/Entrance";
import Spinner from "../Spinner";
import { XCircle } from "lucide-react";
import { useDebounce } from "react-use";
import { User } from "../../types/User";

const EditEntrance = () => {
  const {
    register,
    handleSubmit,
    setError,
    setValue,
    formState: { errors, isSubmitting },
  } = useForm();

  const [editedEntrance, setEditedEntrance] = useState<Entrance | null>(null);
  const [isLoading, setIsLoading] = useState(true);

  const { entranceID } = useParams<{ entranceID: string }>();

  const [userSearchResults, setUserSearchResults] = useState<User[]>([]);
  const [userList, setUserList] = useState<User[]>([]);
  const [removedUser, setRemovedUser] = useState<User | null>(null);
  const [userSearchQuery, setUserSearchQuery] = useState<string>("");

  useEffect(() => {
    if (!entranceID) {
      setError("root", {
        type: "faker",
        message: "Nastala chyba při načítání vstupu.",
      });
      return;
    }

    const fetchEntrance = async () => {
      try {
        setIsLoading(true);
        const response = await fetch(
          `http://localhost:8080/api/admin/entrances/entrance/${entranceID}`
        );

        if (!response.ok) {
          setError("root", {
            type: "faker",
            message: "Nastala chyba při načítání vstupu.",
          });
          throw new Error("Failed to fetch entrance");
        }

        const data = await response.json();
        console.log(data);
        setEditedEntrance(data);
        setUserList(data.users);
        setValue("name", data.name);
        setValue("location", data.location);
      } catch (error) {
        console.error("Error fetching entrance:", error);
      } finally {
        setIsLoading(false);
      }
    };
    fetchEntrance();
  }, [entranceID, setError, setValue]);

  useDebounce(
    () => {
      if (userSearchQuery && userSearchQuery.length > 2) {
        const fetchUser = async () => {
          try {
            const response = await fetch(
              `http://localhost:8080/api/admin/users/search?q=${userSearchQuery}`
            );
            if (!response.ok) {
              setError("user", {
                type: "server",
                message: "Uživatel nenalezen.",
              });
              return;
            }
            const data = await response.json();
            console.log(data);
            setUserSearchResults(data);
          } catch (error) {
            console.error("Error fetching user:", error);
          }
        };
        fetchUser();
      }
    },
    1000,
    [userSearchQuery]
  );

  const onSubmit = async (data: FieldValues) => {
    if (!editedEntrance) {
      setError("root", {
        type: "faker",
        message: "Nastala chyba při aktualizaci vstupu.",
      });
      console.error("No entrance data available for submission");
      return;
    }

    try {
      const response = await fetch(
        `http://localhost:8080/api/admin/entrances/entrance/${entranceID}`,
        {
          method: "PUT",
          headers: {
            "Content-Type": "application/json",
          },
          body: JSON.stringify({
            ...editedEntrance,
            name: data.name,
            location: data.location,
          }),
        }
      );

      if (!response.ok) {
        setError("root", {
          type: "server",
          message: "Nastala chyba při aktualizaci vstupu.",
        });
        throw new Error("Failed to update entrance");
      }

      const resData = await response.json();
      console.log(resData);
    } catch (error) {
      console.error("Error updating entrance:", error);
    }
  };

  const handleUserAdd = async (user: User) => {
    try {
      const response = await fetch(
        `http://localhost:8080/api/admin/users/user/${user.id}`,
        {
          method: "PUT",
          headers: {
            "Content-Type": "application/json",
          },
          body: JSON.stringify({
            entrance: entranceID,
          }),
        }
      );

      if (!response.ok) {
        setError("user", {
          type: "server",
          message: "Nastala chyba při přidávání uživatele.",
        });
        setUserList((prev) => prev.filter((u) => u.id !== user.id));
        throw new Error("Failed to add user");
      }

      const data = await response.json();
      console.log(data);
    } catch (error) {
      console.error("Error adding user:", error);
    }
  };

  const handleUserRemove = async (user: User) => {
    try {
      const response = await fetch(
        `http://localhost:8080/api/admin/users/user/${user.id}/remove-entrance`,
        {
          method: "PUT",
          headers: {
            "Content-Type": "application/json",
          },
        }
      );

      if (!response.ok) {
        setError("user", {
          type: "server",
          message: "Nastala chyba při odebírání uživatele.",
        });
        throw new Error("Failed to remove user");
      }

      setRemovedUser(user);
    } catch (error) {
      console.error("Error removing user:", error);
    }
  };

  if (isLoading)
    return (
      <div className="flex justify-center h-screen bg-white w-full pt-20">
        <Spinner />
      </div>
    );

  return (
    <div className="form-page-card">
      <h1 className="font-bold text-2xl text-center">Úprava vstupu</h1>
      {removedUser && (
        <div className="form-success-box ">
          Uživatel {removedUser.fullName} byl úspěšně odebrán ze vstupu.
        </div>
      )}
      <form
        onSubmit={handleSubmit((data) => onSubmit(data))}
        className="space-y-4"
      >
        <div className="flex flex-col gap-1">
          <label htmlFor="name">Název vstupu</label>
          <input
            type="text"
            {...register("name", { required: "Toto pole je povinné" })}
            className="form-input"
            name="name"
            id="name"
          />
          {errors.name && (
            <span className="text-red-500 text-sm">
              {errors.name.message as string}
            </span>
          )}
        </div>
        <div className="flex flex-col gap-1">
          <label htmlFor="loation">Lokace</label>
          <input
            type="text"
            {...register("loation")}
            className="form-input"
            name="loation"
            id="loation"
          />
          {errors.loation && (
            <span className="text-red-500 text-sm">
              {errors.loation.message as string}
            </span>
          )}
        </div>
        <div className="flex flex-col gap-1">
          <h3 className="font-bold">Uživatelé přiřazení ke vstupu</h3>
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
        <div className="flex flex-col gap-1">
          <label htmlFor="name">Přidat uživatele</label>
          <div className="flex flex-row gap-2">
            <input
              type="text"
              className="form-input"
              name="user"
              id="user"
              placeholder="Zadejte jméno uživatele..."
              onChange={(e) => {
                setUserSearchQuery(e.target.value);
              }}
            />
          </div>

          {userSearchResults.length > 0 && (
            <ul className="w-full border border-t-0 border-gray-300 rounded-b-md">
              {userSearchResults
                .filter((sr) => !userList.some((u) => u.id === sr.id))
                .map((user) => (
                  <li
                    key={user.id}
                    className="flex items-center justify-between p-2"
                  >
                    <span className="ml-2">{user.fullName}</span>
                    <button
                      type="button"
                      onClick={() => {
                        setUserList((prev) => [...prev, user]);
                        setUserSearchResults((prev) =>
                          prev.filter((u) => u.id !== user.id)
                        );
                        handleUserAdd(user);
                      }}
                      className="btn-lime"
                    >
                      Přidat
                    </button>
                  </li>
                ))}
            </ul>
          )}
        </div>

        <button
          type="submit"
          className={`${
            isSubmitting ? "btn-disabled w-full mt-3" : "btn-lime w-full mt-3"
          }`}
        >
          Uložit změny
        </button>
      </form>
    </div>
  );
};

export default EditEntrance;
