export const Header = () => {
  return (
    <header className="bg-paper border-b border-ink/10 shadow-sm fixed top-0 w-full z-10 h-16 md:h-20 flex items-center">
      <div className="container mx-auto flex p-3 md:p-5 flex-row items-center justify-center h-full">
        <a className="flex items-center gap-3">
          <span className="w-2.5 h-2.5 rounded-full bg-bookYellow" aria-hidden="true" />
          <span className="font-display font-semibold text-xl md:text-2xl text-ink">
            Pathways Through Complexity
          </span>
        </a>
      </div>
    </header>
  );
};
