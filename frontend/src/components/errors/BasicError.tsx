const BasicError = ({
  title,
  message,
  icon,
}: {
  title: string;
  message?: string;
  icon?: React.ReactNode;
}) => {
  return (
    <div className="w-full">
      <div className="flex flex-col items-center justify-center">
        <h1 className="text-2xl font-bold flex items-center gap-2">
          {title} {icon}
        </h1>
        {message && <p className="mt-2">{message}</p>}
      </div>
    </div>
  );
};

export default BasicError;
