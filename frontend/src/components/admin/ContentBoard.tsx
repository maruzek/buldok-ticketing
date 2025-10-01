import { Card, CardAction, CardHeader } from "../ui/card";

type contentBoardProps = {
  children: React.ReactNode;
  cardHeader?: React.ReactNode;
  cardAction?: React.ReactNode;
};

const ContentBoard = ({
  children,
  cardHeader,
  cardAction,
}: contentBoardProps) => {
  return (
    <Card className="w-full p-5 text-card-foreground rounded-md bg-background border-0 shadow-none">
      {(cardHeader || cardAction) && (
        <CardHeader className="w-full m-0 p-0">
          {cardHeader}
          {cardAction && <CardAction>{cardAction}</CardAction>}
        </CardHeader>
      )}
      {children}
    </Card>
  );
};

export default ContentBoard;
