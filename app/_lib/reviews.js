/**
 * 评价相关的业务规则（纯函数）
 *
 * 抽出来的原因和优惠码一样：
 * 1. 页面要用它来决定"显示不显示写评价按钮"
 * 2. Server Action 要用它来决定"允不允许真的写入"
 * 两边必须是同一份判断，否则会出现"按钮能点、提交却报错"。
 */

/**
 * 判断一笔订单能不能写评价。
 *
 * 四条规则（顺序有讲究：先查便宜的、先查最可能是攻击的）：
 *   ① 订单存在
 *   ② 是你的订单        ← 授权，防越权
 *   ③ 已经退房了        ← 真的住过
 *   ④ 还没评价过        ← 一单一次（数据库还有唯一约束兜底）
 *
 * @param {object}  params
 * @param {object|null} params.booking    订单记录
 * @param {number}  params.guestId        当前登录用户的 guestId
 * @param {boolean} [params.hasReviewed=false] 是否已有评价记录
 * @param {Date}    [params.today=new Date()] 当前时间（测试注入）
 * @returns {{ ok: true } | { ok: false, reason: string }}
 */
export function canReview({
  booking,
  guestId,
  hasReviewed = false,
  today = new Date(),
}) {
  if (!booking) return { ok: false, reason: "订单不存在" };

  // 身份拿不到时必须单独报出来。
  // 否则会走进下面的"不是你的订单"，让用户以为自己点错了，实际是登录态出了问题。
  if (guestId == null)
    return { ok: false, reason: "无法确认你的身份，请重新登录后再试" };

  if (Number(booking.guestId) !== Number(guestId))
    return { ok: false, reason: "这不是你的订单" };

  if (hasReviewed) return { ok: false, reason: "你已经评价过这笔订单了" };

  const endDay = new Date(booking.endDate);
  if (Number.isNaN(endDay.getTime()))
    return { ok: false, reason: "订单日期异常" };

  endDay.setHours(0, 0, 0, 0);
  const todayDay = new Date(today);
  todayDay.setHours(0, 0, 0, 0);

  // 退房当天就允许评价，所以用 ">" 而不是 ">="
  if (endDay > todayDay) return { ok: false, reason: "退房之后才能评价" };

  return { ok: true };
}

/**
 * 算一间小屋的评分统计。
 *
 * 平均分保留一位小数（4.75 → 4.8），因为界面上只显示一位。
 * 传进来的评分里如果有非法值（null、0、6），直接忽略，
 * 不让一条脏数据把整间小屋的评分拉歪。
 *
 * @param {Array<number>} ratings
 * @returns {{ avgRating: number|null, reviewCount: number }}
 */
export function calcRatingStats(ratings = []) {
  const valid = (ratings ?? []).filter(
    (r) => Number.isInteger(r) && r >= 1 && r <= 5
  );

  if (valid.length === 0) return { avgRating: null, reviewCount: 0 };

  const sum = valid.reduce((acc, r) => acc + r, 0);
  const avgRating = Math.round((sum / valid.length) * 10) / 10;

  return { avgRating, reviewCount: valid.length };
}
