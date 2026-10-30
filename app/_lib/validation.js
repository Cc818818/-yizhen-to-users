/**
 * 表单校验规则（前后端共用）
 *
 * 为什么抽出来：客户端为了体验要提前校验，服务端为了安全必须再校验一遍。
 * 如果两边各写一份正则，改规则时一定会有一边忘了改，于是出现
 * "客户端说没问题、服务端却拒绝" 这种谁也看不懂的 bug。
 *
 * ⚠️ 客户端那一份只是为了体验，可以被绕过；服务端那一份才是防线。
 */

/** 身份证 / 护照号：6~12 位字母或数字 */
const NATIONAL_ID_PATTERN = /^[a-zA-Z0-9]{6,12}$/;

export function isValidNationalID(value) {
  return NATIONAL_ID_PATTERN.test(String(value ?? "").trim());
}

export const NATIONAL_ID_HINT = "身份证号需为 6~12 位字母或数字";
