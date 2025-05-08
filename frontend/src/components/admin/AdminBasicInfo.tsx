import { Dot } from "lucide-react";
import { useEffect, useState } from "react";
import { Legend, Pie, PieChart, ResponsiveContainer } from "recharts";
import useApi from "../../hooks/useApi";
import { LastMatchResponse } from "../../types/LastMatchResponse";
import Spinner from "../Spinner";

const AdminBasicInfo = () => {
  const [currentMatch, setCurrentMatch] = useState<LastMatchResponse | null>(
    null
  );
  const [entrances, setEntrances] = useState<string[]>([]);
  const [numOfFullTickets, setNumOfFullTickets] = useState<number>(0);
  const [numOfHalfTickets, setNumOfHalfTickets] = useState<number>(0);
  const [numOfTickesAtEntrance, setNumOfTicketsAtEntrance] = useState<
    | {
        entrance: string;
        number: number;
      }[]
    | null
  >(null);

  const { fetchData, isLoading } = useApi();

  useEffect(() => {
    const fetchLatestMatch = async () => {
      try {
        const response = await fetchData<LastMatchResponse | null>(
          "/admin/matches/last-active-match",
          {
            method: "GET",
          }
        );
        if (response) {
          setCurrentMatch(response);
        }

        console.log(response);
        // Add each entrance name to the state from the response uniqely
        let allEntranceNames: string[] = [];
        allEntranceNames = response?.purchases.map((purchase) => {
          return allEntranceNames?.find(
            (entrance: string) => entrance == purchase.entrance.name
          )
            ? null
            : purchase.entrance.name;
        });
        const uniqueNames: string[] = Array.from(new Set(allEntranceNames));
        setEntrances(uniqueNames);

        setNumOfFullTickets(
          Number(
            response?.purchases.reduce((acc, purchase) => {
              return (
                acc +
                Number(
                  purchase.purchaseItems.reduce((acc, item) => {
                    if (item.ticket_type.name == "fullTicket") {
                      return acc + Number(item.quantity);
                    }

                    return acc;
                  }, 0)
                )
              );
            }, 0)
          )
        );
        setNumOfHalfTickets(
          Number(
            response?.purchases.reduce((acc, purchase) => {
              return (
                acc +
                Number(
                  purchase.purchaseItems.reduce((acc, item) => {
                    if (item.ticket_type.name == "halfTicket") {
                      return acc + Number(item.quantity);
                    }

                    return acc;
                  }, 0)
                )
              );
            }, 0)
          )
        );
      } catch (error) {
        console.error("Error fetching latest match:", error);
      }
    };
    fetchLatestMatch();
  }, [fetchData]);

  useEffect(() => {
    if (entrances) {
      entrances.forEach((entrance) => {
        const entranceTickets = Number(
          currentMatch?.purchases.reduce((acc, purchase) => {
            if (purchase.entrance.name == entrance) {
              return (
                acc +
                Number(
                  purchase.purchaseItems.reduce((acc, item) => {
                    return acc + Number(item.quantity);
                  }, 0)
                )
              );
            }

            return acc;
          }, 0)
        );
        setNumOfTicketsAtEntrance((prev) => {
          if (prev) {
            console.log([
              ...prev,
              { entrance: entrance, number: entranceTickets },
            ]);
            return [...prev, { entrance: entrance, number: entranceTickets }];
          } else {
            console.log([{ entrance: entrance, number: entranceTickets }]);
            return [{ entrance: entrance, number: entranceTickets }];
          }
        });
      });
    }
  }, [entrances, currentMatch?.purchases]);

  if (isLoading) {
    return (
      <div className="flex justify-center items-center h-full w-full">
        <Spinner />
      </div>
    );
  }

  return (
    <>
      <div className="flex flex-col gap-4 w-full">
        <div className="bg-white rounded-md p-4 h-1/2 flex flex-col">
          <div className="card-header w-full">
            <h2 className="text-3xl font-bold">Aktuální zápas</h2>
            <h3 className="flex text-xl">
              {currentMatch?.rival} &bull;{" "}
              {currentMatch?.played_at &&
                new Date(currentMatch?.played_at).toLocaleDateString("cs-CZ", {
                  year: "numeric",
                  month: "2-digit",
                  day: "2-digit",
                  hour: "2-digit",
                  minute: "2-digit",
                })}
            </h3>
          </div>

          <div className="grid grid-cols-5 grid-rows-2 gap-3 h-full mt-4">
            <div className="border border-emerald-800 rounded-md p-4 flex flex-col">
              <span className="font-black text-3xl">
                {currentMatch?.purchases.reduce((acc, purchase) => {
                  return (
                    acc +
                    Number(
                      purchase.purchaseItems.reduce((acc, item) => {
                        return acc + Number(item.price_at_purchase);
                      }, 0)
                    )
                  );
                }, 0)}{" "}
                Kč
              </span>
              <span className="text-xl">Utrženo celkem</span>
            </div>
            <div className="col-start-1 row-start-2 border border-emerald-800 rounded-md p-4 flex flex-col">
              <span className="font-black text-3xl">
                {numOfFullTickets + numOfHalfTickets}
                {" ks"}
              </span>
              <span className="text-xl">Celkem prodáno lístků</span>
            </div>
            <div className="col-start-2 row-start-1 border border-emerald-800 rounded-md p-4 flex flex-col">
              <span className="font-black text-3xl">
                {numOfFullTickets} ks &bull;{" "}
                {currentMatch?.purchases.reduce((acc, purchase) => {
                  return (
                    acc +
                    Number(
                      purchase.purchaseItems.reduce((acc, item) => {
                        if (item.ticket_type.name == "fullTicket") {
                          return acc + Number(item.price_at_purchase);
                        }

                        return acc;
                      }, 0)
                    )
                  );
                }, 0)}{" "}
                {" Kč"}
              </span>
              <span className="text-xl">Celkem plné</span>
            </div>
            <div className="col-start-2 row-start-2 border border-emerald-800 rounded-md p-4 flex flex-col">
              <span className="font-black text-3xl">
                {numOfHalfTickets} ks &bull;{" "}
                {currentMatch?.purchases.reduce((acc, purchase) => {
                  return (
                    acc +
                    Number(
                      purchase.purchaseItems.reduce((acc, item) => {
                        if (item.ticket_type.name == "halfTicket") {
                          return acc + Number(item.price_at_purchase);
                        }

                        return acc;
                      }, 0)
                    )
                  );
                }, 0)}{" "}
                {" Kč"}
              </span>
              <span className="text-xl">Celkem poloviční</span>
            </div>
            <div className="row-span-2 col-start-3 row-start-1 border border-emerald-800 rounded-md p-4 flex flex-col">
              <span className="font-bold text-lg">
                Výdělek za jedotlivé vstupy
              </span>
              <span className="">
                {entrances.map((entrance: string) => {
                  return (
                    <div key={entrance} className="flex flex-col">
                      <span className="text-xl font-black">{entrance}</span>
                      <span className="text-lg">
                        {currentMatch?.purchases.reduce((acc, purchase) => {
                          if (purchase.entrance.name == entrance) {
                            return (
                              acc +
                              Number(
                                purchase.purchaseItems.reduce((acc, item) => {
                                  return acc + Number(item.price_at_purchase);
                                }, 0)
                              )
                            );
                          }

                          return acc;
                        }, 0)}{" "}
                        {" Kč"}
                      </span>
                    </div>
                  );
                })}
              </span>
            </div>
            <div className="row-span-2 col-start-4 row-start-1 border border-emerald-800 rounded-md p-4 flex flex-col">
              <span className="text-xl">Rozdělení typů vstupenek</span>
              <ResponsiveContainer width="100%" height="100%">
                <PieChart>
                  <Pie
                    data={[
                      {
                        name: "Plné",
                        value: numOfFullTickets,
                        fill: "#82ca9d",
                      },
                      {
                        name: "Poloviční",
                        value: numOfHalfTickets,
                        fill: "#8884d8",
                      },
                    ]}
                    cx="50%"
                    cy="50%"
                    innerRadius={40}
                    outerRadius={60}
                    dataKey="value"
                    label={({ name, value }) => {
                      return `${name} - ${value}`;
                    }}
                  ></Pie>
                </PieChart>
              </ResponsiveContainer>
            </div>
            <div className="row-span-2 col-start-5 row-start-1 border border-emerald-800 rounded-md p-4 flex flex-col">
              <span className="text-xl">
                Rozdělení vstupů podle prodaných vstupenek
              </span>
              <ResponsiveContainer width="100%" height="100%">
                <PieChart>
                  <Pie
                    data={[
                      {
                        name: "Prodáno",
                        value: numOfFullTickets,
                        fill: "#82ca9d",
                      },
                      { name: "Zbývá", value: 200 },
                    ]}
                    cx="50%"
                    cy="50%"
                    innerRadius={40}
                    outerRadius={60}
                    fill="#8884d8"
                    dataKey="value"
                    label
                  />
                </PieChart>
              </ResponsiveContainer>
            </div>
          </div>
        </div>

        <div className="bg-white rounded-md p-4 h-1/2">
          <h2 className="text-xl font-bold">Aktuální zápas</h2>
          <h3 className="flex text-lg">
            SK Slavia Praha <Dot /> 27.5.2025 17:30
          </h3>
          <div>Prodáno lístků 100</div>
          <div>Utrženo celkem 1000 Kč</div>
        </div>
      </div>
    </>
  );
};

export default AdminBasicInfo;
