import type { ButtonHTMLAttributes, ReactNode } from "react";
import { cn } from "@/lib/utils/cn";

type NavItemProps = ButtonHTMLAttributes<HTMLButtonElement> & {
  icon: ReactNode;
  label: ReactNode;
  active?: boolean;
};

export function NavItem({
  icon,
  label,
  active = false,
  className,
  type = "button",
  ...rest
}: NavItemProps) {
  return (
    <button
      {...rest}
      type={type}
      aria-current={active ? "page" : undefined}
      className={cn(
        "group relative flex flex-1 flex-col items-center justify-center gap-1",
        "py-2 transition-colors duration-150",
        "focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-purple-bright/70 rounded-[var(--radius-sm)]",
        active ? "text-foreground" : "text-muted hover:text-foreground",
        className,
      )}
    >
      <span
        aria-hidden
        className={cn(
          "flex h-9 w-9 items-center justify-center rounded-full",
          "transition-all duration-200",
          "[&_svg]:h-5 [&_svg]:w-5",
          active &&
            "bg-purple/20 text-purple-bright shadow-[0_0_24px_-6px_var(--color-purple-glow)]",
        )}
      >
        {icon}
      </span>
      <span className="text-[10px] font-medium tracking-tight">{label}</span>
    </button>
  );
}

export default NavItem;
