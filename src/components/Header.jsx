const NAV_LINKS = [
  { href: '#pathways', label: 'Pathways' },
  { href: '#novels', label: 'The Novels' },
  { href: '#contact', label: 'Contact' },
];

export const Header = () => {
  return (
    <header className="bg-paper border-b border-ink/10 shadow-sm fixed top-0 w-full z-10 h-16 md:h-20 flex items-center">
      <div className="container mx-auto flex px-5 flex-row items-center justify-center md:justify-between h-full">
        <a
          href="#top"
          className="flex items-center gap-3 rounded focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-gold"
        >
          <span className="w-2.5 h-2.5 rounded-full bg-bookYellow" aria-hidden="true" />
          <span className="font-display font-semibold text-xl md:text-2xl text-ink">
            Pathways Through Complexity
          </span>
        </a>
        {/* Anchor nav for the one-page layout; on small screens the wordmark
            already fills the bar, so the nav appears from md up. */}
        <nav aria-label="Site sections" className="hidden md:flex items-center gap-8">
          {NAV_LINKS.map(({ href, label }) => (
            <a
              key={href}
              href={href}
              className="text-sm font-medium text-ink/70 hover:text-ink transition-colors duration-200 rounded focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-gold"
            >
              {label}
            </a>
          ))}
        </nav>
      </div>
    </header>
  );
};
