"use server";

import { auth, signIn, signOut } from "./auth";
import { differenceInDays } from "date-fns";
import { getBookings, getCabinPrice, getSettings } from "./data-service";
import { computeStayPrice } from "./pricing";
import { supabase } from "./supabase";
import { revalidatePath } from "next/cache";
import { redirect } from "next/navigation";

export async function updateGuest(formData) {
  const session = await auth();
  if (!session) throw new Error("You must be logged in");

  const nationalID = formData.get("nationalID");
  const [nationality, countryFlag] = formData.get("nationality").split("%");

  if (!/^[a-zA-Z0-9]{6,12}$/.test(nationalID))
    throw new Error("Please provide a valid national ID");

  const updateData = { nationality, countryFlag, nationalID };

  const { data, error } = await supabase
    .from("guests")
    .update(updateData)
    .eq("id", session.user.guestId);

  if (error) throw new Error("Guest could not be updated");

  revalidatePath("/account/profile");
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

  // 5) 白名单式构造：只写下面这些字段，
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
    totalPrice: cabinPrice,
    isPaid: false,
    hasBreakfast: false,
    status: "unconfirmed",
  };

  const { error } = await supabase.from("bookings").insert([newBooking]);

  if (error) throw new Error("Booking could not be created");

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

export async function signInAction() {
  await signIn("google", { redirectTo: "/account" });
}

export async function signOutAction() {
  await signOut({ redirectTo: "/" });
}
