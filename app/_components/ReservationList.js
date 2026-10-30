"use client";

import ReservationCard from "./ReservationCard";
import { deleteBooking } from "../_lib/actions";

import { useOptimistic } from "react";

function ReservationList({ bookings, reviewedIds = [] }) {
  // 传进来的是数组（服务端 → 客户端的 props 必须可序列化，Set 不行）
  const reviewed = new Set(reviewedIds.map(Number));

  const [optimisticBookings, optimisticDelete] = useOptimistic(
    bookings,
    (curBookings, bookingId) => {
      return curBookings.filter((booking) => booking.id !== bookingId);
    }
  );

  async function handleDelete(bookingId) {
    optimisticDelete(bookingId);
    await deleteBooking(bookingId);
  }

  return (
    <ul className="space-y-6">
      {optimisticBookings.map((booking) => (
        <ReservationCard
          booking={booking}
          onDelete={handleDelete}
          hasReviewed={reviewed.has(Number(booking.id))}
          key={booking.id}
        />
      ))}
    </ul>
  );
}

export default ReservationList;
