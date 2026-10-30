"use client";

import { useEffect, useState } from "react";
import { differenceInDays } from "date-fns";
import { useReservation } from "./ReservationContext";
import { checkCoupon, createBooking } from "../_lib/actions";
import { computeStayPrice } from "../_lib/pricing";
import { findConflictDays, toDayKey } from "../_lib/date-conflicts";
import CouponField from "./CouponField";
import SubmitButton from "./SubmitButton";

function ReservationForm({ cabin, user, bookedDates = [] }) {
  const { range, resetRange } = useReservation();
  const { maxCapacity, regularPrice, discount, id } = cabin;

  const [couponCode, setCouponCode] = useState("");
  const [couponResult, setCouponResult] = useState(null);
  const [checkingCoupon, setCheckingCoupon] = useState(false);

  const startDate = range.from;
  const endDate = range.to;
  const hasDates = Boolean(startDate && endDate);

  const numNights = differenceInDays(endDate, startDate);
  // 和 Server Action 用同一个纯函数，保证"页面显示"与"实际写库"算出来的金额一致
  const { nightlyRate, cabinPrice } = computeStayPrice({
    regularPrice,
    discount,
    numNights,
  });

  // 日期或优惠码一变，之前算出来的折扣就作废了，
  // 否则界面上会挂着一个和当前订单不匹配的旧金额
  useEffect(() => {
    setCouponResult(null);
  }, [numNights, couponCode]);

  const appliedDiscount = couponResult?.ok ? couponResult.discountAmount : 0;
  const totalPrice = cabinPrice - appliedDiscount;

  // 和服务端同一个纯函数：日历上已经把已订日期变灰了，
  // 但如果用户先选了日期、随后被别人订走，这里能提前告诉他，而不是等提交炸红框
  const conflicts = hasDates
    ? findConflictDays({ bookedDates, startDate, endDate })
    : [];
  const couponBlocked = Boolean(couponResult && !couponResult.ok);

  const bookingData = {
    startDate,
    endDate,
    numNights,
    cabinPrice,
    cabinId: id,
  };

  const createBookingWithData = createBooking.bind(null, bookingData);

  async function handleApplyCoupon() {
    setCheckingCoupon(true);
    try {
      // 这里只是"预览"：服务端返回的折扣仅用于展示，
      // 真正生效的是提交时 createBooking 里那次重新校验
      const result = await checkCoupon({
        code: couponCode,
        cabinId: id,
        numNights,
      });
      setCouponResult(result);
    } catch {
      setCouponResult({ ok: false, reason: "优惠码校验失败，请稍后重试" });
    } finally {
      setCheckingCoupon(false);
    }
  }

  return (
    <div className="scale-[1.01]">
      <div className="bg-primary-800 text-primary-300 px-16 py-2 flex justify-between items-center">
        <p>Logged in as</p>

        <div className="flex gap-4 items-center">
          <img
            // Important to display google profile images
            referrerPolicy="no-referrer"
            className="h-8 rounded-full"
            src={user.image}
            alt={user.name}
          />
          <p>{user.name}</p>
        </div>
      </div>

      <form
        action={async (formData) => {
          await createBookingWithData(formData);
          resetRange();
        }}
        className="bg-primary-900 py-10 px-16 text-lg flex gap-5 flex-col"
      >
        <div className="space-y-2">
          <label htmlFor="numGuests">How many guests?</label>
          <select
            name="numGuests"
            id="numGuests"
            className="px-5 py-3 bg-primary-200 text-primary-800 w-full shadow-sm rounded-sm"
            required
          >
            <option value="" key="">
              Select number of guests...
            </option>
            {Array.from({ length: maxCapacity }, (_, i) => i + 1).map((x) => (
              <option value={x} key={x}>
                {x} {x === 1 ? "guest" : "guests"}
              </option>
            ))}
          </select>
        </div>

        <div className="space-y-2">
          <label htmlFor="observations">
            Anything we should know about your stay?
          </label>
          <textarea
            name="observations"
            id="observations"
            className="px-5 py-3 bg-primary-200 text-primary-800 w-full shadow-sm rounded-sm"
            placeholder="Any pets, allergies, special requirements, etc.?"
          />
        </div>

        <CouponField
          code={couponCode}
          onCodeChange={setCouponCode}
          onApply={handleApplyCoupon}
          result={couponResult}
          pending={checkingCoupon}
          disabled={!hasDates}
        />

        {hasDates && (
          <div className="bg-primary-950 border border-primary-800 px-6 py-4 space-y-1 text-base">
            <p className="flex justify-between text-primary-200">
              <span>
                ${nightlyRate} × {numNights} nights
              </span>
              <span>${cabinPrice}</span>
            </p>

            {appliedDiscount > 0 && (
              <p className="flex justify-between text-green-400">
                <span>Promo {couponCode.trim().toUpperCase()}</span>
                <span>&minus;${appliedDiscount}</span>
              </p>
            )}

            <p className="flex justify-between font-semibold text-lg text-primary-100 border-t border-primary-800 pt-2 mt-2">
              <span>Total</span>
              <span>${totalPrice}</span>
            </p>
          </div>
        )}

        {conflicts.length > 0 && (
          <p className="text-red-400 text-base">
            这些日期已经被订走：
            {conflicts.slice(0, 3).map(toDayKey).join("、")}
            {conflicts.length > 3 ? " 等" : ""}，请换几天
          </p>
        )}

        <div className="flex justify-end items-center gap-6">
          {!hasDates ? (
            <p className="text-primary-300 text-base">
              Start by selecting dates
            </p>
          ) : (
            <SubmitButton
              pendingLabel="Reserving..."
              disabled={conflicts.length > 0 || couponBlocked}
            >
              Reserve now
            </SubmitButton>
          )}
        </div>
      </form>
    </div>
  );
}

export default ReservationForm;
