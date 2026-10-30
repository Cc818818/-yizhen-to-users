import Logo from "@/app/_components/Logo";
import Navigation from "@/app/_components/Navigation";

import { Josefin_Sans } from "next/font/google";

const josefin = Josefin_Sans({
  subsets: ["latin"],
  display: "swap",
});

import "@/app/_styles/globals.css";
import Header from "./_components/Header";
import { ReservationProvider } from "./_components/ReservationContext";

export const metadata = {
  title: {
    template: "%s / Yizhen",
    default: "Welcome / Yizhen",
  },
  description:
    "A small family-run retreat in the mountains: timber cabins, real fires and quiet nights.",
};

export default function RootLayout({ children }) {
  return (
    <html lang="en">
      <body
        className={`${josefin.className} antialiased bg-primary-950 text-primary-100 min-h-screen flex flex-col relative`}
      >
        {/* 背景光晕 + 极细网格，纯装饰 */}
        <div className="aurora" aria-hidden="true" />

        <Header />

        <div className="flex-1 px-5 sm:px-8 py-10 grid">
          <main className="max-w-6xl mx-auto w-full">
            <ReservationProvider>{children}</ReservationProvider>
          </main>
        </div>
      </body>
    </html>
  );
}
