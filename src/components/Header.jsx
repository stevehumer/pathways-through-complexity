export const Header = () => {
    return (
      <header className="bg-bookYellow text-gray-600 body-font fixed top-0 w-full z-10 shadow-md">
        <div className="container mx-auto flex flex-wrap p-5 flex-col md:flex-row items-center justify-center">
          <a className="flex title-font font-medium items-center text-gray-900 mb-4 md:mb-0">
            <span className="header-font ml-3 text-xl">Pathways Through Complexity</span>
          </a>
          {/* If you have navigation links, you can add them here */}
        </div>
      </header>
    );
  };