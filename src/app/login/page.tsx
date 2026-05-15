"use client";

import { Suspense, useState, type FormEvent } from "react";
import Link from "next/link";
import { useRouter, useSearchParams } from "next/navigation";
import { MobilePage } from "@/components/layout/MobilePage";
import { PageHeader } from "@/components/layout/PageHeader";
import { TextField } from "@/components/ui/TextField";
import { PrimaryButton } from "@/components/ui/PrimaryButton";
import { OtpInput } from "@/components/ui/OtpInput";
import { sendMagicLink, verifyEmailOtp } from "@/lib/auth/sendMagicLink";
import { getSupabaseClient } from "@/lib/supabase/client";
import { getRouteAfterLogin } from "@/lib/auth/getRouteAfterLogin";

type Phase =
  | { kind: "email"; error?: string }
  | { kind: "sending" }
  | { kind: "code"; email: string; error?: string }
  | { kind: "verifying"; email: string }
  | { kind: "redirecting" };

function LoginInner() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const next = searchParams.get("next") ?? undefined;

  const [email, setEmail] = useState("");
  const [code, setCode] = useState("");
  const [phase, setPhase] = useState<Phase>({ kind: "email" });

  async function sendCode(targetEmail: string) {
    setPhase({ kind: "sending" });
    const result = await sendMagicLink(targetEmail, { redirectTo: next });
    if (result.ok) {
      setCode("");
      setPhase({ kind: "code", email: targetEmail });
    } else {
      setPhase({ kind: "email", error: result.error });
    }
  }

  async function onEmailSubmit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    const trimmed = email.trim();
    if (!trimmed) {
      setPhase({ kind: "email", error: "Vul je emailadres in." });
      return;
    }
    await sendCode(trimmed);
  }

  async function onVerify(submitted: string) {
    if (phase.kind !== "code") return;
    setPhase({ kind: "verifying", email: phase.email });
    const result = await verifyEmailOtp(phase.email, submitted);
    if (!result.ok) {
      setCode("");
      setPhase({ kind: "code", email: phase.email, error: result.error });
      return;
    }

    setPhase({ kind: "redirecting" });

    // Honor an explicit next= (e.g. accepting an invite); otherwise route
    // based on onboarded_at.
    if (next && next.startsWith("/")) {
      router.replace(next);
      return;
    }

    const supabase = getSupabaseClient();
    const { data: userData } = await supabase.auth.getUser();
    if (!userData.user) {
      router.replace("/login");
      return;
    }
    const { data: profile } = await supabase
      .from("profiles")
      .select("*")
      .eq("id", userData.user.id)
      .maybeSingle();
    router.replace(getRouteAfterLogin(profile));
  }

  async function onCodeSubmit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    if (phase.kind !== "code") return;
    if (code.length !== 6) {
      setPhase({
        kind: "code",
        email: phase.email,
        error: "Vul de 6-cijferige code in.",
      });
      return;
    }
    await onVerify(code);
  }

  async function resend() {
    if (phase.kind !== "code") return;
    await sendCode(phase.email);
  }

  function changeEmail() {
    setEmail("");
    setCode("");
    setPhase({ kind: "email" });
  }

  // -- Render --

  if (phase.kind === "email" || phase.kind === "sending") {
    const sending = phase.kind === "sending";
    const error = phase.kind === "email" ? phase.error : undefined;
    return (
      <MobilePage contentClassName="gap-8 pt-[max(env(safe-area-inset-top),3rem)]">
        <PageHeader
          eyebrow="Inloggen"
          title={
            <>
              Welkom <span className="text-purple-bright">terug.</span>
            </>
          }
          subtitle="Vul je emailadres in. We sturen je een 6-cijferige code."
        />

        <form onSubmit={onEmailSubmit} className="flex flex-col gap-5">
          <TextField
            label="Emailadres"
            type="email"
            inputMode="email"
            autoComplete="email"
            autoFocus
            required
            placeholder="jij@email.com"
            value={email}
            onChange={(e) => setEmail(e.target.value)}
            error={error}
            disabled={sending}
          />
          <PrimaryButton
            type="submit"
            fullWidth
            loading={sending}
            disabled={sending}
          >
            Stuur code
          </PrimaryButton>
        </form>

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

  const verifying =
    phase.kind === "verifying" || phase.kind === "redirecting";
  const error = phase.kind === "code" ? phase.error : undefined;
  const currentEmail = "email" in phase ? phase.email : email;

  return (
    <MobilePage contentClassName="gap-8 pt-[max(env(safe-area-inset-top),3rem)]">
      <PageHeader
        eyebrow="Check je email"
        title={
          <>
            Vul de{" "}
            <span className="text-purple-bright">code</span> in.
          </>
        }
        subtitle={
          <>
            We hebben een 6-cijferige code gestuurd naar{" "}
            <span className="font-medium text-foreground">{currentEmail}</span>.
            Geldig voor 1 uur.
          </>
        }
      />

      <form
        onSubmit={onCodeSubmit}
        className="flex flex-col gap-5"
      >
        <OtpInput
          value={code}
          onChange={setCode}
          onComplete={(c) => onVerify(c)}
          disabled={verifying}
          error={Boolean(error)}
          autoFocus
        />

        {error && (
          <p
            role="alert"
            className="text-center text-xs text-danger"
          >
            {error}
          </p>
        )}

        <PrimaryButton
          type="submit"
          fullWidth
          loading={verifying}
          disabled={verifying || code.length !== 6}
        >
          {phase.kind === "redirecting"
            ? "Een moment..."
            : "Log in"}
        </PrimaryButton>
      </form>

      <div className="flex flex-col items-center gap-3 pt-2">
        <button
          type="button"
          onClick={resend}
          disabled={verifying}
          className="text-xs font-medium text-purple-bright underline-offset-4 hover:underline disabled:opacity-50"
        >
          Stuur nieuwe code
        </button>
        <button
          type="button"
          onClick={changeEmail}
          disabled={verifying}
          className="text-xs font-medium text-muted underline-offset-4 hover:text-foreground hover:underline disabled:opacity-50"
        >
          Ander emailadres
        </button>
      </div>

      <footer className="mt-auto pt-8 text-center">
        <p className="text-[11px] text-muted">
          Geen email ontvangen? Check je spam folder, of vraag een nieuwe code aan.
        </p>
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
