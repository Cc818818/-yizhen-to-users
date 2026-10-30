import { notFound } from "next/navigation";
import { eachDayOfInterval } from "date-fns";
import { supabase } from "./supabase";
import countriesData from "./countries.json";

/////////////
// GET

export async function getCabin(id) {
  const { data, error } = await supabase
    .from("cabins")
    .select("*")
    .eq("id", id)
    .single();

  // For testing
  // await new Promise((res) => setTimeout(res, 2000));

  if (error) {
    console.error(error);
    notFound();
  }

  return data;
}

export async function getCabinPrice(id) {
  const { data, error } = await supabase
    .from("cabins")
    .select("regularPrice, discount")
    .eq("id", id)
    .single();

  // 必须抛错：静默返回 null 会让调用方算出 NaN，
  // 最后把 NaN 写进数据库，变成一条永远说不清的脏数据
  if (error) {
    console.error(error);
    throw new Error("小屋价格读取失败");
  }

  return data;
}

export const getCabins = async function () {
  const { data, error } = await supabase
    .from("cabins")
    .select(
      "id, name, maxCapacity, regularPrice, discount, image, avgRating, reviewCount"
    )
    .order("name");

  // For testing
  // await new Promise((res) => setTimeout(res, 2000));

  if (error) {
    console.error(error);
    throw new Error("Cabins could not be loaded");
  }

  return data;
};

// Guests are uniquely identified by their email address
export async function getGuest(email) {
  const { data, error } = await supabase
    .from("guests")
    .select("*")
    .eq("email", email)
    .single();

  // No error here! We handle the possibility of no guest in the sign in callback
  return data;
}

export async function getBooking(id) {
  const { data, error, count } = await supabase
    .from("bookings")
    .select("*")
    .eq("id", id)
    .single();

  if (error) {
    console.error(error);
    throw new Error("Booking could not get loaded");
  }

  return data;
}

export async function getBookings(guestId) {
  const { data, error, count } = await supabase
    .from("bookings")
    // We actually also need data on the cabins as well. But let's ONLY take the data that we actually need, in order to reduce downloaded data.
    .select(
      "id, created_at, startDate, endDate, numNights, numGuests, totalPrice, guestId, cabinId, cabins(name, image)"
    )
    .eq("guestId", guestId)
    .order("startDate");

  if (error) {
    console.error(error);
    throw new Error("Bookings could not get loaded");
  }

  return data;
}

export async function getBookedDatesByCabinId(cabinId) {
  let today = new Date();
  today.setUTCHours(0, 0, 0, 0);
  today = today.toISOString();

  // Getting all bookings
  const { data, error } = await supabase
    .from("bookings")
    .select("*")
    .eq("cabinId", cabinId)
    .or(`startDate.gte.${today},status.eq.checked-in`);

  if (error) {
    console.error(error);
    throw new Error("Bookings could not get loaded");
  }

  // Converting to actual dates to be displayed in the date picker
  const bookedDates = data
    .map((booking) => {
      return eachDayOfInterval({
        start: new Date(booking.startDate),
        end: new Date(booking.endDate),
      });
    })
    .flat();

  return bookedDates;
}

export async function getSettings() {
  const { data, error } = await supabase.from("settings").select("*").single();

  // await new Promise((res) => setTimeout(res, 5000));

  if (error) {
    console.error(error);
    throw new Error("Settings could not be loaded");
  }

  return data;
}

export async function getCountries() {
  // 原来这里 fetch "https://restcountries.com/v2/all?fields=name,flag"，
  // 但那个公开 API 已经失效了（返回 { success: false, data: null }），
  // 于是 countries 不是数组，SelectCountry 里的 .find() 就会炸。
  // 现在改成读项目里打包好的本地数据：不走网络，永远不会失败。
  //
  // 注意 flag 要给【图片网址】而不是 emoji：
  // UpdateProfileForm 里是 <img src={countryFlag} />，喂 emoji 会变成裂图。
  return countriesData.map(({ name, code }) => ({
    name,
    flag: `https://flagcdn.com/w40/${code.toLowerCase()}.png`,
  }));
}

/**
 * 一次查回校验优惠码所需的全部上下文。
 *
 * 为什么合成一个函数：校验要 4 样东西（券本身、总使用次数、本人是否用过、
 * 本人是否首单），分散查会有 4 次往返，也容易漏。
 *
 * 注意：查不到券时返回 coupon: null 而不是 throw —— "券不存在"是正常的业务结果，
 * 交给 validateCoupon 给出具体提示。
 */
