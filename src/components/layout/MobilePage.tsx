import type { ReactNode } from "react";
import { cn } from "@/lib/utils/cn";

type MobilePageProps = {
  children: ReactNode;
  className?: string;
  contentClassName?: string;
  /**
   * Drop horizontal padding on the inner column — handy when a child needs
   * to span edge-to-edge (e.g. a full-bleed image header).
   */
  flush?: boolean;
};

export function MobilePage({
  children,
  className,
  contentClassName,
  flush = false,
}: MobilePageProps) {
  return (
    <div
      className={cn(
        "relative flex min-h-screen w-full justify-center",
        "bg-background text-foreground",
        className,
      )}
    >
      <main
        className={cn(
          "flex w-full max-w-[430px] flex-1 flex-col",
          "pt-[max(env(safe-area-inset-top),1.5rem)]",
          "pb-[max(env(safe-area-inset-bottom),1.5rem)]",
          flush ? "px-0" : "px-5",
          contentClassName,
        )}
      >
        {children}
      </main>
    </div>
  );
}

export default MobilePage;
