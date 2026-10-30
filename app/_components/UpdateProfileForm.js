"use client";

import { useState } from "react";
import { updateGuest } from "../_lib/actions";
import { isValidNationalID, NATIONAL_ID_HINT } from "../_lib/validation";
import SubmitButton from "./SubmitButton";

function UpdateProfileForm({ guest, children }) {
  const { fullName, email, nationalID, countryFlag } = guest;

  // 受控输入：为了让用户在点提交之前就能看到格式错误
  const [nationalIDInput, setNationalIDInput] = useState(nationalID ?? "");

  // 和 Server Action 用同一个校验函数，避免两边规则漂移
  const nationalIDValid = isValidNationalID(nationalIDInput);
  const showError = nationalIDInput.length > 0 && !nationalIDValid;

  return (
    <form
      action={updateGuest}
      className="bg-primary-900 py-8 px-12 text-lg flex gap-6 flex-col"
    >
      <div className="space-y-2">
        <label>Full name</label>
        <input
          disabled
          defaultValue={fullName}
          name="fullName"
          className="px-5 py-3 bg-primary-200 text-primary-800 w-full shadow-sm rounded-sm disabled:cursor-not-allowed disabled:bg-gray-600 disabled:text-gray-400"
        />
      </div>

      <div className="space-y-2">
        <label>Email address</label>
        <input
          disabled
          defaultValue={email}
          name="email"
          className="px-5 py-3 bg-primary-200 text-primary-800 w-full shadow-sm rounded-sm disabled:cursor-not-allowed disabled:bg-gray-600 disabled:text-gray-400"
        />
      </div>

      <div className="space-y-2">
        <div className="flex items-center justify-between">
          <label htmlFor="nationality">Where are you from?</label>
          {countryFlag && (
            <img
              src={countryFlag}
              alt="Country flag"
              className="h-5 rounded-sm"
            />
          )}
        </div>

        {children}
      </div>

      <div className="space-y-2">
        <label htmlFor="nationalID">National ID number</label>
        <input
          value={nationalIDInput}
          onChange={(e) => setNationalIDInput(e.target.value)}
          name="nationalID"
          className="px-5 py-3 bg-primary-200 text-primary-800 w-full shadow-sm rounded-sm"
        />
        <p className={`text-base ${showError ? "text-red-400" : "text-primary-300"}`}>
          {NATIONAL_ID_HINT}
        </p>
      </div>

      <div className="flex justify-end items-center gap-6">
        {/* 客户端先挡一道，只为体验；服务端仍会再校验一次，那才是防线 */}
        <SubmitButton pendingLabel="Updating..." disabled={!nationalIDValid}>
          Update profile
        </SubmitButton>
      </div>
    </form>
  );
}

export default UpdateProfileForm;
