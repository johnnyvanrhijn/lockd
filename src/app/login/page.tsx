"use client";

import { Suspense, useState, type FormEvent } from "react";
import Link from "next/link";
import { useSearchParams } from "next/navigation";
import { MobilePage } from "@/components/layout/MobilePage";
import { PageHeader } from "@/components/layout/PageHeader";
import { TextField } from "@/components/ui/TextField";
import { PrimaryButton } from "@/components/ui/PrimaryButton";
import { GlassCard } from "@/components/ui/GlassCard";
import { sendMagicLink } from "@/lib/auth/sendMagicLink";

type Status =
  | { kind: "idle" }
  | { kind: "loading" }
  | { kind: "sent"; email: string }
  | { kind: "error"; message: string };

function LoginInner() {
  const searchParams = useSearchParams();
  const next = searchParams.get("next") ?? undefined;

  const [email, setEmail] = useState("");
  const [status, setStatus] = useState<Status>({ kind: "idle" });

  async function onSubmit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    const trimmed = email.trim();
    if (!trimmed) {
      setStatus({ kind: "error", message: "Vul je e-mailadres in." });
      return;
    }
    setStatus({ kind: "loading" });
    const result = await sendMagicLink(trimmed, { redirectTo: next });
    if (result.ok) {
      setStatus({ kind: "sent", email: trimmed });
    } else {
      setStatus({ kind: "error", message: result.error });
    }
  }

  const isSent = status.kind === "sent";
  const isLoading = status.kind === "loading";

  return (
    <MobilePage contentClassName="gap-8 pt-[max(env(safe-area-inset-top),3rem)]">
      <PageHeader
        eyebrow="Inloggen"
        title={
          <>
            Welkom <span className="text-purple-bright">terug.</span>
          </>
        }
        subtitle="Vul je e-mailadres in. We sturen je een magic link, geen wachtwoord nodig."
      />

      {isSent ? (
        <GlassCard tone="elevated" padding="lg" className="flex flex-col gap-3">
          <span className="text-[11px] font-semibold uppercase tracking-[0.25em] text-purple-bright">
            Link verstuurd
          </span>
          <p className="text-base font-medium text-foreground">
            Check je inbox van{" "}
            <span className="text-purple-bright">{status.email}</span>.
          </p>
          <p className="text-sm leading-relaxed text-muted">
            Klik op de link in onze mail om in te loggen. Je kunt dit venster
            laten staan, je wordt automatisch ingelogd zodra je terugkomt.
          </p>
          <button
            type="button"
            onClick={() => setStatus({ kind: "idle" })}
            className="mt-2 self-start text-xs font-medium text-muted underline-offset-4 hover:text-foreground hover:underline"
          >
            Ander e-mailadres gebruiken
          </button>
        </GlassCard>
      ) : (
        <form onSubmit={onSubmit} className="flex flex-col gap-5">
          <TextField
            label="E-mailadres"
            type="email"
            inputMode="email"
            autoComplete="email"
            autoFocus
            required
            placeholder="jij@email.com"
            value={email}
            onChange={(e) => setEmail(e.target.value)}
            error={status.kind === "error" ? status.message : undefined}
            disabled={isLoading}
          />
          <PrimaryButton
            type="submit"
            fullWidth
            loading={isLoading}
            disabled={isLoading}
          >
            Stuur magic link
          </PrimaryButton>
        </form>
      )}

      <footer className="mt-auto flex flex-col items-center gap-1 pt-8 text-center">
        <p className="text-xs text-muted">
          Nog geen account? Eerste login maakt er meteen één voor je.
        </p>
        <Link
          href="/"
          className="text-xs font-medium text-muted underline-offset-4 hover:text-foreground hover:underline"
        >
          Terug naar start
        </Link>
      </footer>
    </MobilePage>
  );
}

export default function LoginPage() {
  return (
    <Suspense fallback={null}>
      <LoginInner />
    </Suspense>
  );
}
