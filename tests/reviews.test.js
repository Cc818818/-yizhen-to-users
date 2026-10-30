import { describe, it, expect } from "vitest";
import { canReview, calcRatingStats } from "../app/_lib/reviews.js";

const TODAY = new Date("2026-06-15T10:00:00");

const booking = (overrides = {}) => ({
  id: 1,
  guestId: 74,
  cabinId: 11,
  startDate: "2026-06-01T00:00:00+00:00",
  endDate: "2026-06-05T00:00:00+00:00",
  ...overrides,
});

describe("canReview", () => {
  it("正常：自己的订单、已退房、没评过", () => {
    expect(
      canReview({ booking: booking(), guestId: 74, today: TODAY })
    ).toEqual({ ok: true });
  });

  it("订单不存在", () => {
    expect(canReview({ booking: null, guestId: 74, today: TODAY })).toEqual({
      ok: false,
      reason: "订单不存在",
    });
  });

  it("别人的订单（越权）", () => {
    expect(
      canReview({ booking: booking(), guestId: 999, today: TODAY })
    ).toEqual({ ok: false, reason: "这不是你的订单" });
  });

  it("已经评价过", () => {
    expect(
      canReview({
        booking: booking(),
        guestId: 74,
        hasReviewed: true,
        today: TODAY,
      })
    ).toEqual({ ok: false, reason: "你已经评价过这笔订单了" });
  });

  it("还没退房", () => {
    expect(
      canReview({
        booking: booking({ endDate: "2026-07-01T00:00:00+00:00" }),
        guestId: 74,
        today: TODAY,
      })
    ).toEqual({ ok: false, reason: "退房之后才能评价" });
  });

  it("边界：今天就是退房日，允许评价", () => {
    expect(
      canReview({
        booking: booking({ endDate: "2026-06-15T00:00:00+00:00" }),
        guestId: 74,
        today: TODAY,
      })
    ).toEqual({ ok: true });
  });
});

describe("calcRatingStats", () => {
  it("没有评价时返回 null 和 0", () => {
    expect(calcRatingStats([])).toEqual({ avgRating: null, reviewCount: 0 });
  });

  it("平均分保留一位小数：4.75 -> 4.8", () => {
    expect(calcRatingStats([5, 5, 5, 4])).toEqual({
      avgRating: 4.8,
      reviewCount: 4,
    });
  });

  it("整数平均分", () => {
    expect(calcRatingStats([5, 5, 4, 4])).toEqual({
      avgRating: 4.5,
      reviewCount: 4,
    });
  });

  it("忽略非法评分，不把整体拉歪", () => {
    expect(calcRatingStats([5, 4, null, 0, 6, undefined])).toEqual({
      avgRating: 4.5,
      reviewCount: 2,
    });
  });
});
