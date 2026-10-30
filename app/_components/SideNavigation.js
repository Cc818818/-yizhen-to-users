"use client";

import Link from "next/link";
import {
  CalendarDaysIcon,
  HomeIcon,
  UserIcon,
} from "@heroicons/react/24/solid";
import SignOutButton from "./SignOutButton";
import { usePathname } from "next/navigation";

const navLinks = [
  {
    name: "Home",
    href: "/account",
    icon: <HomeIcon className="h-5 w-5 text-primary-600" />,
  },
  {
    name: "Reservations",
    href: "/account/reservations",
    icon: <CalendarDaysIcon className="h-5 w-5 text-primary-600" />,
  },
  {
    name: "Guest profile",
    href: "/account/profile",
    icon: <UserIcon className="h-5 w-5 text-primary-600" />,
  },
];

function SideNavigation() {
  const pathname = usePathname();

  return (
    <nav className="sm:border-r border-white/10 sm:pr-6">
      <ul className="flex sm:flex-col gap-1 sm:gap-1.5 sm:h-full">
        {navLinks.map((link) => {
          const active = pathname === link.href;

          return (
            <li key={link.name}>
              <Link
                href={link.href}
                className={`flex items-center gap-3 px-4 py-2.5 rounded-pill text-sm transition-colors ${
                  active
                    ? "bg-white/10 text-primary-50"
                    : "text-primary-300 hover:text-primary-50 hover:bg-white/5"
                }`}
              >
                {link.icon}
                <span>{link.name}</span>
              </Link>
            </li>
          );
        })}

        <li className="mt-auto sm:pt-6">
          <SignOutButton />
        </li>
      </ul>
    </nav>
  );
}

export default SideNavigation;
