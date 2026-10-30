import { describe, it, expect } from "vitest";
import { validateCoupon } from "../app/_lib/coupons.js";

/**
 * validateCoupon 有 9 条规则 + 2 种折扣类型 + 1 个封顶，
 * 是整个项目分支最多的函数。这里把每条分支各钉一个用例。
 */

const NOW = new Date("2026-06-15T12:00:00Z");

function makeCoupon(overrides = {}) {
  return {
    id: 1,
    code: "TEST",
    discountType: "percent",
    value: 10,
    minNights: 0,
    minPrice: 0,
    firstBookingOnly: false,
    maxUses: null,
    validFrom: null,
    validTo: null,
    isActive: true,
    ...overrides,
  };
}

function run(couponOverrides = {}, ctxOverrides = {}) {
  return validateCoupon({
    coupon: makeCoupon(couponOverrides),
    numNights: 3,
    basePrice: 1000,
    usedCount: 0,
    usedByGuest: false,
    isFirstBooking: true,
    now: NOW,
    ...ctxOverrides,
  });
}

describe("validateCoupon", () => {
  it("查不到这张码", () => {
    const result = run({}, { coupon: null });
    // run() 里的 coupon 覆盖会被 ...ctxOverrides 盖住
    expect(result).toEqual({ ok: false, reason: "优惠码不存在" });
  });

  it("百分比折扣：1000 元的 10% = 100", () => {
    expect(run({ discountType: "percent", value: 10 })).toEqual({
      ok: true,
      discountAmount: 100,
    });
  });

  it("固定金额折扣：直接减 100", () => {
    expect(run({ discountType: "fixed", value: 100 })).toEqual({
      ok: true,
      discountAmount: 100,
    });
  });

  it("百分比折扣四舍五入：975 的 10% = 97.5 → 98", () => {
    expect(run({ value: 10 }, { basePrice: 975 })).toEqual({
      ok: true,
      discountAmount: 98,
    });
  });

  it("封顶：固定减 5000 不能超过订单金额 1000", () => {
    expect(run({ discountType: "fixed", value: 5000 })).toEqual({
      ok: true,
      discountAmount: 1000,
    });
  });

  it("已停用", () => {
    expect(run({ isActive: false })).toEqual({
      ok: false,
      reason: "这个优惠码已停用",
    });
  });

  it("还没到开始时间", () => {
    const nextMonth = new Date("2026-07-01T00:00:00Z");
    expect(run({ validFrom: nextMonth })).toEqual({
      ok: false,
      reason: "这个优惠码还没到使用时间",
    });
  });

  it("已过期", () => {
    expect(run({ validTo: new Date("2020-12-31T00:00:00Z") })).toEqual({
      ok: false,
      reason: "这个优惠码已过期",
    });
  });

  it("总次数用完", () => {
    expect(run({ maxUses: 5 }, { usedCount: 5 })).toEqual({
      ok: false,
      reason: "这个优惠码已经被用完了",
    });
  });

  it("本人已经用过", () => {
    expect(run({}, { usedByGuest: true })).toEqual({
      ok: false,
      reason: "你已经用过这个优惠码了",
    });
  });

  it("限首单，但已经有订单", () => {
    expect(run({ firstBookingOnly: true }, { isFirstBooking: false })).toEqual({
      ok: false,
      reason: "这个优惠码仅限首次预订使用",
    });
  });

  it("晚数不够", () => {
    expect(run({ minNights: 5 }, { numNights: 3 })).toEqual({
      ok: false,
      reason: "这个优惠码需要连住 5 晚",
    });
  });

  it("金额不够门槛", () => {
    expect(run({ minPrice: 2000 }, { basePrice: 1000 })).toEqual({
      ok: false,
      reason: "订单需满 2000 元才能使用",
    });
  });
});
