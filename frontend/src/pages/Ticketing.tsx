import { EllipsisVertical } from "lucide-react";
import Header from "../components/app/Header";

const Ticketing = () => {
  return (
    <>
      <div className="w-full">
        <Header />
        <main className="p-4">
          <div className="sticky top-0 bg-white py-3">
            <h1 className="text-xl font-bold">Buldoci - SK Slavia Praha</h1>
            <p className="text-gray-500 font-bold text-sm">11.5.2025</p>
            <p className="text-gray-500 font-bold text-sm mt-5">
              Vstup 1 - Brana
            </p>
            <h3 className="font-bold text-3xl">350 Kc</h3>
            <button className="w-full font-bold bg-green-200 hover:bg-green-200 rounded-md p-2 mt-5">
              Zaznamenat nákup
            </button>
          </div>
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
