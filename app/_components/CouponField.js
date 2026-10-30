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
      <label htmlFor="couponCode">Promo code</label>

      <div className="flex gap-3">
        <input
          id="couponCode"
          name="couponCode"
          value={code}
          onChange={(e) => onCodeChange(e.target.value)}
          disabled={disabled}
          placeholder="WELCOME10"
          autoComplete="off"
          className="px-5 py-3 bg-primary-200 text-primary-800 w-full shadow-sm rounded-sm uppercase placeholder:text-primary-700 disabled:cursor-not-allowed disabled:bg-gray-600 disabled:text-gray-400"
        />

        <button
          type="button"
          onClick={onApply}
          disabled={disabled || pending || !code.trim()}
          className="shrink-0 bg-accent-500 px-6 py-3 text-primary-800 font-semibold hover:bg-accent-600 transition-all disabled:cursor-not-allowed disabled:bg-gray-500 disabled:text-gray-300"
        >
          {pending ? "Checking..." : "Apply"}
        </button>
      </div>

      {result?.ok && (
        <p className="text-green-400 text-base">
          Promo applied — you save ${result.discountAmount}
        </p>
      )}

      {result && !result.ok && (
        <p className="text-red-400 text-base">{result.reason}</p>
      )}
    </div>
  );
}
