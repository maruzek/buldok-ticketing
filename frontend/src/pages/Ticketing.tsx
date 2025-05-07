import { ArrowLeft, EllipsisVertical } from "lucide-react";
import Header from "../components/app/Header";
import { useEffect, useState } from "react";
import PurchaseModal from "../components/app/PurchaseModal";
import { Link } from "react-router";
import { Match } from "../types/Match";
import useApi from "../hooks/useApi";
import useAuth from "../hooks/useAuth";

const Ticketing = () => {
  const [showModal, setShowModal] = useState(false);
  const [match, setMatch] = useState<Match | null>(null);
  const [isLoading, setIsLoading] = useState(false);

  const { fetchData } = useApi();
  const { auth } = useAuth();

  useEffect(() => {
    const fetchMatch = async () => {
      try {
        setIsLoading(true);
        const data = await fetchData<Match>("/match/1", {
          method: "GET",
        });
        setMatch(data);
        console.log(data);
      } catch (error) {
        console.error("Error fetching match:", error);
      } finally {
        setIsLoading(false);
      }
    };
    console.log(auth);
    fetchMatch();
  }, [fetchData, auth]);

  if (!match && !isLoading) {
    return (
      <div className="flex flex-col items-center justify-center h-screen">
        <h1 className="text-2xl font-bold">Zápas nenalezen</h1>
        <p className="text-gray-500">Zkontrolujte prosím vaše připojení.</p>
      </div>
    );
  }

  return (
    <>
      <div className="w-full">
        <Header />
        <main className="px-4">
          <div className="sticky top-0 bg-white py-3">
            <Link
              to="/app"
              className="flex grow-0 flex-row items-center text-gray-500 font-bold my-1 "
            >
              <span className="flex flex-row items-center border p-1 pr-2 rounded-md">
                <ArrowLeft /> Zpět
              </span>
            </Link>
            <h1 className="text-xl font-bold">Buldoci - {match?.rival}</h1>
            <p className="text-gray-500 font-bold text-sm">
              {new Date(match?.playedAt.date).toLocaleDateString("cs-CZ", {
                year: "numeric",
                month: "2-digit",
                day: "2-digit",
                hour: "2-digit",
                minute: "2-digit",
              })}
            </p>
            <p className="text-gray-500 font-bold text-sm mt-5">
              {auth.user?.entrance?.name}
            </p>
            <h3 className="font-bold text-3xl">350 Kc</h3>
            <button
              className="w-full font-bold bg-green-200 hover:bg-green-200 rounded-md p-2 mt-5 cursor-pointer"
              onClick={() => setShowModal(true)}
            >
              Zaznamenat nákup
            </button>
          </div>
          {/* Modal */}
          {showModal && (
            <PurchaseModal
              onModalToggle={(value) => {
                setShowModal(value);
              }}
            />
          )}
          <h4 className="font-semibold text-xl mt-4">Historie nákupů</h4>
          <div className="w-full">
            <div className="flex flex-row justify-between items-center p-3 rounded-md">
              <div className="flex flex-col">
                <p className="text-2xl font-bold mb-0">200 Kč</p>
                <span className="text-gray-500 text-sm mt-0">2x plná</span>
                <span className="text-gray-500 text-sm mt-0">2x poloviční</span>
              </div>
              <EllipsisVertical className="text-gray-700" />
            </div>
            <div className="flex flex-row justify-between items-center bg-green-50 p-3 rounded-md">
              <div className="flex flex-col">
                <p className="text-2xl font-bold mb-0">200 Kč</p>
                <span className="text-gray-500 text-sm mt-0">2x plná</span>
                <span className="text-gray-500 text-sm mt-0">2x poloviční</span>
              </div>
              <EllipsisVertical className="text-gray-700" />
            </div>
            <div className="flex flex-row justify-between items-center p-3 rounded-md">
              <div className="flex flex-col">
                <p className="text-2xl font-bold mb-0">200 Kč</p>
                <span className="text-gray-500 text-sm mt-0">2x plná</span>
                <span className="text-gray-500 text-sm mt-0">2x poloviční</span>
              </div>
              <EllipsisVertical className="text-gray-700" />
            </div>
            <div className="flex flex-row justify-between items-center bg-green-50 p-3 rounded-md">
              <div className="flex flex-col">
                <p className="text-2xl font-bold mb-0">200 Kč</p>
                <span className="text-gray-500 text-sm mt-0">2x plná</span>
                <span className="text-gray-500 text-sm mt-0">2x poloviční</span>
              </div>
              <EllipsisVertical className="text-gray-700" />
            </div>
            <div className="flex flex-row justify-between items-center bg-green-50 p-3 rounded-md">
              <div className="flex flex-col">
                <p className="text-2xl font-bold mb-0">200 Kč</p>
                <span className="text-gray-500 text-sm mt-0">2x plná</span>
                <span className="text-gray-500 text-sm mt-0">2x poloviční</span>
              </div>
              <EllipsisVertical className="text-gray-700" />
            </div>
            <div className="flex flex-row justify-between items-center bg-green-50 p-3 rounded-md">
              <div className="flex flex-col">
                <p className="text-2xl font-bold mb-0">200 Kč</p>
                <span className="text-gray-500 text-sm mt-0">2x plná</span>
                <span className="text-gray-500 text-sm mt-0">2x poloviční</span>
              </div>
              <EllipsisVertical className="text-gray-700" />
            </div>
            <div className="flex flex-row justify-between items-center bg-green-50 p-3 rounded-md">
              <div className="flex flex-col">
                <p className="text-2xl font-bold mb-0">200 Kč</p>
                <span className="text-gray-500 text-sm mt-0">2x plná</span>
                <span className="text-gray-500 text-sm mt-0">2x poloviční</span>
              </div>
              <EllipsisVertical className="text-gray-700" />
            </div>
            <div className="flex flex-row justify-between items-center bg-green-50 p-3 rounded-md">
              <div className="flex flex-col">
                <p className="text-2xl font-bold mb-0">200 Kč</p>
                <span className="text-gray-500 text-sm mt-0">2x plná</span>
                <span className="text-gray-500 text-sm mt-0">2x poloviční</span>
              </div>
              <EllipsisVertical className="text-gray-700" />
            </div>
          </div>
        </main>
      </div>
    </>
  );
};

export default Ticketing;
