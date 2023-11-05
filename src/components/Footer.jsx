export const Footer = () => {
    const currentYear = new Date().getFullYear(); // This will keep the year updated automatically
  
    return (
      <footer className="text-gray-600 body-font">
        <div className="container mx-auto flex items-center justify-center flex-col p-4">
          <p className="text-sm text-gray-500 sm:text-center">
            © {currentYear} by Bine Ari Digit Publications. All rights reserved.
          </p>
        </div>
      </footer>
    );
  };