import Link from "next/link";
import { auth } from "../_lib/auth";

const links = [
  { href: "/cabins", label: "Cabins" },
  { href: "/about", label: "About" },
];

export default async function Navigation() {
  const session = await auth();

  return (
    <nav className="z-10">
      <ul className="flex items-center gap-1">
        {links.map((link) => (
          <li key={link.href}>
            <Link
              href={link.href}
              className="block px-4 py-2 rounded-pill text-sm text-primary-300 hover:text-primary-50 hover:bg-white/5 transition-colors"
            >
              {link.label}
            </Link>
          </li>
        ))}

        <li className="pr-1">
          {session?.user?.image ? (
            <Link
              href="/account"
              className="flex items-center gap-2.5 pl-1.5 pr-4 py-1.5 rounded-pill border border-white/10 text-sm text-primary-200 hover:bg-white/5 transition-colors"
            >
              <img
                className="h-7 w-7 rounded-full object-cover"
                src={session.user.image}
                alt={session.user.name}
                referrerPolicy="no-referrer"
              />
              <span>Guest area</span>
            </Link>
          ) : (
            <Link
              href="/account"
              className="pill pill-solid !py-2 !px-5 text-xs"
            >
              Sign in
            </Link>
          )}
        </li>
      </ul>
    </nav>
  );
}
