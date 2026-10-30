import Navigation from "@/app/_components/Navigation";
import Logo from "@/app/_components/Logo";

function Header() {
  return (
    <header className="sticky top-4 z-50 px-4 sm:px-6 pt-4">
      <div className="max-w-6xl mx-auto flex items-center justify-between gap-6 pl-5 pr-2 py-2 rounded-pill border border-white/10 bg-[rgba(10,10,12,0.66)] backdrop-blur-xl">
        <Logo />
        <Navigation />
      </div>
    </header>
  );
}

export default Header;
