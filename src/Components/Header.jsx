const Header = () => {
  return (
    <div className="bg-gradient-to-r from-sky-200 via-sky-300 to-blue-400">
      <header className="bg-gradient-to-r from-sky-200 via-sky-300 to-blue-400 bg-cover bg-center bg-no-repeat flex flex-col sm:flex-row items-center justify-between px-8 py-3 shadow-md border-b border-sky-200">
        <div className="flex items-center space-x-3 mb-2 sm:mb-0">
          <h1 className="font-bold text-2xl text-sky-900">ExploreWorld</h1>
        </div>
      </header>
    </div>
  );
};

export default Header;
