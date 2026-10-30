import Image from "next/image";
import Link from "next/link";
import logo from "@/public/logo.png";

function Logo() {
  return (
    <Link href="/" className="flex items-center gap-2.5 z-10 shrink-0">
      <Image
        src={logo}
        height="34"
        width="34"
        quality={100}
        alt="Yizhen logo"
        className="rounded-full"
      />
      <span className="text-[15px] font-semibold tracking-tight text-primary-50">
        Yizhen
      </span>
    </Link>
  );
}

export default Logo;
