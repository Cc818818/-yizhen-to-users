import Link from "next/link";
import Image from "next/image";
import bg from "@/public/bg.png";

export default function Page() {
  return (
    <main className="relative">
      {/* 山景图压到很低的透明度，只用来压住黑色，不抢文字 */}
      <div className="pointer-events-none absolute inset-x-0 -top-10 h-[70vh] overflow-hidden opacity-[0.18]">
        <Image
          src={bg}
          fill
          placeholder="blur"
          quality={80}
          priority
          className="object-cover object-top"
          alt=""
        />
        <div className="absolute inset-0 bg-gradient-to-b from-transparent via-primary-950/40 to-primary-950" />
      </div>

      <section className="relative flex min-h-[62vh] flex-col items-center justify-center text-center pt-10 pb-16">
        <p className="eyebrow mb-7">A small retreat in the mountains</p>

        <h1 className="text-5xl sm:text-6xl md:text-7xl font-medium tracking-tightest text-primary-50 leading-[1.04]">
          One good night,
          <br />
          every time.
        </h1>

        <p className="mt-6 max-w-md text-base sm:text-lg text-primary-300 leading-relaxed">
          Timber cabins, real fires and quiet nights.
          <br className="hidden sm:block" />
          No crowds, no schedule — just a slow few days away.
        </p>

        <div className="mt-10 flex flex-wrap items-center justify-center gap-3">
          <Link href="/cabins" className="pill pill-solid px-7 py-3.5">
            Explore cabins
          </Link>
          <Link href="/about" className="pill pill-ghost px-7 py-3.5">
            About the place
          </Link>
        </div>

        <div className="mt-16 flex flex-wrap items-center justify-center gap-x-8 gap-y-3 text-xs text-primary-500">
          {["6 cabins", "2h from the city", "Pay on arrival", "Free cancellation"].map(
            (item) => (
              <span key={item} className="flex items-center gap-2">
                <i className="block h-1 w-1 rounded-full bg-primary-500" />
                {item}
              </span>
            ),
          )}
        </div>
      </section>
    </main>
  );
}
