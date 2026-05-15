import type { ReactNode } from "react";
import { cn } from "@/lib/utils/cn";
import { SelectableCard } from "./SelectableCard";

export type HabitOption = {
  id: string;
  label: ReactNode;
  description?: ReactNode;
  icon?: ReactNode;
};

type HabitSelectorProps = {
  options: ReadonlyArray<HabitOption>;
  selected: ReadonlyArray<string>;
  onChange: (selected: ReadonlyArray<string>) => void;
  /** Optional cap. Once reached, unselected options become disabled. */
  max?: number;
  className?: string;
};

export function HabitSelector({
  options,
  selected,
  onChange,
  max,
  className,
}: HabitSelectorProps) {
  const selectedSet = new Set(selected);
  const atLimit = typeof max === "number" && selected.length >= max;

  const toggle = (id: string) => {
    if (selectedSet.has(id)) {
      onChange(selected.filter((s) => s !== id));
      return;
    }
    if (atLimit) return;
    onChange([...selected, id]);
  };

  return (
    <div className={cn("grid grid-cols-2 gap-3", className)}>
      {options.map((opt) => {
        const isSelected = selectedSet.has(opt.id);
        return (
          <SelectableCard
            key={opt.id}
            title={opt.label}
            description={opt.description}
            icon={opt.icon}
            selected={isSelected}
            disabled={!isSelected && atLimit}
            onClick={() => toggle(opt.id)}
          />
        );
      })}
    </div>
  );
}

export default HabitSelector;
