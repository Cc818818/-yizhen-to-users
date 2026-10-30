/**
 * 日期冲突判断（纯函数）
 *
 * 为什么按"哪一天"比较，而不是比时间戳：
 * 数据库里 startDate 存的是 timestamptz（一个瞬间），用户点日历点的是"某一天"。
 * 直接比时间戳会因为时区差几个小时而永远不相等，必须归一化成"年月日"再比。
 *
 * ⚠️ 已知限制：
 * 这里用的是服务器本地时区来归一化。本地开发（客户端和服务器同一台机器）没问题；
 * 但如果部署到 UTC 时区的服务器，而用户在东八区，可能出现错一天。
 * 彻底的做法是把日期存成 date 类型、前端传 "YYYY-MM-DD" 字符串。
 * （记在 PROJECT_RULES 里，部署阶段再处理）
 */

const pad = (n) => String(n).padStart(2, "0");

/** 把一个日期归一化成 "2026-11-03" 这种"日"级别的键 */
export function toDayKey(date) {
  const d = new Date(date);
  return `${d.getFullYear()}-${pad(d.getMonth() + 1)}-${pad(d.getDate())}`;
}

/**
 * 找出请求的住宿区间里，哪些天已经被别人订走了。
 *
 * 区间是【含头含尾】的，和日历的判定保持一致：
 * getBookedDatesByCabinId 用 eachDayOfInterval(start, end)，退房那天也算占用。
 * 两边必须用同一个定义，否则会出现"日历上能选、提交却报错"这种自相矛盾。
 *
 * @param {object}   params
 * @param {Date[]}   [params.bookedDates=[]] 已被占用的日期（可含重复，无所谓）
 * @param {Date}     params.startDate        入住日
 * @param {Date}     params.endDate          退房日
 * @returns {Date[]} 冲突的日期列表，空数组表示没有冲突
 */
export function findConflictDays({ bookedDates = [], startDate, endDate }) {
  const start = new Date(startDate);
  const end = new Date(endDate);

  // 日期本身不合法或者顺序颠倒，交给调用方去报错，这里不做判断
  if (Number.isNaN(start.getTime()) || Number.isNaN(end.getTime())) return [];
  if (end < start) return [];

  const booked = new Set(bookedDates.map(toDayKey));
  const conflicts = [];

  const cursor = new Date(start);
  while (cursor <= end) {
    if (booked.has(toDayKey(cursor))) conflicts.push(new Date(cursor));
    cursor.setDate(cursor.getDate() + 1);
  }

  return conflicts;
}
