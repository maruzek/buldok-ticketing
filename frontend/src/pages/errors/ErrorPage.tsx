import { Button } from "@/components/ui/button";
import {
  Card,
  CardDescription,
  CardFooter,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import React from "react";
import { Link } from "react-router";

type ErrorPageProps = {
  title: string;
  description: string;
  icon?: React.ReactNode;
};

const ErrorPage = ({ title, description, icon }: ErrorPageProps) => {
  return (
    <div className="flex items-center justify-center min-h-screen bg-background">
      <Card className="w-full max-w-md mx-4">
        <CardHeader className="text-center">
          {icon && <div className="flex justify-center mb-4">{icon}</div>}
          <CardTitle className="text-2xl">{title}</CardTitle>
          <CardDescription>{description}</CardDescription>
        </CardHeader>
        <CardFooter className="flex justify-center gap-2">
          <Link to="/">
            <Button variant="outline">Zpět do aplikace</Button>
          </Link>
        </CardFooter>
      </Card>
    </div>
  );
};

export default ErrorPage;
