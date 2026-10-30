import { Suspense } from "react";
import CabinList from "../_components/CabinList";
import Spinner from "../_components/Spinner";
import Counter from "../_components/Counter";
import Filter from "../_components/Filter";
import ReservationReminder from "../_components/ReservationReminder";

export const revalidate = 3600;
// export const revalidate = 15;

export const metadata = {
  title: "Cabins",
};

export default function Page({ searchParams }) {
  const filter = searchParams?.capacity ?? "all";

  return (
    <div>
      <div className="mb-10">
        <p className="eyebrow mb-3">Our cabins</p>
        <h1 className="text-3xl sm:text-4xl font-medium tracking-tight text-primary-50">
          Six cabins, six views
        </h1>
        <p className="mt-4 max-w-2xl text-primary-300">
          Small wooden cabins in a quiet valley. Wake up to mountain views, spend
          the day walking the forest trails, and end it in your own hot tub under
          the stars. No crowds, no schedule &mdash; just a slow few days away
          from home.
        </p>
      </div>

      <div className="flex justify-start sm:justify-end mb-8">
        <Filter />
      </div>

      <Suspense fallback={<Spinner />} key={filter}>
        <CabinList filter={filter} />
        <ReservationReminder />
      </Suspense>
    </div>
  );
}
