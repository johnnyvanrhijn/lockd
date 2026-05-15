import Link from "next/link";
import { MobilePage } from "@/components/layout/MobilePage";
import { PrimaryButton } from "@/components/ui/PrimaryButton";

function ShieldGlyph() {
  return (
    <svg viewBox="0 0 96 96" className="h-20 w-20" fill="none" aria-hidden>
      <defs>
        <radialGradient id="lockd-hero-glow" cx="50%" cy="40%" r="55%">
          <stop offset="0%" stopColor="#A78BFA" stopOpacity="0.55" />
          <stop offset="100%" stopColor="#8B5CF6" stopOpacity="0" />
        </radialGradient>
        <linearGradient id="lockd-hero-stroke" x1="0%" y1="0%" x2="100%" y2="100%">
          <stop offset="0%" stopColor="#A78BFA" />
          <stop offset="100%" stopColor="#8B5CF6" />
        </linearGradient>
      </defs>
      <circle cx="48" cy="44" r="36" fill="url(#lockd-hero-glow)" />
      <path
        d="M48 12l28 10v22c0 17-12 30-28 36-16-6-28-19-28-36V22l28-10Z"
        stroke="url(#lockd-hero-stroke)"
        strokeWidth="2.2"
        strokeLinejoin="round"
        fill="rgba(139, 92, 246, 0.06)"
      />
      <rect
        x="36"
        y="42"
        width="24"
        height="20"
        rx="3"
        stroke="#A78BFA"
        strokeWidth="2"
        fill="rgba(139, 92, 246, 0.12)"
      />
      <path
        d="M40 42v-6a8 8 0 0 1 16 0v6"
        stroke="#A78BFA"
        strokeWidth="2"
        strokeLinecap="round"
      />
      <circle cx="48" cy="52" r="2" fill="#A78BFA" />
    </svg>
  );
}

export default function LandingPage() {
  return (
    <MobilePage contentClassName="gap-10 pt-[max(env(safe-area-inset-top),3rem)]">
      <header className="flex items-center justify-between gap-3">
        <span className="text-sm font-semibold tracking-tight text-foreground">
          LOCKD
        </span>
        <Link
          href="/login"
          className="rounded-full px-3 py-1.5 text-xs font-medium text-muted underline-offset-4 transition-colors hover:text-foreground"
        >
          Inloggen
        </Link>
      </header>

      <section className="mt-6 flex flex-col items-start gap-6">
        <ShieldGlyph />

        <h1 className="text-[2.5rem] font-semibold leading-[1.05] tracking-[-0.02em] text-foreground">
          Neem de{" "}
          <span className="text-purple-bright">controle</span> terug op de
          momenten waarop het telt.
        </h1>

        <p className="max-w-[32ch] text-base leading-relaxed text-muted">
          LOCKD is geen tracker. Het is een rustige hand op je schouder op
          het moment dat je dreigt toe te geven.
        </p>
      </section>

      <section className="flex flex-col gap-3">
        <Link href="/login" className="contents">
          <PrimaryButton fullWidth>Start gratis</PrimaryButton>
        </Link>
        <p className="text-center text-xs text-muted">
          Geen wachtwoord. Magic link via je email. Privé, zonder oordeel.
        </p>
      </section>

      <footer className="mt-auto flex flex-col items-center gap-1 pb-2 pt-10 text-center">
        <p className="text-[11px] uppercase tracking-[0.25em] text-muted">
          Mobile only
        </p>
      </footer>
    </MobilePage>
  );
}
