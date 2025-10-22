import Header from "../components/Header";
import { useEffect, useState } from "react";
import { useParams } from "react-router";
import { Match } from "../types/Match";
import useApi from "../hooks/useApi";
import Spinner from "../components/Spinner";
import { TicketPrices } from "../types/TicketPrices";
import PurchaseDrawer from "@/components/app/PurchaseDrawer";
import PurchaseCard from "@/components/app/PurchaseCard";
import { useQuery, useQueryClient } from "@tanstack/react-query";
import { ApiError } from "@/types/ApiError";
import MatchError from "../components/errors/MatchError";
import { toast } from "sonner";
import { PaymentStateMap } from "@/types/PaymentStateMap";

function beepSuccess() {
  const snd = new Audio("/pay-success.mp3");
  snd.play();
}

function beepFail() {
  const snd = new Audio("/pay-fail.mp3");
  snd.play();
}

const Ticketing = () => {
  const { fetchData } = useApi();
  const { matchID } = useParams<{ matchID: string }>();

  const [paymentStates, setPaymentStates] = useState<PaymentStateMap>({});

  const {
    data: match,
    isPending: isMatchDataLoading,
    isError: isMatchDataError,
    error: matchError,
  } = useQuery<Match, ApiError>({
    queryKey: ["match", matchID],
    queryFn: () =>
      fetchData<Match>(`/matches/${matchID}/stats?userEntranceLimit=1`, {
        method: "GET",
      }),
    enabled: !!matchID,
    retry: false,
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

  const queryClient = useQueryClient();

  useEffect(() => {
    const pending = Object.keys(paymentStates).filter(
      (vs) => paymentStates[vs].status === "pending"
    );

    if (pending.length === 0) {
      return;
    }
    // console.log("Setting up Mercure connections for:", pending);

    const eventSources: EventSource[] = [];

    const connectToMercure = async (vs: string) => {
      try {
        const isAuthEnabled =
          import.meta.env.VITE_MERCURE_AUTH_ENABLED === "true";
        if (isAuthEnabled) {
          await fetchData("/mercure/token", {
            method: "POST",
            body: JSON.stringify({ paymentId: vs }),
          });
        }

        const hubUrl = new URL(import.meta.env.VITE_MERCURE_PUBLIC_URL);
        const topic = `https://buldok.app/payments/${vs}`;
        hubUrl.searchParams.append("topic", topic);

        const eventSource = new EventSource(hubUrl.toString(), {
          withCredentials: isAuthEnabled,
        });

        eventSource.onmessage = (event) => {
          const data = JSON.parse(event.data);
          console.log("Mercure message:", data);
          if (data.status === "completed") {
            toast.success(`Platba pro VS ${vs} byla přijata!`);
            beepSuccess();
            setPaymentStates((prev) => ({
              ...prev,
              [vs]: { status: "paid" },
            }));
            queryClient.invalidateQueries({ queryKey: ["match", matchID] });
            eventSource.close();
          } else if (data.status === "failed") {
            queryClient.invalidateQueries({ queryKey: ["match", matchID] });
            beepFail();
            if (data.reason === "amount_mismatch") {
              toast.error("Platba selhala. Nesouhlasí částka platby.");
              setPaymentStates((prev) => ({
                ...prev,
                [vs]: {
                  status: "failed",
                  message: "Nesouhlasí částka platby.",
                },
              }));
            } else {
              setPaymentStates((prev) => ({
                ...prev,
                [vs]: { status: "failed", message: "Zkuste to prosím znovu." },
              }));
              toast.error("Platba selhala. Zkuste to prosím znovu.");
            }
          }
        };

        eventSource.onerror = () => {
          eventSource.close();
        };

        eventSources.push(eventSource);
      } catch (error) {
        console.error("Mercure connection failed:", error);
      }
    };

    pending.forEach((vs) => connectToMercure(vs));

    return () => {
      eventSources.forEach((es) => es.close());
    };
  }, [queryClient, matchID, fetchData, paymentStates]);

  const handleNewQrPayment = (vs: string) => {
    setPaymentStates((prev) => ({ ...prev, [vs]: { status: "pending" } }));
  };

  if (isMatchDataLoading) {
    return (
      <div className="w-full h-full">
        <Header />
        <div className="flex flex-col items-center justify-center h-screen">
          <Spinner />
        </div>
      </div>
    );
  }

  if (isMatchDataError) {
    return (
      <div className="w-full h-min-screen">
        <Header />
        <MatchError error={matchError!} matchID={matchID!} />
      </div>
    );
  }

  return (
    <div className="min-h-screen">
      <Header />
      <div className="w-full lg:max-w-2/5 mx-auto">
        <main className="">
          <div className="sticky top-0 bg-white py-3 px-4">
            <div className="flex grow-0 flex-row items-center py-1"></div>
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
          {ticketPrices && (
            <PurchaseDrawer
              matchID={matchID}
              ticketPrices={ticketPrices}
              onNewQrPayment={handleNewQrPayment}
              paymentStates={paymentStates}
            />
          )}
          <h4 className="font-semibold text-xl mt-4 mx-4">Historie nákupů</h4>
          {!match?.purchases ? (
            <div className="w-full mt-5">
              <Spinner />
            </div>
          ) : match?.purchases?.length === 0 ? (
            <div>
              <p className="text-gray-500 mt-3 mx-4">
                Zatím nebyly zaznamenány žádné nákupy.
              </p>
            </div>
          ) : (
            <div className="w-full px-4">
              {match?.purchases
                .map((purchase) => (
                  <PurchaseCard
                    key={purchase.id}
                    purchase={purchase}
                    livePaymentState={
                      paymentStates[purchase.payment?.variableSymbol as string]
                    }
                  />
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
