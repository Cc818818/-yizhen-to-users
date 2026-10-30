/*import { NextResponse } from "next/server";

export function middleware(request) {
  console.log(request);

  return NextResponse.redirect(new URL("/about", request.url));
}*/

import { auth } from "@/app/_lib/auth";
export const middleware = auth;

export const config = {
  // 原来只写了 ["/account"]，那样只保护入口页本身，
  // 直接输入 /account/profile 或 /account/reservations 会绕过 middleware，
  // 未登录时页面里 session.user 为 null 直接崩掉。
  // 加上子路径通配，账户区所有页面都走这道门。
  matcher: ["/account", "/account/:path*"],
};
