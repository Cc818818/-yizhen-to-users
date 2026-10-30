"use client";

import {
  differenceInDays,
  isPast,
  isSameDay,
  isWithinInterval,
} from "date-fns";
import { DayPicker } from "react-day-picker";
import "react-day-picker/dist/style.css";
import { useReservation } from "./ReservationContext";

function isAlreadyBooked(range, datesArr) {
  return (
    range.from &&
    range.to &&
    datesArr.some((date) =>
      isWithinInterval(date, { start: range.from, end: range.to })
    )
  );
}

function DateSelector({ settings, cabin, bookedDates }) {
  const { range, setRange, resetRange } = useReservation();

  const displayRange = isAlreadyBooked(range, bookedDates) ? {} : range;

  const { regularPrice, discount } = cabin;
  const numNights = differenceInDays(displayRange.to, displayRange.from);
  const cabinPrice = numNights * (regularPrice - discount);

  const { minBookingLength, maxBookingLength } = settings;

  return (
    <div className="flex flex-col justify-between">
      <DayPicker
        className="pt-12 place-self-center"
        mode="range"
        onSelect={setRange}
        selected={displayRange}
        min={minBookingLength + 1}
        max={maxBookingLength}
        fromMonth={new Date()}
        fromDate={new Date()}
        toYear={new Date().getFullYear() + 5}
        captionLayout="dropdown"
        numberOfMonths={2}
        disabled={(curDate) =>
          isPast(curDate) ||
          bookedDates.some((date) => isSameDay(date, curDate))
        }
      />

      <div className="flex flex-wrap items-center justify-between gap-4 px-6 py-4 rounded-2xl border border-white/10 bg-white/[0.03]">
        <div className="flex flex-wrap items-baseline gap-5">
          <p className="flex gap-2 items-baseline">
            {discount > 0 ? (
              <>
                <span className="text-2xl font-semibold text-primary-50">
                  ${regularPrice - discount}
                </span>
                <span className="line-through text-primary-500">
                  ${regularPrice}
                </span>
              </>
            ) : (
              <span className="text-2xl font-semibold text-primary-50">
                ${regularPrice}
              </span>
            )}
            <span className="text-sm text-primary-500">/night</span>
          </p>
          {numNights ? (
            <>
              <p className="rounded-lg bg-white/10 px-3 py-1.5 text-xl text-primary-100">
                <span className="text-primary-400">&times;</span>{" "}
                <span>{numNights}</span>
              </p>
              <p className="flex items-baseline gap-2">
                <span className="eyebrow">Total</span>{" "}
                <span className="text-2xl font-semibold text-primary-50">
                  ${cabinPrice}
                </span>
              </p>
            </>
          ) : null}
        </div>

        {range.from || range.to ? (
          <button className="pill pill-ghost !px-4 !py-2 text-xs" onClick={resetRange}>
            Clear
          </button>
        ) : null}
      </div>
    </div>
  );
}

export default DateSelector;
