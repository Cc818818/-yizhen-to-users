/**
 * 住宿金额计算（纯函数）
 *
 * 为什么单独放一个文件：
 * 1. 前端要用它显示价格，Server Action 要用它做真正的计价。
 *    两边必须是同一个实现，否则"用户看到的"和"实际写进数据库的"会不一致。
 * 2. 不读数据库、不碰网络、不依赖当前时间 → 可以直接写单元测试。
 */

/**
 * 计算一次住宿的金额。
 *
 * @param {object} params
 * @param {number} params.regularPrice  每晚标价
 * @param {number} [params.discount=0]  这间小屋自带的每晚立减
 * @param {number} params.numNights     住几晚
 * @returns {{ nightlyRate: number, cabinPrice: number }}
 *          nightlyRate 每晚实付价，cabinPrice 住宿总价（不含优惠码）
 */
export function computeStayPrice({ regularPrice, discount = 0, numNights }) {
  const nightlyRate = regularPrice - discount;
  const cabinPrice = numNights * nightlyRate;

  return { nightlyRate, cabinPrice };
}
