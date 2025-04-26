import { ArrowRight } from "lucide-react";
import Header from "../components/app/Header";
import { Link } from "react-router";

const UserMatchList = () => {
  return (
    <div>
      <Header />
      <main className="p-4">
        <h1 className="text-2xl font-bold">Mé aktivní zápasy</h1>
        <div className="flex flex-col gap-4 mt-4">
          <Link
            to={`/app/ticketing/${1}`}
            className="flex flex-row items-center justify-between bg-green-50 p-3 rounded-md"
          >
            <div>
              <h3 className="font-bold">Buldok - SK Slavia Praha</h3>
              <p className="text-gray-500 font-bold text-sm">11.5.2025</p>
              <p className="text-gray-500 font-bold text-sm">Vstup 1 - Brana</p>
            </div>
            <ArrowRight />
          </Link>
          <div className="flex flex-row items-center justify-between bg-green-50 p-3 rounded-md">
            <div>
              <h3 className="font-bold">Buldok - MISTR LIGY 2025</h3>
              <p className="text-gray-500 font-bold text-sm">11.5.2025</p>
              <p className="text-gray-500 font-bold text-sm">Vstup 1 - Brana</p>
            </div>
            <ArrowRight />
          </div>
        </div>
      </main>
    </div>
  );
};

export default UserMatchList;
