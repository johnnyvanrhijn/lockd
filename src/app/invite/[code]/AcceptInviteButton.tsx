"use client";

import { useState } from "react";
import { PrimaryButton } from "@/components/ui/PrimaryButton";
import { GhostButton } from "@/components/ui/GhostButton";
import { getSupabaseClient } from "@/lib/supabase/client";

type Props = {
  code: string;
};

function humanize(msg: string): string {
  if (msg.includes("invite_invalid")) return "Deze invite werkt niet meer.";
  if (msg.includes("invite_own_circle"))
    return "Je kunt jezelf niet als buddy toevoegen.";
  if (msg.includes("not_authenticated"))
    return "Je moet eerst inloggen om te accepteren.";
  return msg;
}

export function AcceptInviteButton({ code }: Props) {
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  async function accept() {
    setLoading(true);
    setError(null);
    try {
      const supabase = getSupabaseClient();
      const { error: rpcError } = await supabase.rpc("accept_invite", {
        p_code: code,
      });
      if (rpcError) {
        setError(humanize(rpcError.message));
        setLoading(false);
        return;
      }
      // Hard nav so the proxy re-evaluates with fresh cookies and routes
      // the new user through onboarding (no onboarded_at yet).
      window.location.assign("/dashboard");
    } catch (err) {
      console.error("[accept_invite] failed:", err);
      const message =
        err instanceof Error ? err.message : "Onbekende fout. Probeer opnieuw.";
      setError(message);
      setLoading(false);
    }
  }

  return (
    <div className="flex flex-col gap-3">
      <PrimaryButton fullWidth onClick={accept} loading={loading}>
        Accepteer invite
      </PrimaryButton>
      <GhostButton
        fullWidth
        onClick={() => window.location.assign("/dashboard")}
      >
        Niet nu
      </GhostButton>
      {error && <p className="text-center text-xs text-danger">{error}</p>}
    </div>
  );
}
