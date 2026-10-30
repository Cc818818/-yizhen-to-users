"use client";

import { useFormStatus } from "react-dom";

export default function SubmitButton({ children, pendingLabel, disabled }) {
  const { pending } = useFormStatus();

  return (
    <button
      className="pill pill-solid px-7 py-3.5 disabled:cursor-not-allowed disabled:opacity-40"
      disabled={pending || disabled}
    >
      {pending ? pendingLabel : children}
    </button>
  );
}
