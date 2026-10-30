"use server";

import { auth, signIn, signOut } from "./auth";
import { differenceInDays } from "date-fns";
import {
  getBookings,
  getBooking,
  getBookedDatesByCabinId,
  getCabinPrice,
  getCouponContext,
  getReviewByBookingId,
  getSettings,
} from "./data-service";
import { computeStayPrice } from "./pricing";
import { validateCoupon } from "./coupons";
import { findConflictDays, toDayKey } from "./date-conflicts";
import { canReview, calcRatingStats } from "./reviews";
import { isValidNationalID, NATIONAL_ID_HINT } from "./validation";
import { supabase } from "./supabase";
import { revalidatePath } from "next/cache";
import { redirect } from "next/navigation";

export async function updateGuest(formData) {
  const session = await auth();
  if (!session) throw new Error("You must be logged in");

  const nationalID = formData.get("nationalID");
  const [nationality, countryFlag] = formData.get("nationality").split("%");

  // 和服务端共用同一个校验函数：客户端为了体验提前挡一次，
  // 这里是为了安全再挡一次（客户端那份可以被绕过）
  if (!isValidNationalID(nationalID))
    throw new Error(NATIONAL_ID_HINT);

  const updateData = { nationality, countryFlag, nationalID };

  const { data, error } = await supabase
    .from("guests")
    .update(updateData)
    .eq("id", session.user.guestId);

  if (error) throw new Error("Guest could not be updated");

  revalidatePath("/account/profile");
}

/**
 * 只读：给表单里的「应用」按钮做折扣预览。
 *
 * ⚠️ 这个返回值【不可信】——它回到浏览器，用户能改。
 * 真正生效的是 createBooking 里那次重新校验，两次用的是同一个 validateCoupon。
 */
export async function checkCoupon({ code, cabinId, numNights }) {
  const session = await auth();
  if (!session) return { ok: false, reason: "请先登录再使用优惠码" };

  if (!code?.trim()) return { ok: false, reason: "请输入优惠码" };

  const nights = Number(numNights);
  if (!Number.isInteger(nights) || nights <= 0)
    return { ok: false, reason: "请先选择入住日期" };

  try {
    const cabin = await getCabinPrice(cabinId);
    const { cabinPrice } = computeStayPrice({
      regularPrice: cabin.regularPrice,
      discount: cabin.discount,
      numNights: nights,
    });

    const ctx = await getCouponContext({
      code,
      guestId: session.user.guestId,
    });

    return validateCoupon({
      coupon: ctx.coupon,
      numNights: nights,
      basePrice: cabinPrice,
      usedCount: ctx.usedCount,
      usedByGuest: ctx.usedByGuest,
      isFirstBooking: ctx.isFirstBooking,
    });
  } catch {
    return { ok: false, reason: "优惠码校验失败，请稍后重试" };
  }
}

export async function createBooking(bookingData, formData) {
  // 1) 认证
  const session = await auth();
  if (!session) throw new Error("You must be logged in");

  // 2) 只从 bookingData 里取【可信的意图】：订哪一间、从哪天到哪天。
  //    晚数和金额全部由服务端重算，前端传来的 numNights / cabinPrice 一律丢弃。
  const { cabinId } = bookingData;
  const startDate = new Date(bookingData.startDate);
  const endDate = new Date(bookingData.endDate);

  if (Number.isNaN(startDate.getTime()) || Number.isNaN(endDate.getTime()))
    throw new Error("入住或退房日期无效");

  if (endDate <= startDate) throw new Error("退房日期必须晚于入住日期");

  const today = new Date();
  today.setHours(0, 0, 0, 0);
  if (startDate < today) throw new Error("不能预订过去的日期");

  const numNights = differenceInDays(endDate, startDate);

  // 3) 服务端重查单价，并用与前端相同的纯函数算钱
  const cabin = await getCabinPrice(cabinId);
  const { cabinPrice } = computeStayPrice({
    regularPrice: cabin.regularPrice,
    discount: cabin.discount,
    numNights,
  });

  // 4) 住宿长度上限（日历上也限制了，但日历同样不可信）
  const { maxBookingLength } = await getSettings();
  if (numNights > maxBookingLength)
    throw new Error(`最多可连住 ${maxBookingLength} 晚`);

  if (!Number.isInteger(cabinPrice) || cabinPrice <= 0)
    throw new Error("金额计算异常，请稍后重试");

  // 5) 日期冲突：日历上把已订日期变灰了，但那只发生在浏览器里，
  //    绕过界面直接提交仍然能订到别人已经订走的日期
  const bookedDates = await getBookedDatesByCabinId(cabinId);
  const conflicts = findConflictDays({ bookedDates, startDate, endDate });

  if (conflicts.length > 0) {
    const preview = conflicts.slice(0, 3).map(toDayKey).join("、");
    const suffix = conflicts.length > 3 ? " 等" : "";
    throw new Error(`这些日期已经被订走：${preview}${suffix}，请换几天再试`);
  }

  // 6) 优惠码（可选）：服务端重新校验。界面上"预览"的结果一律不采信
  const rawCouponCode = String(formData.get("couponCode") ?? "").trim();
  let couponId = null;
  let couponDiscount = 0;

  if (rawCouponCode) {
    const ctx = await getCouponContext({
      code: rawCouponCode,
      guestId: session.user.guestId,
    });

    const result = validateCoupon({
      coupon: ctx.coupon,
      numNights,
      basePrice: cabinPrice,
      usedCount: ctx.usedCount,
      usedByGuest: ctx.usedByGuest,
      isFirstBooking: ctx.isFirstBooking,
    });

    if (!result.ok) throw new Error(result.reason);

    couponId = ctx.coupon.id;
    couponDiscount = result.discountAmount;
  }

  const totalPrice = cabinPrice - couponDiscount;

  // 7) 白名单式构造：只写下面这些字段，
  //    前端塞进 bookingData 的其他键一概不会进数据库
  const newBooking = {
    startDate,
    endDate,
    numNights,
    cabinPrice,
    cabinId,
    guestId: session.user.guestId,
    numGuests: Number(formData.get("numGuests")),
    observations: formData.get("observations").slice(0, 1000),
    extrasPrice: 0,
    totalPrice,
    couponId,
    couponDiscount,
    isPaid: false,
    hasBreakfast: false,
    status: "unconfirmed",
  };

  const { data: createdBooking, error } = await supabase
    .from("bookings")
    .insert([newBooking])
    .select("id")
    .single();

  if (error) throw new Error("Booking could not be created");

  // 记录优惠码使用情况。
  // 唯一索引 (couponId, guestId) 是并发下的最后一道防线：
  // 同一个人在另一个标签页同时下单时，这里会插失败，于是把刚建的订单撤回。
  if (couponId) {
    const { error: redeemError } = await supabase
      .from("coupon_redemptions")
      .insert([
        {
          couponId,
          guestId: session.user.guestId,
          bookingId: createdBooking.id,
          discountAmount: couponDiscount,
        },
      ]);

    if (redeemError) {
      await supabase.from("bookings").delete().eq("id", createdBooking.id);
      throw new Error("这个优惠码刚刚已被使用，请去掉优惠码后重试");
    }
  }

  revalidatePath(`/cabins/${cabinId}`);

  redirect("/cabins/thankyou");
}

