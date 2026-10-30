import Image from "next/image";
import Link from "next/link";
import { UsersIcon } from "@heroicons/react/24/solid";

function CabinCard({ cabin }) {
  const {
    id,
    name,
    maxCapacity,
    regularPrice,
    discount,
    image,
    avgRating,
    reviewCount,
  } = cabin;

  const price = regularPrice - discount;

  return (
    <article className="glass glass-hover overflow-hidden flex flex-col">
      <div className="relative aspect-[16/10] bg-primary-900">
        <Image
          src={image}
          fill
          alt={`Cabin ${name}`}
          className="object-cover opacity-95"
          sizes="(max-width: 768px) 100vw, 33vw"
        />
        <div className="absolute inset-0 bg-gradient-to-t from-primary-950/80 via-transparent to-transparent" />
      </div>

      <div className="p-5 flex flex-col flex-grow">
        <div className="flex items-baseline justify-between gap-3">
          <h3 className="text-lg font-semibold tracking-tight text-primary-50">
            {name}
          </h3>

          {reviewCount > 0 && (
            <span className="text-xs text-primary-300 whitespace-nowrap">
              ★ {Number(avgRating).toFixed(1)}
              <span className="text-primary-500"> ({reviewCount})</span>
            </span>
          )}
        </div>

        <p className="mt-2 text-sm text-primary-400 flex items-center gap-2">
          <UsersIcon className="h-4 w-4" />
          Up to {maxCapacity} guests
        </p>

        <div className="mt-5 pt-4 border-t border-white/10 flex items-end justify-between gap-3">
          <p className="flex items-baseline gap-1.5">
            <span className="text-xl font-semibold text-primary-50">${price}</span>
            {discount > 0 && (
              <s className="text-xs text-primary-500">${regularPrice}</s>
            )}
            <span className="text-xs text-primary-500">/night</span>
          </p>

          <Link
            href={`/cabins/${id}`}
            className="pill pill-ghost !px-4 !py-2 text-xs"
          >
            Details
          </Link>
        </div>
      </div>
    </article>
  );
}

export default CabinCard;