export async function getCouponContext({ code, guestId }) {
  const normalizedCode = String(code ?? "")
    .trim()
    .toUpperCase();

  const { data: coupon, error } = await supabase
    .from("coupons")
    .select("*")
    .eq("code", normalizedCode)
    .maybeSingle();

  if (error) {
    console.error(error);
    throw new Error("优惠码查询失败");
  }

  if (!coupon) {
    return {
      coupon: null,
      usedCount: 0,
      usedByGuest: false,
      isFirstBooking: false,
    };
  }

  // 这张码总共被用过几次
  const { count: usedCount } = await supabase
    .from("coupon_redemptions")
    .select("*", { count: "exact", head: true })
    .eq("couponId", coupon.id);

  // 本人用过没有
  const { data: mine } = await supabase
    .from("coupon_redemptions")
    .select("id")
    .eq("couponId", coupon.id)
    .eq("guestId", guestId)
    .maybeSingle();

  // 本人有没有任何订单（用来判断"新客首单"）
  const { count: bookingCount } = await supabase
    .from("bookings")
    .select("*", { count: "exact", head: true })
    .eq("guestId", guestId);

  return {
    coupon,
    usedCount: usedCount ?? 0,
    usedByGuest: Boolean(mine),
    isFirstBooking: (bookingCount ?? 0) === 0,
  };
}

/** 当前用户已经评价过哪些订单（只要 id，够列表判断用了） */
export async function getReviewedBookingIds(guestId) {
  const { data, error } = await supabase
    .from("reviews")
    .select("bookingId")
    .eq("guestId", guestId);

  if (error) {
    console.error(error);
    throw new Error("评价记录读取失败");
  }

  return new Set((data ?? []).map((row) => Number(row.bookingId)));
}

/** 查某笔订单有没有被评价过（有就带出内容，用于"查看我的评价"） */
export async function getReviewByBookingId(bookingId) {
  const { data, error } = await supabase
    .from("reviews")
    .select("id, rating, comment, created_at")
    .eq("bookingId", bookingId)
    .maybeSingle();

  if (error) {
    console.error(error);
    throw new Error("评价查询失败");
  }

  return data;
}

/** 一间小屋的评价列表，最新的在前（评价人信息从 guests 关联取最新值） */
export async function getCabinReviews(cabinId, limit = 5) {
  const { data, error } = await supabase
    .from("reviews")
    .select("id, rating, comment, created_at, guests(fullName, countryFlag)")
    .eq("cabinId", cabinId)
    .order("created_at", { ascending: false })
    .limit(limit);

  if (error) {
    console.error(error);
    throw new Error("评价读取失败");
  }

  return data ?? [];
}

/////////////
// CREATE

export async function createGuest(newGuest) {
  const { data, error } = await supabase.from("guests").insert([newGuest]);

  if (error) {
    console.error(error);
    throw new Error("Guest could not be created");
  }

  return data;
}
/*
export async function createBooking(newBooking) {
  const { data, error } = await supabase
    .from("bookings")
    .insert([newBooking])
    // So that the newly created object gets returned!
    .select()
    .single();

  if (error) {
    console.error(error);
    throw new Error("Booking could not be created");
  }

  return data;
}
*/
/////////////
// UPDATE

/*
// The updatedFields is an object which should ONLY contain the updated data
export async function updateGuest(id, updatedFields) {
  const { data, error } = await supabase
    .from("guests")
    .update(updatedFields)
    .eq("id", id)
    .select()
    .single();

  if (error) {
    console.error(error);
    throw new Error("Guest could not be updated");
  }
  return data;
}

export async function updateBooking(id, updatedFields) {
  const { data, error } = await supabase
    .from("bookings")
    .update(updatedFields)
    .eq("id", id)
    .select()
    .single();

  if (error) {
    console.error(error);
    throw new Error("Booking could not be updated");
  }
  return data;
}

/////////////
// DELETE

export async function deleteBooking(id) {
  const { data, error } = await supabase.from("bookings").delete().eq("id", id);

  if (error) {
    console.error(error);
    throw new Error("Booking could not be deleted");
  }
  return data;
}
*/
