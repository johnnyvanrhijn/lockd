import { forwardRef } from "react";
import { Button, type ButtonProps } from "./Button";

export type PrimaryButtonProps = Omit<ButtonProps, "variant">;

/**
 * Thin convenience wrapper around <Button variant="primary"> for ergonomics
 * at call sites. Use Button directly when you need to vary the variant
 * dynamically.
 */
export const PrimaryButton = forwardRef<HTMLButtonElement, PrimaryButtonProps>(
  function PrimaryButton(props, ref) {
    return <Button ref={ref} variant="primary" {...props} />;
  },
);

export default PrimaryButton;
