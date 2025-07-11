import { Card, CardAction, CardHeader } from "../ui/card";
import { Button } from "../ui/button";

type contentBoardProps = {
  children: React.ReactNode;
  cardAction?: React.ReactNode;
};

const ContentBoard = ({ children, cardAction }: contentBoardProps) => {
  return (
    <Card className="w-full p-5 bg-card text-card-foreground rounded-md shadow-sm">
      {cardAction && (
        <CardHeader className="w-full m-0 p-0">
          <CardAction>
            <Button>{cardAction}</Button>
          </CardAction>
        </CardHeader>
      )}
      {children}
    </Card>
  );
};

export default ContentBoard;
