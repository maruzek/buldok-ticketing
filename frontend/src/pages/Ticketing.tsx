import Header from "../components/Header";
import { useEffect } from "react";
import { useParams } from "react-router";
import { Match } from "../types/Match";
import useApi from "../hooks/useApi";
import Spinner from "../components/Spinner";
import { TicketPrices } from "../types/TicketPrices";
import PurchaseDrawer from "@/components/app/PurchaseDrawer";
import PurchaseCard from "@/components/app/PurchaseCard";
import { useQuery } from "@tanstack/react-query";

const Ticketing = () => {
  const { fetchData } = useApi();
  const { matchID } = useParams<{ matchID: string }>();

  const { data: match, isPending: isMatchDataLoading } = useQuery<Match>({
    queryKey: ["match", matchID],
    queryFn: () =>
      fetchData<Match>(`/matches/${matchID}/stats?userEntranceLimit=1`, {
        method: "GET",
      }),
    enabled: !!matchID,
  });

  const { data: ticketPrices } = useQuery<TicketPrices>({
    queryKey: ["ticket-prices"],
    queryFn: () => fetchData<TicketPrices>("/ticket-prices", { method: "GET" }),
  });

  useEffect(() => {
    if (match) {
      document.title = `Buldok - ${match.rival} | Buldok Ticketing`;
    } else {
      document.title = "Buldok Ticketing";
    }
  }, [match]);

  if (isMatchDataLoading) {
    return (
      <div className="w-full h-full">
        <Header color="bg-emerald-950" />
        <div className="flex flex-col items-center justify-center h-screen">
          <Spinner />
        </div>
      </div>
    );
  }

  if (!match && !isMatchDataLoading) {
    return (
      <div className="w-full h-full">
        <Header />
        <div className="flex flex-col items-center justify-center h-screen">
          <h1 className="text-2xl font-bold">Zápas nenalezen</h1>
          <p className="text-gray-500">Zkontrolujte prosím vaše připojení.</p>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen">
      <Header />
      <div className="w-full lg:max-w-2/5 mx-auto">
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
              {match?.purchases?.reduce(
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
          </div>
          {/* TODO: skeleton button while loading ticket prices */}
          {ticketPrices && (
            <PurchaseDrawer matchID={matchID} ticketPrices={ticketPrices} />
          )}
          <h4 className="font-semibold text-xl mt-4">Historie nákupů</h4>
          {!match?.purchases ? (
            <div className="w-full mt-5">
              <Spinner />
            </div>
          ) : match?.purchases?.length === 0 ? (
            <div>
              <p className="text-gray-500 mt-3">
                Zatím nebyly zaznamenány žádné nákupy.
              </p>
            </div>
          ) : (
            <div className="w-full">
              {match?.purchases
                .map((purchase) => (
                  <PurchaseCard key={purchase.id} purchase={purchase} />
                ))
                .reverse() || <p>Žádné nákupy</p>}
            </div>
          )}
        </main>
      </div>
    </div>
  );
};

export default Ticketing;
