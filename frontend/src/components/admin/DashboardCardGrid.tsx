// import {
//   Cell,
//   Legend,
//   Pie,
//   PieChart,
//   ResponsiveContainer,
//   Tooltip,
// } from "recharts";

// // Define a more generic type for revenue per entrance, if needed, or use an inline object.
// // For simplicity, we'll use inline objects in props.

// interface MatchStatisticsGridProps {
//   // Data related to overall figures
//   totalRevenue: number;
//   totalTicketsSold: number;

//   // Data for full tickets
//   numOfFullTickets: number;
//   fullTicketRevenue: number;

//   // Data for half tickets
//   numOfHalfTickets: number;
//   halfTicketRevenue: number;

//   // Data for entrances
//   uniqueEntranceNames: string[]; // Still useful for listing, or could be derived from revenuePerEntranceData
//   revenuePerEntranceData: { name: string; revenue: number }[];
//   ticketsPerEntranceCountData: { entranceName: string; count: number }[]; // Renamed for clarity

//   // Chart specific
//   pieColors: string[];
// }

// const MatchStatisticsGrid = ({
//   totalRevenue,
//   totalTicketsSold,
//   numOfFullTickets,
//   fullTicketRevenue,
//   numOfHalfTickets,
//   halfTicketRevenue,
//   uniqueEntranceNames, // Or derive from revenuePerEntranceData keys
//   revenuePerEntranceData,
//   ticketsPerEntranceCountData,
//   pieColors,
// }: MatchStatisticsGridProps) => {
//   return (
//     <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-5 gap-4 h-full mt-4">
//       {/* Item 1: Utrženo celkem */}
//       <div className="border border-emerald-800 rounded-md p-4 flex flex-col">
//         <span className="font-black text-3xl">
//           {totalRevenue.toLocaleString("cs-CZ")} Kč
//         </span>
//         <span className="text-xl">Utrženo celkem</span>
//       </div>

//       {/* Item 2: Celkem prodáno lístků */}
//       <div className="md:row-start-2 xl:row-start-auto border border-emerald-800 rounded-md p-4 flex flex-col">
//         <span className="font-black text-3xl">{totalTicketsSold} ks</span>
//         <span className="text-xl">Celkem prodáno lístků</span>
//       </div>

//       {/* Item 3: Celkem plné */}
//       <div className="md:col-start-2 md:row-start-1 xl:col-start-auto xl:row-start-auto border border-emerald-800 rounded-md p-4 flex flex-col">
//         <span className="font-black text-3xl">
//           {numOfFullTickets} ks &bull;{" "}
//           {fullTicketRevenue.toLocaleString("cs-CZ")} Kč
//         </span>
//         <span className="text-xl">Celkem plné</span>
//       </div>

//       {/* Item 4: Celkem poloviční */}
//       <div className="md:col-start-2 md:row-start-2 xl:col-start-auto xl:row-start-auto border border-emerald-800 rounded-md p-4 flex flex-col">
//         <span className="font-black text-3xl">
//           {numOfHalfTickets} ks &bull;{" "}
//           {halfTicketRevenue.toLocaleString("cs-CZ")} Kč
//         </span>
//         <span className="text-xl">Celkem poloviční</span>
//       </div>

//       {/* Item 5: Výdělek za jednotlivé vstupy */}
//       <div className="md:col-span-2 xl:col-span-1 xl:row-span-2 xl:col-start-3 xl:row-start-1 border border-emerald-800 rounded-md p-4 flex flex-col">
//         <span className="font-bold text-xl mb-3">
//           Výdělek za jedotlivé vstupy
//         </span>
//         <div className="space-y-2">
//           {revenuePerEntranceData.map((entranceData) => {
//             return (
//               <div key={entranceData.name} className="flex flex-col">
//                 <span className="text-lg font-semibold">
//                   {entranceData.name}
//                 </span>
//                 <span className="text-base">
//                   {entranceData.revenue.toLocaleString("cs-CZ")} Kč
//                 </span>
//               </div>
//             );
//           })}
//         </div>
//       </div>

//       {/* Item 6: Rozdělení typů vstupenek (Pie Chart) */}
//       <div className="md:col-span-2 md:h-80 xl:h-auto xl:col-span-1 xl:row-span-2 xl:col-start-4 xl:row-start-1 border border-emerald-800 rounded-md p-4 flex flex-col">
//         <span className="text-xl font-bold">Rozdělení typů vstupenek</span>
//         <ResponsiveContainer width="100%" height="100%">
//           <PieChart>
//             <Pie
//               data={[
//                 { name: "Plné", value: numOfFullTickets },
//                 { name: "Poloviční", value: numOfHalfTickets },
//               ]}
//               cx="50%"
//               cy="50%"
//               innerRadius={50}
//               outerRadius={80}
//               dataKey="value"
//               nameKey="name"
//               label={({ percent }) => `${(percent * 100).toFixed(0)} %`}
//             >
//               <Cell key="cell-0" fill={pieColors[0] || "#7ccf01"} />
//               <Cell key="cell-1" fill={pieColors[1] || "#FFBB28"} />
//             </Pie>
//             <Tooltip />
//             <Legend verticalAlign="bottom" height={36} />
//           </PieChart>
//         </ResponsiveContainer>
//       </div>

//       {/* Item 7: Rozdělení vstupů podle prodaných vstupenek (Pie Chart) */}
//       <div className="md:col-span-2 md:h-80 xl:h-auto xl:col-span-1 xl:row-span-2 xl:col-start-5 xl:row-start-1 border border-emerald-800 rounded-md p-4 flex flex-col h-full">
//         <span className="text-xl font-bold">
//           Rozdělení vstupů podle prodaných vstupenek
//         </span>
//         <ResponsiveContainer width="100%" height="100%">
//           <PieChart>
//             <Pie
//               data={ticketsPerEntranceCountData} // Use the renamed prop
//               cx="50%"
//               cy="50%"
//               innerRadius={50}
//               outerRadius={80}
//               fill="#8884d8"
//               dataKey="count" // Assuming 'count' is the key in ticketsPerEntranceCountData
//               nameKey="entranceName" // Assuming 'entranceName' is the key
//               label={({ percent }) => `${(percent * 100).toFixed(0)} %`}
//             >
//               {ticketsPerEntranceCountData.map((_, index) => (
//                 <Cell
//                   key={`cell-entrance-${index}`}
//                   fill={pieColors[index % pieColors.length]}
//                 />
//               ))}
//             </Pie>
//             <Tooltip />
//             <Legend verticalAlign="bottom" height={36} />
//           </PieChart>
//         </ResponsiveContainer>
//       </div>
//     </div>
//   );
// };

// export default MatchStatisticsGrid;
