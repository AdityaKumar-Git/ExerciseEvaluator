const Header = () => {
    return (
      <header className="bg-gray-900 border-b border-gray-800 p-6">
        <div className="container mx-auto flex flex-col md:flex-row justify-between items-center gap-4">
          <div className="flex items-center gap-3">
            <span className="text-3xl">🏋️‍♂️</span>
            <h1 className="text-white text-3xl font-bold tracking-tight">
              AI Exercise Coach
            </h1>
          </div>
          <p className="text-gray-400 text-lg font-medium">Real-time posture evaluation</p>
        </div>
      </header>
    );
  };
  
  export default Header;