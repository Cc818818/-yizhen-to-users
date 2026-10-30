import SideNavigation from "@/app/_components/SideNavigation";

export default function Layout({ children }) {
  return (
    <div className="grid sm:grid-cols-[15rem_1fr] gap-6 sm:gap-10 h-full">
      <SideNavigation />
      <div className="min-w-0">{children}</div>
    </div>
  );
}
