/**
 * 优惠码校验（纯函数）
 *
 * 为什么是纯函数：
 * 1. 前端"应用"时要用它做预览，服务端下单时要用它做真正的判定，
 *    两边必须是同一份实现，否则用户看到的折扣和实际扣的不一致。
 * 2. 不查数据库：调用方先把所需数据查好再喂进来，这样可以直接写单元测试。
 *
 * 校验顺序是有意设计的：先做"便宜且最可能失败"的判断，
 * 并且每条失败都给一句具体的话——用户最烦的就是"优惠码无效"四个字。
 */

/**
 * @param {object}  params
 * @param {object|null} params.coupon      优惠码记录，查不到时传 null
 * @param {number}  params.numNights       住几晚
 * @param {number}  params.basePrice       订单金额（不含优惠码）
 * @param {number}  [params.usedCount=0]   这张码总共被用过几次
 * @param {boolean} [params.usedByGuest=false]  当前用户是否用过这张码
 * @param {boolean} [params.isFirstBooking=false] 当前用户是否还没有任何订单
 * @param {Date}    [params.now=new Date()] 当前时间（测试时注入，避免依赖真实时钟）
 * @returns {{ ok: true, discountAmount: number } | { ok: false, reason: string }}
 */
export function validateCoupon({
  coupon,
  numNights,
  basePrice,
  usedCount = 0,
  usedByGuest = false,
  isFirstBooking = false,
  now = new Date(),
}) {
  if (!coupon) return { ok: false, reason: "优惠码不存在" };

  if (!coupon.isActive) return { ok: false, reason: "这个优惠码已停用" };

  if (coupon.validFrom && now < new Date(coupon.validFrom))
    return { ok: false, reason: "这个优惠码还没到使用时间" };

  if (coupon.validTo && now > new Date(coupon.validTo))
    return { ok: false, reason: "这个优惠码已过期" };

  if (coupon.maxUses != null && usedCount >= coupon.maxUses)
    return { ok: false, reason: "这个优惠码已经被用完了" };

  if (usedByGuest) return { ok: false, reason: "你已经用过这个优惠码了" };

  if (coupon.firstBookingOnly && !isFirstBooking)
    return { ok: false, reason: "这个优惠码仅限首次预订使用" };

  if (numNights < coupon.minNights)
    return { ok: false, reason: `这个优惠码需要连住 ${coupon.minNights} 晚` };

  if (basePrice < coupon.minPrice)
    return { ok: false, reason: `订单需满 ${coupon.minPrice} 元才能使用` };

  const rawDiscount =
    coupon.discountType === "percent"
      ? Math.round((basePrice * coupon.value) / 100)
      : coupon.value;

  // 封顶：折扣不能超过订单金额，否则总价会变成负数
  const discountAmount = Math.max(0, Math.min(rawDiscount, basePrice));

  return { ok: true, discountAmount };
}
