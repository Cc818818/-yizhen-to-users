import Image from "next/image";
import TextExpander from "@/app/_components/TextExpander";
import { EyeSlashIcon, MapPinIcon, UsersIcon } from "@heroicons/react/24/solid";

function Cabin({ cabin }) {
  const { name, maxCapacity, image, description } = cabin;

  return (
    <div className="glass overflow-hidden mb-20">
      <div className="grid md:grid-cols-[1.1fr_1fr]">
        <div className="relative min-h-[280px] md:min-h-[340px] bg-primary-900">
          <Image
            src={image}
            fill
            sizes="(max-width: 768px) 100vw, 55vw"
            className="object-cover"
            alt={`Cabin ${name}`}
          />
          <div className="absolute inset-0 bg-gradient-to-r from-transparent to-primary-950/40" />
        </div>

        <div className="p-7 sm:p-9 flex flex-col">
          <p className="eyebrow mb-3">Cabin</p>

          <h1 className="text-3xl sm:text-4xl font-medium tracking-tight text-primary-50 mb-5">
            {name}
          </h1>

          <p className="text-primary-300 leading-relaxed mb-7">
            <TextExpander>{description}</TextExpander>
          </p>

          <ul className="mt-auto flex flex-col gap-3 pt-5 border-t border-white/10">
            <li className="flex gap-3 items-center text-primary-200">
              <UsersIcon className="h-5 w-5 text-primary-500" />
              <span>
                For up to <span className="font-semibold">{maxCapacity}</span>{" "}
                guests
              </span>
            </li>
            <li className="flex gap-3 items-center text-primary-200">
              <MapPinIcon className="h-5 w-5 text-primary-500" />
              <span>
                Quiet valley, <span className="font-semibold">2h</span> from the
                city
              </span>
            </li>
            <li className="flex gap-3 items-center text-primary-200">
              <EyeSlashIcon className="h-5 w-5 text-primary-500" />
              <span>
                Privacy <span className="font-semibold">100%</span> guaranteed
              </span>
            </li>
          </ul>
        </div>
      </div>
    </div>
  );
}

export default Cabin;
