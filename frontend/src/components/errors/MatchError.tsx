import { ApiError } from "@/types/ApiError";
import { Frown, ShieldBan, ShieldCheck, TriangleAlert } from "lucide-react";
import BasicError from "./BasicError";

const error = ({ error, matchID }: { error: ApiError; matchID: string }) => {
  if (error?.status === 404) {
    return (
      <BasicError
        title={`Zápas nenalezen`}
        icon={<Frown />}
        message={`Zápas s ID ${matchID} nebyl nalezen.`}
      />
    );
  } else if (error?.status === 403) {
    return (
      <BasicError
        title="Přístup odepřen"
        icon={<ShieldBan />}
        message="Nemáte oprávnění upravovat tento zápas."
      />
    );
  } else if (error?.status === 400) {
    return (
      <BasicError
        title="Zápas již proběhl"
        icon={<ShieldCheck />}
        message="Zápas s ID ${matchID} již proběhl a nelze k němu přidat nové nákupy."
      />
    );
  } else if (error?.status === 500) {
    return (
      <BasicError
        title="Chyba serveru"
        icon={<Frown />}
        message="Nastala chyba na straně serveru. Zkuste to prosím znovu později."
      />
    );
  }

  return (
    <BasicError
      title="Nastala chyba při načítání zápasu"
      icon={<TriangleAlert />}
      message={error.body?.detail}
    />
  );
};

export default error;
