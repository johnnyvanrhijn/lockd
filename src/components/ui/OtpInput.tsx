"use client";

import {
  useEffect,
  useId,
  useRef,
  type ClipboardEvent,
  type KeyboardEvent,
} from "react";
import { cn } from "@/lib/utils/cn";

type OtpInputProps = {
  length?: number;
  value: string;
  onChange: (next: string) => void;
  onComplete?: (code: string) => void;
  disabled?: boolean;
  error?: boolean;
  autoFocus?: boolean;
  className?: string;
};

/**
 * 6-digit OTP input. Renders one cell per digit with native auto-advance
 * and paste support. Value is the joined digit string; cells are visual.
 */
export function OtpInput({
  length = 6,
  value,
  onChange,
  onComplete,
  disabled,
  error,
  autoFocus,
  className,
}: OtpInputProps) {
  const groupId = useId();
  const refs = useRef<Array<HTMLInputElement | null>>([]);

  useEffect(() => {
    if (autoFocus) refs.current[0]?.focus();
  }, [autoFocus]);

  const digits = Array.from({ length }, (_, i) => value[i] ?? "");

  function setDigit(index: number, digit: string) {
    const cleaned = digit.replace(/\D/g, "").slice(0, 1);
    const next = digits.slice();
    next[index] = cleaned;
    const joined = next.join("").slice(0, length);
    onChange(joined);
    if (cleaned && index < length - 1) {
      refs.current[index + 1]?.focus();
    }
    if (joined.length === length && onComplete) {
      onComplete(joined);
    }
  }

  function handleKeyDown(
    event: KeyboardEvent<HTMLInputElement>,
    index: number,
  ) {
    if (event.key === "Backspace" && !digits[index] && index > 0) {
      event.preventDefault();
      refs.current[index - 1]?.focus();
      const next = digits.slice();
      next[index - 1] = "";
      onChange(next.join(""));
    } else if (event.key === "ArrowLeft" && index > 0) {
      event.preventDefault();
      refs.current[index - 1]?.focus();
    } else if (event.key === "ArrowRight" && index < length - 1) {
      event.preventDefault();
      refs.current[index + 1]?.focus();
    }
  }

  function handlePaste(event: ClipboardEvent<HTMLInputElement>) {
    const pasted = event.clipboardData.getData("text").replace(/\D/g, "");
    if (!pasted) return;
    event.preventDefault();
    const trimmed = pasted.slice(0, length);
    onChange(trimmed);
    const focusIndex = Math.min(trimmed.length, length - 1);
    refs.current[focusIndex]?.focus();
    if (trimmed.length === length && onComplete) onComplete(trimmed);
  }

  return (
    <div
      role="group"
      aria-label="Inlogcode"
      className={cn("flex items-center justify-between gap-2", className)}
    >
      {digits.map((digit, index) => (
        <input
          key={`${groupId}-${index}`}
          ref={(el) => {
            refs.current[index] = el;
          }}
          type="text"
          inputMode="numeric"
          autoComplete={index === 0 ? "one-time-code" : "off"}
          maxLength={1}
          pattern="\d"
          value={digit}
          disabled={disabled}
          onChange={(e) => setDigit(index, e.target.value)}
          onKeyDown={(e) => handleKeyDown(e, index)}
          onPaste={handlePaste}
          onFocus={(e) => e.currentTarget.select()}
          aria-label={`Cijfer ${index + 1}`}
          className={cn(
            "h-14 w-11 text-center text-2xl font-semibold tracking-tight",
            "rounded-[var(--radius-sm)] border bg-surface-elevated/70 backdrop-blur-xl text-foreground",
            "transition-colors duration-150",
            "focus:outline-none focus:border-purple focus:ring-2 focus:ring-purple-bright/70 focus:ring-offset-2 focus:ring-offset-background",
            "disabled:opacity-50",
            error
              ? "border-danger/60"
              : digit
                ? "border-purple/60"
                : "border-[var(--color-border)]",
          )}
        />
      ))}
    </div>
  );
}

export default OtpInput;
