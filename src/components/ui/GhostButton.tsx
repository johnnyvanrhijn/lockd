import { forwardRef } from "react";
import { Button, type ButtonProps } from "./Button";

export type GhostButtonProps = Omit<ButtonProps, "variant">;

export const GhostButton = forwardRef<HTMLButtonElement, GhostButtonProps>(
  function GhostButton(props, ref) {
    return <Button ref={ref} variant="ghost" {...props} />;
  },
);

export default GhostButton;
