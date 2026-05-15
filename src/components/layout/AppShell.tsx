import type { ReactNode } from "react";
import { cn } from "@/lib/utils/cn";
import { MobilePage } from "./MobilePage";

type AppShellProps = {
  children: ReactNode;
  /** Optional header rendered above the main content. */
  header?: ReactNode;
  /** Optional floating bottom navigation. Renders fixed inside the column. */
  bottomNav?: ReactNode;
  /** Drop horizontal padding on the inner column. */
  flush?: boolean;
  className?: string;
  contentClassName?: string;
};

/**
 * Convenience wrapper around MobilePage that wires up a header slot at the
 * top of the scroll area and a fixed BottomNav slot at the bottom of the
 * viewport. Use this for app screens; use MobilePage directly when you need
 * a marketing-style page with no chrome.
 */
export function AppShell({
  children,
  header,
  bottomNav,
  flush = false,
  className,
  contentClassName,
}: AppShellProps) {
  return (
    <MobilePage
      flush={flush}
      withBottomNav={Boolean(bottomNav)}
      className={className}
      contentClassName={cn("gap-6", contentClassName)}
    >
      {header}
      <div className="flex flex-1 flex-col gap-6">{children}</div>
      {bottomNav && (
        <div
          className={cn(
            "pointer-events-none fixed inset-x-0 bottom-0 z-40 flex justify-center",
            "pb-[max(env(safe-area-inset-bottom),0.75rem)]",
          )}
        >
          <div className="pointer-events-auto w-full max-w-[430px] px-4">
            {bottomNav}
          </div>
        </div>
      )}
    </MobilePage>
  );
}

export default AppShell;
