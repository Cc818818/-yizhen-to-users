import { describe, it, expect } from "vitest";
import { findConflictDays, toDayKey } from "../app/_lib/date-conflicts.js";

/**
 * 校验和日历必须用同一套"占用日期"定义（含头含尾），
 * 所以这里重点钉住边界：首日、中间、尾日。
 */

const day = (s) => new Date(`${s}T00:00:00`);

describe("toDayKey", () => {
  it("归一化成年月日，且补零", () => {
    expect(toDayKey(day("2026-01-05"))).toBe("2026-01-05");
    expect(toDayKey(day("2026-11-30"))).toBe("2026-11-30");
  });
});

describe("findConflictDays", () => {
  it("没有已订日期时，不冲突", () => {
    const conflicts = findConflictDays({
      bookedDates: [],
      startDate: day("2026-11-03"),
      endDate: day("2026-11-06"),
    });

    expect(conflicts).toEqual([]);
  });

  it("区间完全不重叠时，不冲突", () => {
    const conflicts = findConflictDays({
      bookedDates: [day("2026-12-01"), day("2026-12-02")],
      startDate: day("2026-11-03"),
      endDate: day("2026-11-06"),
    });

    expect(conflicts).toEqual([]);
  });

  it("边界：入住当天已被占", () => {
    const conflicts = findConflictDays({
      bookedDates: [day("2026-11-03")],
      startDate: day("2026-11-03"),
      endDate: day("2026-11-06"),
    });

    expect(conflicts.map(toDayKey)).toEqual(["2026-11-03"]);
  });

  it("边界：退房当天已被占（因为区间含头含尾）", () => {
    const conflicts = findConflictDays({
      bookedDates: [day("2026-11-06")],
      startDate: day("2026-11-03"),
      endDate: day("2026-11-06"),
    });

    expect(conflicts.map(toDayKey)).toEqual(["2026-11-06"]);
  });

  it("中间某天被占，只报那一天", () => {
    const conflicts = findConflictDays({
      bookedDates: [day("2026-11-04")],
      startDate: day("2026-11-03"),
      endDate: day("2026-11-06"),
    });

    expect(conflicts.map(toDayKey)).toEqual(["2026-11-04"]);
  });

  it("多天冲突全部报出，且按日期升序", () => {
    const conflicts = findConflictDays({
      bookedDates: [day("2026-11-07"), day("2026-11-04"), day("2026-11-05")],
      startDate: day("2026-11-03"),
      endDate: day("2026-11-08"),
    });

    expect(conflicts.map(toDayKey)).toEqual([
      "2026-11-04",
      "2026-11-05",
      "2026-11-07",
    ]);
  });

  it("已订日期里有重复也不会误报", () => {
    const conflicts = findConflictDays({
      bookedDates: [day("2026-11-04"), day("2026-11-04")],
      startDate: day("2026-11-03"),
      endDate: day("2026-11-06"),
    });

    expect(conflicts.map(toDayKey)).toEqual(["2026-11-04"]);
  });
});
