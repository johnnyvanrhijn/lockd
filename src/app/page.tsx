import Link from "next/link";
import { MobilePage } from "@/components/layout/MobilePage";
import { GlassCard } from "@/components/ui/GlassCard";
import { PrimaryButton } from "@/components/ui/PrimaryButton";
import { SecondaryButton } from "@/components/ui/SecondaryButton";
import { StatusBadge } from "@/components/ui/StatusBadge";

export default function Home() {
  return (
    <MobilePage>
      <header className="flex items-center justify-between pt-2">
        <span className="text-xs uppercase tracking-[0.3em] text-muted">
          v0.1 · foundation
        </span>
        <StatusBadge tone="success">Online</StatusBadge>
      </header>

      <section className="mt-10">
        <h1 className="text-5xl font-semibold tracking-tight">
          LOCK
          <span className="bg-gradient-to-br from-purple-bright to-purple bg-clip-text text-transparent">
            D
          </span>
        </h1>
        <p className="mt-3 max-w-[28ch] text-sm leading-relaxed text-muted">
          Premium dark mobile-first foundation. Glass cards, purple glow,
          built for app-like experiences.
        </p>
      </section>

      <GlassCard tone="purple" glow="soft" className="mt-10">
        <div className="flex items-center justify-between">
          <div>
            <p className="text-xs uppercase tracking-[0.2em] text-muted">
              Vault
            </p>
            <p className="mt-1 text-2xl font-semibold tracking-tight">
              Locked &amp; safe
            </p>
          </div>
          <StatusBadge tone="info">Active</StatusBadge>
        </div>
        <p className="mt-4 text-sm text-muted">
          Foundation preview. Bekijk het volledige design system voor alle
          componenten, varianten en states.
        </p>
      </GlassCard>

      <div className="mt-6 flex flex-col gap-3">
        <Link href="/design-system" className="contents">
          <PrimaryButton fullWidth>Bekijk design system</PrimaryButton>
        </Link>
        <SecondaryButton fullWidth>Learn more</SecondaryButton>
      </div>

      <footer className="mt-auto pt-10">
        <p className="text-center text-xs text-muted">
          Design foundation preview — not a real screen.
        </p>
      </footer>
    </MobilePage>
  );
}
