import { useEffect, useState } from "react";
import { FieldValues, useForm } from "react-hook-form";
import useApi from "../../hooks/useApi";
import { TicketPrices } from "../../types/TicketPrices";
import Spinner from "../Spinner";

const TicketList = () => {
  const [isLoading, setIsLoading] = useState(false);
  const [status, setStatus] = useState<string>("");
  const {
    register,
    handleSubmit,
    setError,
    setValue,
    watch,
    formState: { errors, isSubmitting },
  } = useForm();

  const { fetchData } = useApi();

  const fullTicketValue = watch("fullTicket");

  useEffect(() => {
    const fullTicketPrice = parseFloat(fullTicketValue);

    if (!isNaN(fullTicketPrice)) {
      setValue("halfTicket", (fullTicketPrice / 2).toString());
    } else {
      setValue("halfTicket", "");
    }
  }, [fullTicketValue, setValue]);

  useEffect(() => {
    const fetchTicketPrices = async () => {
      try {
        setIsLoading(true);
        const data = await fetchData<TicketPrices>("/ticket-prices", {
          method: "GET",
        });
        console.log(data);
        setValue("fullTicket", data.fullTicketPrice);
        setValue("halfTicket", data.halfTicketPrice);
      } catch (error) {
        console.error("Error fetching ticket prices:", error);
        setError("root", {
          type: "server",
          message: "Nastala chyba při načítání cen vstupenek.",
        });
      } finally {
        setIsLoading(false);
      }
    };

    fetchTicketPrices();
  }, [fetchData, setValue, setError]);

  const onSubmit = async (data: FieldValues) => {
    try {
      const response = await fetchData<{ status: string; message: string }>(
        "/ticket-prices/",
        {
          method: "PUT",
          body: JSON.stringify({
            fullTicketPrice: data.fullTicket,
            halfTicketPrice: data.halfTicket,
          }),
        }
      );
      if (!response) {
        setError("root", {
          type: "server",
          message: "Nastala chyba při aktualizaci cen vstupenek.",
        });
        return;
      }

      if (response.status == "ok") {
        setStatus(response.message);
      }
    } catch (error) {
      console.error("Error updating ticket prices:", error);
      setError("root", {
        type: "server",
        message: "Nastala chyba při aktualizaci cen vstupenek.",
      });
    }
  };

  if (isLoading) {
    return (
      <div className="form-page-card flex justify-center">
        <Spinner />
      </div>
    );
  }

  return (
    <div className="form-page-card">
      <h2 className="text-2xl font-bold text-center">Ceny vstupenek</h2>
      {status && <div className="form-success-box">{status}</div>}
      {errors.root && (
        <div className="form-error-box">{errors.root.message}</div>
      )}
      <form
        className="w-full flex flex-col gap-4"
        onSubmit={handleSubmit(onSubmit)}
      >
        <div className="flex flex-col gap-1">
          <label htmlFor="">Plné vstupenky</label>
          <div className="flex items-center gap-2">
            <input
              type="text"
              className="form-input"
              {...register("fullTicket")}
            />
            <span className="text-2xl">Kč</span>
          </div>
        </div>

        <div className="flex flex-col gap-1">
          <label htmlFor="">Poloviční vstupenky</label>
          <div className="flex items-center gap-2">
            <input
              type="text"
              className="form-input"
              {...register("halfTicket")}
            />
            <span className="text-2xl">Kč</span>
          </div>
        </div>

        <button className={`${isSubmitting ? "btn-disabled" : "btn-lime"}`}>
          Uložit
        </button>
      </form>
    </div>
  );
};

export default TicketList;
