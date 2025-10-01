import { useEffect, useState } from "react";
import useApi from "../../hooks/useApi";
import Spinner from "../Spinner";
import { Match } from "@/types/Match";
import ContentBoard from "./ContentBoard";
import { Card, CardHeader, CardTitle } from "../ui/card";
import { ArrowRight, Dot } from "lucide-react";
import { Link } from "react-router";
import { useQuery } from "@tanstack/react-query";

// const PIE_COLORS = ["#7ccf01", "#FFBB28", "#A28DFF", "#FF82B3"];

const AdminBasicInfo = () => {
  // const [currentMatch, setCurrentMatch] = useState<Match | null>(null);
  // const [uniqueEntranceNames, setUniqueEntranceNames] = useState<string[]>([]);
  // const [numOfFullTickets, setNumOfFullTickets] = useState<number>(0);
  // const [numOfHalfTickets, setNumOfHalfTickets] = useState<number>(0);
  // const [ticketsPerEntrance, setTicketsPerEntrance] = useState<
  //   { entranceName: string; count: number }[]
  // >([]);

  const { fetchData } = useApi();

  const { data: latestMatch } = useQuery<Match | null>({
    queryKey: ["last-active-match"],
    queryFn: () =>
      fetchData<Match | null>("/admin/matches/last-active-match", {
        method: "GET",
      }),
  });

  // useEffect(() => {
  //   const fetchLatestMatch = async () => {
  //     try {
  //       const response = await fetchData<Match | null>(
  //         "/admin/matches/last-active-match",
  //         {
  //           method: "GET",
  //         }
  //       );
  //       if (response) {
  //         setCurrentMatch(response);
  //         console.log(response);
  //       }
  //     } catch (error) {
  //       console.error("Error fetching latest match:", error);
  //     }
  //   };
  //   fetchLatestMatch();
  // }, [fetchData]);

  // useEffect(() => {
  //   if (currentMatch?.purchases) {
  //     const allPurchaseEntranceNames = currentMatch.purchases
  //       .map((purchase) => purchase.entrance?.name)
  //       .filter(
  //         (name): name is string =>
  //           typeof name === "string" && name.trim() !== ""
  //       );
  //     const uniqueNames = Array.from(new Set(allPurchaseEntranceNames));
  //     setUniqueEntranceNames(uniqueNames);

  //     const fullTickets = currentMatch.purchases.reduce(
  //       (acc, purchase) =>
  //         acc +
  //         purchase.purchaseItems.reduce(
  //           (itemAcc, item) =>
  //             item.ticketType.name === "fullTicket"
  //               ? itemAcc + Number(item.quantity)
  //               : itemAcc,
  //           0
  //         ),
  //       0
  //     );
  //     setNumOfFullTickets(fullTickets);

  //     const halfTickets = currentMatch.purchases.reduce(
  //       (acc, purchase) =>
  //         acc +
  //         purchase.purchaseItems.reduce(
  //           (itemAcc, item) =>
  //             item.ticketType.name === "halfTicket"
  //               ? itemAcc + Number(item.quantity)
  //               : itemAcc,
  //           0
  //         ),
  //       0
  //     );
  //     setNumOfHalfTickets(halfTickets);
  //   } else {
  //     setUniqueEntranceNames([]);
  //     setNumOfFullTickets(0);
  //     setNumOfHalfTickets(0);
  //   }
  // }, [currentMatch]);

  // useEffect(() => {
  //   if (currentMatch?.purchases && uniqueEntranceNames.length > 0) {
  //     const calculatedData = uniqueEntranceNames.map((name) => {
  //       const ticketsForThisEntrance = currentMatch.purchases
  //         .filter((purchase) => purchase.entrance?.name === name)
  //         .reduce((totalTicketsInEntrance, purchase) => {
  //           const ticketsInThisSpecificPurchase = purchase.purchaseItems.reduce(
  //             (itemSum, item) => itemSum + Number(item.quantity),
  //             0
  //           );
  //           return totalTicketsInEntrance + ticketsInThisSpecificPurchase;
  //         }, 0);
  //       return { entranceName: name, count: ticketsForThisEntrance };
  //     });
  //     setTicketsPerEntrance(calculatedData);
  //   } else {
  //     setTicketsPerEntrance([]);
  //   }
  // }, [currentMatch, uniqueEntranceNames]);

  // if (isLoading) {
  //   return (
  //     <div className="flex justify-center items-center h-full w-full">
  //       <Spinner />
  //     </div>
  //   );
  // }

  return (
    <>
      <ContentBoard>
        {latestMatch && (
          <Link to={`/admin/matches/${latestMatch.id}/stats`}>
            <Card className="bg-green-100 m-0 py-0 pt-2 hover:bg-green-200 transition-colors cursor-pointer">
              <CardHeader className="py">
                <CardTitle className="text-md text-green-800 hover:text-green-900 p-0 m-0 hover:underline flex items-center gap-2">
                  <Dot className="inline mb-1 mr-2 animate-ping" size={30} />
                  <span>Právě se hraje zápas proti {latestMatch.rival}</span>
                  <ArrowRight />
                </CardTitle>
              </CardHeader>
            </Card>
          </Link>
        )}
      </ContentBoard>
      {/* <div className="flex flex-col gap-4 w-full h-screen">
        {currentMatch ? (
          <div className="bg-white rounded-md p-4 flex flex-col shadow-md xl:h-1/2">
            <div className="card-header w-full">
              <h2 className="text-3xl font-bold">Aktuální zápas</h2>
              <h3 className="flex text-xl flex-wrap">
                {currentMatch?.rival} &bull;{" "}
                {currentMatch?.playedAt &&
                  new Date(currentMatch?.playedAt).toLocaleDateString("cs-CZ", {
                    year: "numeric",
                    month: "2-digit",
                    day: "2-digit",
                    hour: "2-digit",
                    minute: "2-digit",
                  })}
              </h3>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-5 gap-4 h-full mt-4">
              <div className="border border-emerald-800 rounded-md p-4 flex flex-col">
                <span className="font-black text-3xl">
                  {currentMatch?.purchases
                    .reduce((acc, purchase) => {
                      return (
                        acc +
                        Number(
                          purchase.purchaseItems.reduce((acc, item) => {
                            return acc + Number(item.priceAtPurchase);
                          }, 0)
                        )
                      );
                    }, 0)
                    .toLocaleString("cs-CZ")}{" "}
                  Kč
                </span>
                <span className="text-xl">Utrženo celkem</span>
              </div>

              <div className="md:row-start-2 xl:row-start-auto border border-emerald-800 rounded-md p-4 flex flex-col">
                <span className="font-black text-3xl">
                  {numOfFullTickets + numOfHalfTickets}
                  {" ks"}
                </span>
                <span className="text-xl">Celkem prodáno lístků</span>
              </div>

              <div className="md:col-start-2 md:row-start-1 xl:col-start-auto xl:row-start-auto border border-emerald-800 rounded-md p-4 flex flex-col">
                <span className="font-black text-3xl">
                  {numOfFullTickets} ks &bull;{" "}
                  {currentMatch?.purchases
                    .reduce((acc, purchase) => {
                      return (
                        acc +
                        Number(
                          purchase.purchaseItems.reduce((acc, item) => {
                            if (item.ticketType.name == "fullTicket") {
                              return acc + Number(item.priceAtPurchase);
                            }

                            return acc;
                          }, 0)
                        )
                      );
                    }, 0)
                    .toLocaleString("cs-CZ")}{" "}
                  {" Kč"}
                </span>
                <span className="text-xl">Celkem plné</span>
              </div>

              <div className="md:col-start-2 md:row-start-2 xl:col-start-auto xl:row-start-auto border border-emerald-800 rounded-md p-4 flex flex-col">
                <span className="font-black text-3xl">
                  {numOfHalfTickets} ks &bull;{" "}
                  {currentMatch?.purchases
                    .reduce((acc, purchase) => {
                      return (
                        acc +
                        Number(
                          purchase.purchaseItems.reduce((acc, item) => {
                            if (item.ticketType.name == "halfTicket") {
                              return acc + Number(item.priceAtPurchase);
                            }

                            return acc;
                          }, 0)
                        )
                      );
                    }, 0)
                    .toLocaleString("cs-CZ")}{" "}
                  {" Kč"}
                </span>
                <span className="text-xl">Celkem poloviční</span>
              </div>

              <div className="md:col-span-2 xl:col-span-1 xl:row-span-2 xl:col-start-3 xl:row-start-1 border border-emerald-800 rounded-md p-4 flex flex-col">
                <span className="font-bold text-xl mb-3">
                  Výdělek za jedotlivé vstupy
                </span>
                <span className="">
                  {uniqueEntranceNames.map((entrance: string) => {
                    return (
                      <div key={entrance} className="flex flex-col">
                        <span className="text-xl font-black">{entrance}</span>
                        <span className="text-lg">
                          {currentMatch?.purchases
                            .reduce((acc, purchase) => {
                              if (purchase.entrance.name == entrance) {
                                return (
                                  acc +
                                  Number(
                                    purchase.purchaseItems.reduce(
                                      (acc, item) => {
                                        return (
                                          acc + Number(item.priceAtPurchase)
                                        );
                                      },
                                      0
                                    )
                                  )
                                );
                              }

                              return acc;
                            }, 0)
                            .toLocaleString("cs-CZ")}{" "}
                          {" Kč"}
                        </span>
                      </div>
                    );
                  })}
                </span>
              </div>

              <div className="md:col-span-2 md:h-80 xl:h-auto xl:col-span-1 xl:row-span-2 xl:col-start-4 xl:row-start-1 border border-emerald-800 rounded-md p-4 flex flex-col">
                <span className="text-xl font-bold">
                  Rozdělení typů vstupenek
                </span>
                <ResponsiveContainer width="100%" height="100%">
                  <PieChart>
                    <Pie
                      data={[
                        {
                          name: "Plné",
                          value: numOfFullTickets,
                        },
                        {
                          name: "Poloviční",
                          value: numOfHalfTickets,
                        },
                      ]}
                      cx="50%"
                      cy="50%"
                      innerRadius={50}
                      outerRadius={80}
                      dataKey="value"
                      label={({ percent }) => `${(percent * 100).toFixed(0)} %`}
                    >
                      <Cell key="cell-0" fill="#7ccf01" />
                      <Cell key="cell-1" fill="#FFBB28" />
                    </Pie>
                    <Tooltip />
                    <Legend verticalAlign="bottom" height={36} />
                  </PieChart>
                </ResponsiveContainer>
              </div>
              <div className="md:col-span-2 md:h-80 xl:h-auto xl:col-span-1 xl:row-span-2 xl:col-start-5 xl:row-start-1 border border-emerald-800 rounded-md p-4 flex flex-col h-full">
                <span className="text-xl font-bold">
                  Rozdělení vstupů podle prodaných vstupenek
                </span>
                <ResponsiveContainer width="100%" height="100%">
                  <PieChart>
                    <Pie
                      data={ticketsPerEntrance}
                      cx="50%"
                      cy="50%"
                      innerRadius={50}
                      outerRadius={80}
                      fill="#8884d8"
                      dataKey="count"
                      nameKey="entranceName"
                    >
                      {ticketsPerEntrance.map((_, index) => (
                        <Cell
                          key={`cell-entrance-${index}`}
                          fill={PIE_COLORS[index % PIE_COLORS.length]}
                        />
                      ))}
                    </Pie>
                    <Tooltip />
                    <Legend verticalAlign="bottom" height={36} />
                  </PieChart>
                </ResponsiveContainer>
              </div>
            </div>
          </div>
        ) : (
          <div className="bg-white rounded-md p-4 flex flex-col shadow-md xl:h-1/2">
            <div className="card-header w-full">
              <h2 className="text-3xl font-bold">Aktuální zápas</h2>
              <h3 className="flex text-xl flex-wrap">
                Žádný zápas momentálně není aktivní
              </h3>
            </div>
          </div>
        )}

        {/* <div className="bg-white rounded-md p-4 flex flex-col shadow-md h-1/2">
          <div className="card-header w-full">
            <h2 className="text-3xl font-bold">Aktuální sezóna</h2>
          </div>
        </div> 
      </div> */}
    </>
  );
};

export default AdminBasicInfo;
