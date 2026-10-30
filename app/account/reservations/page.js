import ReservationList from "@/app/_components/ReservationList";
import { auth } from "@/app/_lib/auth";
import { getBookings, getReviewedBookingIds } from "@/app/_lib/data-service";

export const metadata = {
  title: "Reservations",
};

export default async function Page() {
  const session = await auth();
  const [bookings, reviewedIds] = await Promise.all([
    getBookings(session.user.guestId),
    getReviewedBookingIds(session.user.guestId),
  ]);

  return (
    <div>
      <h2 className="text-2xl font-medium tracking-tight text-primary-50 mb-7">
        Your reservations
      </h2>

      {bookings.length === 0 ? (
        <p className="text-primary-300">
          You have no reservations yet. Check out our{" "}
          <a className="underline text-accent-500" href="/cabins">
            cabins &rarr;
          </a>
        </p>
      ) : (
        <ReservationList bookings={bookings} reviewedIds={[...reviewedIds]} />
      )}
    </div>
  );
}
