import { describe, it, expect } from "vitest";
import { computeStayPrice } from "../app/_lib/pricing.js";

/**
 * computeStayPrice 是"前端显示"和"服务端计价"共用的唯一实现，
 * 所以它算错 = 用户看到的价和实际扣的价都会错。这里把它钉死。
 */
describe("computeStayPrice", () => {
  it("有小屋自带折扣时：每晚实付 = 标价 - 立减", () => {
    const result = computeStayPrice({
      regularPrice: 350,
      discount: 50,
      numNights: 3,
    });

    expect(result.nightlyRate).toBe(300);
    expect(result.cabinPrice).toBe(900);
  });

  it("没有折扣时：每晚实付 = 标价", () => {
    const result = computeStayPrice({
      regularPrice: 250,
      discount: 0,
      numNights: 5,
    });

    expect(result.nightlyRate).toBe(250);
    expect(result.cabinPrice).toBe(1250);
  });

  it("边界：discount 缺省时按 0 处理，不能算出 NaN", () => {
    const result = computeStayPrice({ regularPrice: 300, numNights: 2 });

    expect(result.nightlyRate).toBe(300);
    expect(result.cabinPrice).toBe(600);
    expect(Number.isNaN(result.cabinPrice)).toBe(false);
  });

  it("边界：住 1 晚", () => {
    const result = computeStayPrice({
      regularPrice: 400,
      discount: 50,
      numNights: 1,
    });

    expect(result.cabinPrice).toBe(350);
  });

  it("边界：晚数为 0 时价格为 0（是否需要拒绝由调用方判断）", () => {
    const result = computeStayPrice({
      regularPrice: 350,
      discount: 25,
      numNights: 0,
    });

    expect(result.cabinPrice).toBe(0);
  });
});
