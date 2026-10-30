"use client";

/**
 * 优惠码输入区（纯展示组件）
 *
 * 状态和请求逻辑都放在父组件 ReservationForm 里，
 * 这样"应用的结果"和"价格汇总"用的是同一份数据，不会各算各的。
 */
export default function CouponField({
  code,
  onCodeChange,
  onApply,
  result,
  pending,
  disabled,
}) {
  return (
    <div className="space-y-2">
      <label htmlFor="couponCode" className="block text-sm text-primary-400">
        Promo code
      </label>

      <div className="flex gap-3">
        <input
          id="couponCode"
          name="couponCode"
          value={code}
          onChange={(e) => onCodeChange(e.target.value)}
          disabled={disabled}
          placeholder="WELCOME10"
          autoComplete="off"
          className="field uppercase placeholder:normal-case disabled:cursor-not-allowed"
        />

        <button
          type="button"
          onClick={onApply}
          disabled={disabled || pending || !code.trim()}
          className="pill pill-ghost shrink-0 !py-3 disabled:cursor-not-allowed disabled:opacity-40"
        >
          {pending ? "Checking..." : "Apply"}
        </button>
      </div>

      {result?.ok && (
        <p className="text-sm text-[#9ad19a]">
          Promo applied — you save ${result.discountAmount}
        </p>
      )}

      {result && !result.ok && (
        <p className="text-sm text-[#e0a0a0]">{result.reason}</p>
      )}
    </div>
  );
}
