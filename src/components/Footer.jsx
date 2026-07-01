export const Footer = () => {
    const currentYear = new Date().getFullYear(); // This will keep the year updated automatically

    return (
      <footer className="font-body bg-paper border-t border-ink/10">
        <div className="container mx-auto flex items-center justify-center flex-col py-8">
          <p className="text-sm text-ink/60 sm:text-center">
            © {currentYear} by Bine Ari Digit Publications. All rights reserved.
          </p>
        </div>
      </footer>
    );
  };
