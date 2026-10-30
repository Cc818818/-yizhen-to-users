import Link from "next/link";
import Image from "next/image";
import { PencilSquareIcon, StarIcon } from "@heroicons/react/24/solid";
import { format, formatDistance, isPast, isToday, parseISO } from "date-fns";
import DeleteReservation from "./DeleteReservation";

export const formatDistanceFromNow = (dateStr) =>
  formatDistance(parseISO(dateStr), new Date(), {
    addSuffix: true,
  }).replace("about ", "");

function ReservationCard({ booking, onDelete, hasReviewed = false }) {
  const {
    id,
    guestId,
    startDate,
    endDate,
    numNights,
    totalPrice,
    numGuests,
    status,
    created_at,
    cabins: { name, image },
  } = booking;

  return (
    <div className="glass flex flex-col sm:flex-row overflow-hidden">
      <div className="relative h-40 sm:h-32 sm:aspect-square">
        <Image
          src={image}
          alt={`Cabin ${name}`}
          fill
          className="object-cover"
        />
      </div>

      <div className="flex-grow px-5 py-4 flex flex-col gap-2">
        <div className="flex items-start justify-between gap-3">
          <h3 className="text-lg font-semibold tracking-tight text-primary-50">
            {numNights} nights in {name}
          </h3>
          <span
            className={`shrink-0 text-[10px] uppercase tracking-[0.14em] px-2.5 py-1 rounded-pill border ${
              isPast(new Date(startDate))
                ? "border-white/10 text-primary-400"
                : "border-[#7ad17a]/30 text-[#9ad19a]"
            }`}
          >
            {isPast(new Date(startDate)) ? "past" : "upcoming"}
          </span>
        </div>

        <p className="text-sm text-primary-400">
          {format(new Date(startDate), "EEE, MMM dd yyyy")} (
          {isToday(new Date(startDate))
            ? "Today"
            : formatDistanceFromNow(startDate)}
          ) &mdash; {format(new Date(endDate), "EEE, MMM dd yyyy")}
        </p>

        <div className="flex flex-wrap gap-x-4 gap-y-1 mt-auto pt-2 items-baseline">
          <p className="text-xl font-semibold text-primary-50">${totalPrice}</p>
          <p className="text-sm text-primary-400">
            {numGuests} guest{numGuests > 1 && "s"}
          </p>
          <p className="ml-auto text-xs text-primary-500">
            Booked {format(new Date(created_at), "MMM dd yyyy, p")}
          </p>
        </div>
      </div>

      <div className="flex sm:flex-col border-t sm:border-t-0 sm:border-l border-white/10 sm:w-[104px]">
        {!isPast(startDate) ? (
          <>
            <Link
              href={`/account/reservations/edit/${id}`}
              className="group flex flex-1 items-center justify-center gap-2 text-[11px] uppercase tracking-[0.14em] text-primary-300 border-r sm:border-r-0 sm:border-b border-white/10 px-3 py-3 hover:bg-white/5 hover:text-primary-50 transition-colors"
            >
              <PencilSquareIcon className="h-4 w-4 text-primary-500 group-hover:text-primary-200 transition-colors" />
              <span>Edit</span>
            </Link>
            <DeleteReservation bookingId={id} onDelete={onDelete} />
          </>
        ) : isPast(endDate) ? (
          hasReviewed ? (
            <Link
              href={`/account/reviews/${id}`}
              className="group flex flex-1 items-center justify-center gap-2 text-[11px] uppercase tracking-[0.14em] text-primary-300 px-3 py-3 hover:bg-white/5 hover:text-primary-50 transition-colors"
            >
              <StarIcon className="h-4 w-4 text-accent-500 group-hover:text-accent-400 transition-colors" />
              <span>Reviewed</span>
            </Link>
          ) : (
            <Link
              href={`/account/reviews/${id}`}
              className="group flex flex-1 items-center justify-center gap-2 text-[11px] uppercase tracking-[0.14em] text-primary-300 px-3 py-3 hover:bg-white/5 hover:text-primary-50 transition-colors"
            >
              <StarIcon className="h-4 w-4 text-primary-500 group-hover:text-accent-500 transition-colors" />
              <span>Review</span>
            </Link>
          )
        ) : null}
      </div>
    </div>
  );
}

export default ReservationCard;
