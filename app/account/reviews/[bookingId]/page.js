import Link from "next/link";
import { redirect } from "next/navigation";
import { format } from "date-fns";
import { auth } from "@/app/_lib/auth";
import {
  getBooking,
  getCabin,
  getReviewByBookingId,
} from "@/app/_lib/data-service";
import { canReview } from "@/app/_lib/reviews";
import ReviewForm from "@/app/_components/ReviewForm";

export const metadata = {
  title: "Review",
};

function Stars({ rating }) {
  return (
    <span className="text-2xl">
      {[1, 2, 3, 4, 5].map((n) => (
        <span
          key={n}
          className={n <= rating ? "text-accent-400" : "text-primary-700"}
        >
          ★
        </span>
      ))}
    </span>
  );
}

export default async function Page({ params }) {
  const session = await auth();
  if (!session) redirect("/login");

  const booking = await getBooking(params.bookingId);
  const review = await getReviewByBookingId(booking.id);
  const cabin = await getCabin(booking.cabinId);

  // 越权检查放在最前面：不是自己的订单，后面的信息一律不给看
  const isOwner = Number(booking.guestId) === Number(session.user.guestId);

  const backLink = (
    <Link
      href="/account/reservations"
      className="pill pill-solid"
    >
      Back to my reservations
    </Link>
  );

  // ① 不是自己的订单
  if (!isOwner) {
    return (
      <div className="max-w-2xl">
        <h2 className="font-semibold text-2xl text-accent-400 mb-4">
          Cannot review this booking
        </h2>
        <p className="text-lg text-primary-200 mb-8">这不是你的订单</p>
        {backLink}
      </div>
    );
  }

  // ② 已经评价过 —— 不再拒绝，改成只读展示
  if (review) {
    return (
      <div className="max-w-2xl">
        <h2 className="font-semibold text-2xl text-accent-400 mb-2">
          Your review
        </h2>
        <p className="text-lg text-primary-200 mb-8">
          Cabin {cabin.name} · {booking.numNights} nights ·{" "}
          {format(new Date(booking.startDate), "MMM dd, yyyy")}
        </p>

        <div className="bg-primary-900 py-8 px-12">
          <div className="flex items-center justify-between mb-4">
            <Stars rating={review.rating} />
            <span className="text-primary-400 text-base">
              {format(new Date(review.created_at), "MMM dd, yyyy")}
            </span>
          </div>

          <p className="text-lg text-primary-100 whitespace-pre-line">
            {review.comment || "（没有写留言）"}
          </p>
        </div>

        <div className="flex gap-4 mt-8">{backLink}</div>

        <p className="text-primary-400 text-sm mt-6">
          评价提交后不能修改或删除。
        </p>
      </div>
    );
  }

  // ③ 还没评价：交给共用规则判断能不能评（退房了没）
  const check = canReview({
    booking,
    guestId: session.user.guestId,
    hasReviewed: false,
  });

  if (!check.ok) {
    return (
      <div className="max-w-2xl">
        <h2 className="font-semibold text-2xl text-accent-400 mb-4">
          Cannot review this booking
        </h2>
        <p className="text-lg text-primary-200 mb-8">{check.reason}</p>
        {backLink}
      </div>
    );
  }

  // ④ 可以写
  return (
    <div className="max-w-2xl">
      <h2 className="font-semibold text-2xl text-accent-400 mb-2">
        Write a review
      </h2>
      <p className="text-lg text-primary-200 mb-8">
        {booking.numNights} nights in Cabin {cabin.name} &mdash; thanks for
        staying with us!
      </p>

      <ReviewForm bookingId={booking.id} cabinName={cabin.name} />
    </div>
  );
}
