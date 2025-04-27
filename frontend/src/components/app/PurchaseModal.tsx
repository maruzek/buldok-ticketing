import { useForm } from "react-hook-form";

type PurchaseModalProps = {
  onModalToggle: (arg0: boolean) => void;
};

const PurchaseModal = ({ onModalToggle }: PurchaseModalProps) => {
  const {
    register,
    handleSubmit,
    control,
    getValues,
    watch,
    formState: { errors, isSubmitting, isSubmitSuccessful },
  } = useForm();

  const fullTicketsValue = watch("fullTickets", 0);
  const halfTicketsValue = watch("halfTickets", 0);

  const fullPrice = 100;
  const halfPrice = 50;

  return (
    <div className="fixed inset-0 flex items-center justify-center z-50 rounded-md w-full">
      <div
        className="w-full h-full bg-black absolute opacity-80"
        onClick={() => onModalToggle(false)}
      />
      <div className="bg-white rounded-lg shadow-lgmin-w-[300px] relative w-full mx-4">
        <header className="h-8 p-5 bg-gray-50 w-full flex justify-between items-center  rounded-md">
          <h3 className="font-bold text-sm">Přidat nákup</h3>
          <button
            className=" text-gray-500 hover:text-gray-700"
            onClick={() => onModalToggle(false)}
            aria-label="Zavřít"
          >
            ×
          </button>
        </header>
        {/* Modal content goes here */}
        <main className="p-5">
          <div className="flex flex-row justify-center gap-2 mb-4">
            <div className="flex flex-col justify-center items-center bg-green-300 p-3 rounded-md">
              <p>Plná cena:</p>
              <span className="font-bold">{fullPrice} Kč</span>
            </div>
            <div className="flex flex-col justify-center items-center bg-green-100 p-3 rounded-md">
              <p>Plná cena:</p>
              <span className="font-bold">{halfPrice} Kč</span>
            </div>
          </div>
          <form className="flex flex-col gap-4">
            <div className="flex flex-col gap-1">
              <label htmlFor="">
                Počet plných vstupenek:{" "}
                <span className="font-bold">{fullTicketsValue}</span>
              </label>
              <input
                type="range"
                className="p-2"
                placeholder="0"
                min={0}
                max={20}
                defaultValue={0}
                {...register("fullTickets", { required: true })}
              />
            </div>
            <div className="flex flex-col gap-1">
              <label htmlFor="">
                Počet polovičních vstupenek:{" "}
                <span className="font-bold">{halfTicketsValue}</span>
              </label>
              <input
                type="range"
                className=" p-2 "
                placeholder="0"
                min={0}
                max={20}
                defaultValue={0}
                {...register("halfTickets", { required: true })}
              />
            </div>
            <div className="flex flex-col gap-1">
              <div className="flex flex-row justify-between items-center">
                <p>Plné vstupenky: </p>
                <span className="font-bold">
                  {fullTicketsValue * fullPrice} Kč
                </span>
              </div>
              <div className="flex flex-row justify-between items-center">
                <p>Poloviční vstupenky: </p>
                <span className="font-bold">
                  {halfTicketsValue * halfPrice} Kč
                </span>
              </div>
              <hr className="my-2" />
              <div className="flex flex-row justify-between items-center font-bold">
                <p>Cena celkem: </p>
                <span>
                  {fullTicketsValue * fullPrice + halfTicketsValue * halfPrice}{" "}
                  Kč
                </span>
              </div>
            </div>
            <button
              type="submit"
              className="w-full bg-lime-500 text-white font-bold py-2 rounded-md hover:bg-lime-600 transition duration-200"
              onClick={() => {
                console.log(getValues());
                onModalToggle(false);
              }}
            >
              Uložit
            </button>
            <button
              type="button"
              className="w-full bg-red-500 text-white font-bold py-2 rounded-md hover:bg-red-600 transition duration-200"
              onClick={() => {
                onModalToggle(false);
              }}
            >
              Zrušit
            </button>
          </form>
        </main>
      </div>
    </div>
  );
};

export default PurchaseModal;
