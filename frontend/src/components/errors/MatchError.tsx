import { ApiError } from "@/types/ApiError";
import { Frown, ShieldBan, ShieldCheck, TriangleAlert } from "lucide-react";

const error = ({ error, matchID }: { error: ApiError; matchID: string }) => {
  if (error?.status === 404) {
    return (
      <div className="w-full h-full">
        <div className="flex flex-col items-center justify-center h-screen">
          <h1 className="text-2xl font-bold flex items-center gap-2">
            Zápas nenalezen <Frown />
          </h1>
          <p className="mt-2">Zápas s ID {matchID} nebyl nalezen.</p>
        </div>
      </div>
    );
  } else if (error?.status === 403) {
    return (
      <div className="w-full h-full">
        <div className="flex flex-col items-center justify-center h-screen">
          <h1 className="text-2xl font-bold flex items-center gap-2">
            Přístup odepřen <ShieldBan />
          </h1>
          <p className="mt-2">Nemáte oprávnění upravovat tento zápas.</p>
        </div>
      </div>
    );
  } else if (error?.status === 400) {
    return (
      <div className="w-full h-full">
        <div className="flex flex-col items-center justify-center h-screen">
          <h1 className="text-2xl font-bold flex items-center gap-2">
            Zápas již byl odehrán <ShieldCheck />
          </h1>
          <p className="mt-2">
            Zápas s ID {matchID} již byl odehrán a nelze k němu přidat nové
            nákupy.
          </p>
        </div>
      </div>
    );
  }

  return (
    <div className="w-full h-full">
      <div className="flex flex-col items-center justify-center h-screen">
        <h1 className="text-2xl font-bold flex items-center gap-2">
          Nastala chyba při načítání zápasu <TriangleAlert />
        </h1>
        <p className="mt-2">{error.body?.detail}</p>
      </div>
    </div>
  );
};

export default error;
