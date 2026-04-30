"use client";

import React, { forwardRef } from "react";

interface ZodiacInputProps extends React.InputHTMLAttributes<HTMLInputElement> {}

export const ZodiacInput = forwardRef<HTMLInputElement, ZodiacInputProps>(
  ({ className, ...props }, ref) => {
    return (
      <div className="zodiac-focus-container w-full">
        <input
          ref={ref}
          {...props}
          className={`zodiac-input ${className || ""}`}
          autoComplete="off"
        />
        <div className="zodiac-focus-underline" />
      </div>
    );
  },
);

ZodiacInput.displayName = "ZodiacInput";
