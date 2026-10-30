"use client";

import { useState } from "react";
import { createReview } from "../_lib/actions";
import SubmitButton from "./SubmitButton";

/**
 * 写评价表单
 *
 * 星级选择器就是最朴素的 useState + map：
 * 点第 n 颗星就 setRating(n)，然后 n <= rating 的星星显示实心。
 * hovered 只是为了鼠标悬停时"预览"打几分，不是必需的。
 */
export default function ReviewForm({ bookingId, cabinName }) {
  const [rating, setRating] = useState(0);
  const [hovered, setHovered] = useState(0);

  const shown = hovered || rating;

  return (
    <form
      action={createReview}
      className="bg-primary-900 py-8 px-12 text-lg flex gap-6 flex-col"
    >
      <input type="hidden" name="bookingId" value={bookingId} />
      {/* 星星的状态存在 React 里，提交时靠这个隐藏域带过去 */}
      <input type="hidden" name="rating" value={rating} />

      <div className="space-y-3">
        <p>How was your stay at Cabin {cabinName}?</p>

        <div className="flex gap-2" onMouseLeave={() => setHovered(0)}>
          {[1, 2, 3, 4, 5].map((n) => (
            <button
              type="button"
              key={n}
              onClick={() => setRating(n)}
              onMouseEnter={() => setHovered(n)}
              aria-label={`${n} star${n > 1 ? "s" : ""}`}
              className={`text-4xl leading-none transition-colors ${
                n <= shown ? "text-accent-400" : "text-primary-600"
              }`}
            >
              ★
            </button>
          ))}
        </div>

        <p className="text-base text-primary-300">
          {rating === 0
            ? "点星星打分（1 = 很差，5 = 非常好）"
            : `你打了 ${rating} 星`}
        </p>
      </div>

      <div className="space-y-2">
        <label htmlFor="comment">Anything you want to share?</label>
        <textarea
          name="comment"
          id="comment"
          rows={4}
          maxLength={1000}
          placeholder="What did you like? What could be better?"
          className="px-5 py-3 bg-primary-200 text-primary-800 w-full shadow-sm rounded-sm"
        />
      </div>

      <div className="flex justify-end">
        {/* 没打分就不让提交，客户端先挡一次；服务端还会再校验 */}
        <SubmitButton pendingLabel="Submitting..." disabled={rating === 0}>
          Submit review
        </SubmitButton>
      </div>
    </form>
  );
}
