const Header = () => {
  return (
    <header className="bg-emerald-950 p-4 flex justify-between items-center h-15">
      <div className="flex items-center w-full justify-between">
        <img
          src="/logo-buldok-transparent.png"
          alt="Logo"
          className="h-10 w-auto"
        />
        <div className="rounded-full bg-gray-300 w-10 h-10"></div>
      </div>
    </header>
  );
};

export default Header;
