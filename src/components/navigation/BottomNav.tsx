import type { ReactNode } from "react";
import { cn } from "@/lib/utils/cn";
import { NavItem } from "./NavItem";

export type BottomNavItem = {
  id: string;
  label: ReactNode;
  icon: ReactNode;
};

type BottomNavProps = {
  items: ReadonlyArray<BottomNavItem>;
  activeId: string;
  onSelect: (id: string) => void;
  className?: string;
};

export function BottomNav({
  items,
  activeId,
  onSelect,
  className,
}: BottomNavProps) {
  return (
    <nav
      aria-label="Hoofdnavigatie"
      className={cn(
        "flex w-full items-stretch gap-1 px-2",
        "rounded-[var(--radius-xl)]",
        "border border-[var(--color-border)]",
        "bg-surface/80 backdrop-blur-2xl",
        "shadow-[0_20px_60px_-20px_rgba(0,0,0,0.6)]",
        className,
      )}
    >
      {items.map((item) => (
        <NavItem
          key={item.id}
          icon={item.icon}
          label={item.label}
          active={item.id === activeId}
          onClick={() => onSelect(item.id)}
        />
      ))}
    </nav>
  );
}

export default BottomNav;