export async function deleteBooking(bookingId) {
  const session = await auth();
  if (!session) throw new Error("You must be logged in");

  const guestBookings = await getBookings(session.user.guestId);
  const guestBookingIds = guestBookings.map((booking) => booking.id);

  if (!guestBookingIds.includes(bookingId))
    throw new Error("You are not allowed to delete this booking");

  const { error } = await supabase
    .from("bookings")
    .delete()
    .eq("id", bookingId);

  if (error) throw new Error("Booking could not be deleted");

  revalidatePath("/account/reservations");
}

export async function updateBooking(formData) {
  const bookingId = Number(formData.get("bookingId"));

  // 1) Authentication
  const session = await auth();
  if (!session) throw new Error("You must be logged in");

  // 2) Authorization
  const guestBookings = await getBookings(session.user.guestId);
  const guestBookingIds = guestBookings.map((booking) => booking.id);

  if (!guestBookingIds.includes(bookingId))
    throw new Error("You are not allowed to update this booking");

  // 3) Building update data
  const updateData = {
    numGuests: Number(formData.get("numGuests")),
    observations: formData.get("observations").slice(0, 1000),
  };

  // 4) Mutation
  const { error } = await supabase
    .from("bookings")
    .update(updateData)
    .eq("id", bookingId)
    .select()
    .single();

  // 5) Error handling
  if (error) throw new Error("Booking could not be updated");

  // 6) Revalidation
  revalidatePath(`/account/reservations/edit/${bookingId}`);
  revalidatePath("/account/reservations");

  // 7) Redirecting
  redirect("/account/reservations");
}

/**
 * 重算并写回某间小屋的评分统计。
 *
 * 冗余存 avgRating / reviewCount 是为了列表页读取快，
 * 代价就是每次写评价都得同步一次——所以它和插入评价放在同一个 action 里，
 * 一起成功或一起失败。
 */
async function recalcCabinRating(cabinId) {
  const { data, error } = await supabase
    .from("reviews")
    .select("rating")
    .eq("cabinId", cabinId);

  if (error) {
    console.error(error);
    throw new Error("评分统计失败");
  }

  const { avgRating, reviewCount } = calcRatingStats(
    (data ?? []).map((row) => row.rating)
  );

  const { error: updateError } = await supabase
    .from("cabins")
    .update({ avgRating, reviewCount })
    .eq("id", cabinId);

  if (updateError) {
    console.error(updateError);
    throw new Error("评分同步失败");
  }
}

export async function createReview(formData) {
  const session = await auth();
  if (!session) throw new Error("You must be logged in");

  const bookingId = Number(formData.get("bookingId"));
  const rating = Number(formData.get("rating"));
  const comment = String(formData.get("comment") ?? "")
    .trim()
    .slice(0, 1000);

  if (!Number.isInteger(rating) || rating < 1 || rating > 5)
    throw new Error("请选择 1 到 5 星");

  const booking = await getBooking(bookingId);
  const existing = await getReviewByBookingId(bookingId);

  // 三条判断（存在 / 是你的 / 已退房 / 没评过）全部走共用纯函数，
  // 和页面上"显示不显示写评价按钮"用的是同一份规则
  const check = canReview({
    booking,
    guestId: session.user.guestId,
    hasReviewed: Boolean(existing),
  });

  if (!check.ok) throw new Error(check.reason);

  const { error } = await supabase.from("reviews").insert([
    {
      bookingId,
      guestId: session.user.guestId,
      cabinId: booking.cabinId,
      rating,
      comment: comment || null,
    },
  ]);

  if (error) throw new Error("评价提交失败，请稍后重试");

  await recalcCabinRating(booking.cabinId);

  revalidatePath("/account/reservations");
  revalidatePath("/cabins");
  revalidatePath(`/cabins/${booking.cabinId}`);

  redirect("/account/reservations");
}

export async function signInAction() {
  await signIn("google", { redirectTo: "/account" });
}

export async function signOutAction() {
  await signOut({ redirectTo: "/" });
}
