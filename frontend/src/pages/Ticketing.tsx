import Header from "../components/Header";
import { useEffect, useState } from "react";
import { useParams } from "react-router";
import { Match } from "../types/Match";
import useApi from "../hooks/useApi";
import Spinner from "../components/Spinner";
import { TicketPrices } from "../types/TicketPrices";
import { PurchaseHistory } from "../types/PurchaseHistory";
import PurchaseDrawer from "@/components/app/PurchaseDrawer";
import PurchaseCard from "@/components/app/PurchaseCard";
import { toast } from "sonner";

const Ticketing = () => {
  // const [showModal, setShowModal] = useState(false);
  const [match, setMatch] = useState<Match | null>(null);
  const [isLoading, setIsLoading] = useState(false);
  const [ticketPrices, setTicketPrices] = useState<TicketPrices | null>(null);
  const [historyData, setHistoryData] = useState<PurchaseHistory[] | null>([]);
  const [isHistoryLoading, setIsHistoryLoading] = useState(false);

  const { fetchData } = useApi();
  const { matchID } = useParams<{ matchID: string }>();

  useEffect(() => {
    const fetchInitialData = async () => {
      try {
        setIsLoading(true);
        const matchData = await fetchData<Match>(`/match/${matchID}`, {
          method: "GET",
        });
        setMatch(matchData);

        if (!matchData) {
          console.error("Failed to fetch match data.");
          setMatch(null);
          setIsLoading(false);
          return;
        }

        const ticketPrices = await fetchData<TicketPrices>("/ticket-prices", {
          method: "GET",
        });
        setTicketPrices(ticketPrices);
      } catch (error) {
        console.error("Error fetching match:", error);
        setMatch(null);
      } finally {
        setIsLoading(false);
      }
    };
    fetchInitialData();
  }, [fetchData, matchID]);

  useEffect(() => {
    if (!match) {
      return;
    }
    const fetchHistory = async () => {
      try {
        setIsHistoryLoading(true);
        const hitory = await fetchData<PurchaseHistory[]>(
          `/purchase/match/${matchID}/all`,
          {
            method: "GET",
          }
        );
        setHistoryData(hitory);
        console.log(hitory);
      } catch (error) {
        console.error("Error fetching purchase history:", error);
      } finally {
        setIsHistoryLoading(false);
      }
    };

    fetchHistory();
  }, [match, fetchData, matchID]);

  useEffect(() => {
    if (match) {
      document.title = `Buldok - ${match.rival} | Buldok Ticketing`;
    } else {
      document.title = "Buldok Ticketing";
    }
  }, [match]);

  const handleUpdateHistory = (newPurchase: PurchaseHistory) => {
    setHistoryData((prev: PurchaseHistory[] | null) => {
      const currentHistory = prev || [];
      // console.log(currentHistory);
      // console.log(newPurchase);
      console.log("new history", [newPurchase, ...currentHistory]);
      return [newPurchase, ...currentHistory];
    });
  };

  const handleDeletePurchase = async (purchaseID: number) => {
    const removedPurchase = historyData?.find((item) => item.id === purchaseID);
    if (confirm(`Opravdu chcete smazat nákup?`)) {
      try {
        setHistoryData((prev) =>
          prev ? prev.filter((item) => item.id !== purchaseID) : null
        );
        await fetchData(`/purchase/${purchaseID}`, {
          method: "DELETE",
        });
        toast.success("Nákup byl úspěšně smazán.");
      } catch (error) {
        console.error("Error deleting purchase:", error);
        setHistoryData((prev) => {
          if (prev) {
            return [...prev, removedPurchase!];
          }
          return null;
        });
      }
    }
  };

  if (isLoading) {
    return (
      <div className="w-full h-full">
        <Header color="bg-emerald-950" />
        <div className="flex flex-col items-center justify-center h-screen">
          <Spinner />
        </div>
      </div>
    );
  }

  if (!match && !isLoading) {
    return (
      <div className="w-full h-full">
        <Header color="bg-emerald-950" />
        <div className="flex flex-col items-center justify-center h-screen">
          <h1 className="text-2xl font-bold">Zápas nenalezen</h1>
          <p className="text-gray-500">Zkontrolujte prosím vaše připojení.</p>
        </div>
      </div>
    );
  }

  return (
    <>
      <div className="w-full">
        <Header />
        <main className="px-4">
          <div className="sticky top-0 bg-white py-3">
            <div className="flex grow-0 flex-row items-center py-1">
              {/* <Link
                to="/app"
                className=" text-gray-500 font-bold my-1 flex flex-row items-center border p-1 pr-2 rounded-md"
              >
                <ArrowLeft /> Zpět
              </Link> */}
              {/* <Link to="/app" className="text-gray-500 my-1 ">
                <Button variant="ghost" className="ml-auto font-bold p-0">
                  <ArrowLeft className="w-7 h-7" />
                </Button>
              </Link> */}
            </div>
            <h1 className="text-xl font-bold">Buldoci - {match?.rival}</h1>
            <p className="text-gray-500 font-bold text-sm">
              {match &&
                new Date(match.playedAt).toLocaleDateString("cs-CZ", {
                  year: "numeric",
                  month: "2-digit",
                  day: "2-digit",
                  hour: "2-digit",
                  minute: "2-digit",
                })}
            </p>
            <p className="text-gray-500 font-bold text-sm mt-5">
              Celkem utrženo
            </p>
            <h3 className="font-bold text-3xl">
              {historyData?.reduce(
                (acc, cur) =>
                  acc +
                  cur.purchaseItems.reduce(
                    (acc, cur) => acc + Number(cur.priceAtPurchase),
                    0
                  ),
                0
              ) || 0}
              {" Kč"}
            </h3>
            {/* <button
              className="w-full font-bold bg-green-200 hover:bg-green-200 rounded-md p-2 mt-5 cursor-pointer"
              onClick={() => setShowModal(true)}
            >
              Zaznamenat nákup
            </button> */}
          </div>
          <PurchaseDrawer
            matchID={matchID}
            ticketPrices={ticketPrices}
            onHistoryUpdate={handleUpdateHistory}
          />
          {/* Modal */}
          {/* {showModal && (
            <PurchaseModal
              onModalToggle={(value) => {
                setShowModal(value);
              }}
              matchID={matchID}
              ticketPrices={ticketPrices}
              onHistoryUpdate={handleUpdateHistory}
            />
          )} */}
          <h4 className="font-semibold text-xl mt-4">Historie nákupů</h4>
          {isHistoryLoading ? (
            <div className="w-full mt-5">
              <Spinner />
            </div>
          ) : historyData?.length === 0 ? (
            <div>
              <p className="text-gray-500 mt-3">
                Zatím nebyly zaznamenány žádné nákupy.
              </p>
            </div>
          ) : (
            <div className="w-full">
              {historyData?.map((purchase) => (
                <PurchaseCard
                  key={purchase.id}
                  purchase={purchase}
                  handleDeletePurchase={handleDeletePurchase}
                />
                // <div
                //   key={purchase.id}
                //   className={`flex flex-row justify-between items-center p-3 rounded-md mb-2 ${
                //     i % 2 === 0 ? "bg-green-50" : "bg-white"
                //   }`}
                // >
                //   <div className="flex flex-col">
                //     <p className="text-2xl font-bold mb-0">
                //       {purchase.purchaseItems.reduce(
                //         (acc, cur) => acc + Number(cur.price_at_purchase),
                //         0
                //       )}{" "}
                //       Kč
                //     </p>
                //     {purchase.purchaseItems.map((item) => (
                //       <span
                //         key={item.id}
                //         className="text-gray-500 text-sm mt-0"
                //       >
                //         {item.quantity}x{" "}
                //         {item.ticket_type.name == "fullTicket"
                //           ? "plná"
                //           : "poloviční"}
                //       </span>
                //     ))}
                //   </div>
                //   {/* <EllipsisVertical className="text-gray-700" /> */}
                //   <XCircle
                //     className="text-red-500 hover:text-red-800 transition ease-in-out cursor-pointer"
                //     onClick={() => handleDeletePurchase(purchase.id as number)}
                //     aria-label="Smazat nákup"
                //   />
                // </div>
              )) || <p>Žádné nákupy</p>}
            </div>
          )}
        </main>
      </div>
    </>
  );
};

export default Ticketing;
