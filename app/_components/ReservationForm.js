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
    <div className="glass overflow-hidden">
      <div className="flex items-center justify-between px-6 py-3 border-b border-white/10 text-sm text-primary-400">
        <span>Logged in as</span>
        <span className="flex items-center gap-3 text-primary-200">
          <img
            referrerPolicy="no-referrer"
            className="h-7 w-7 rounded-full object-cover"
            src={user.image}
            alt={user.name}
          />
          {user.name}
        </span>
      </div>

      <form
        action={async (formData) => {
          await createBookingWithData(formData);
          resetRange();
        }}
        className="p-6 sm:p-8 flex flex-col gap-6"
      >
        <div>
          <label
            htmlFor="numGuests"
            className="block text-sm text-primary-400 mb-2"
          >
            How many guests?
          </label>
          <select name="numGuests" id="numGuests" className="field" required>
            <option value="" key="">
              Select number of guests...
            </option>
            {Array.from({ length: maxCapacity }, (_, i) => i + 1).map((x) => (
              <option value={x} key={x} className="bg-primary-900">
                {x} {x === 1 ? "guest" : "guests"}
              </option>
            ))}
          </select>
        </div>

        <div>
          <label
            htmlFor="observations"
            className="block text-sm text-primary-400 mb-2"
          >
            Anything we should know about your stay?
          </label>
          <textarea
            name="observations"
            id="observations"
            rows={3}
            className="field"
            placeholder="Pets, allergies, late arrival…"
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
          <div className="rounded-2xl border border-white/10 bg-white/[0.03] px-5 py-4 text-sm">
            <p className="flex justify-between text-primary-300">
              <span>
                ${nightlyRate} × {numNights} nights
              </span>
              <span>${cabinPrice}</span>
            </p>

            {appliedDiscount > 0 && (
              <p className="flex justify-between mt-2 text-[#9ad19a]">
                <span>Promo {couponCode.trim().toUpperCase()}</span>
                <span>&minus;${appliedDiscount}</span>
              </p>
            )}

            <p className="flex justify-between items-baseline mt-4 pt-4 border-t border-white/10 text-lg font-semibold text-primary-50">
              <span>Total</span>
              <span>${totalPrice}</span>
            </p>
          </div>
        )}

        {conflicts.length > 0 && (
          <p className="text-sm text-[#e0a0a0]">
            这些日期已经被订走：
            {conflicts.slice(0, 3).map(toDayKey).join("、")}
            {conflicts.length > 3 ? " 等" : ""}，请换几天
          </p>
        )}

        <div className="flex justify-end">
          {!hasDates ? (
            <p className="text-sm text-primary-500">Start by selecting dates</p>
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
