"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { PrimaryButton } from "@/components/ui/PrimaryButton";
import { GhostButton } from "@/components/ui/GhostButton";
import { getSupabaseClient } from "@/lib/supabase/client";

type Props = {
  code: string;
};

export function AcceptInviteButton({ code }: Props) {
  const router = useRouter();
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  async function accept() {
    setLoading(true);
    setError(null);
    const supabase = getSupabaseClient();
    const { error } = await supabase.rpc("accept_invite", { p_code: code });
    if (error) {
      setError(
        error.message === "invite_invalid"
          ? "Deze invite werkt niet meer."
          : error.message === "invite_own_circle"
            ? "Je kunt jezelf niet als buddy toevoegen."
            : error.message,
      );
      setLoading(false);
      return;
    }
    router.push("/dashboard");
  }

  return (
    <div className="flex flex-col gap-3">
      <PrimaryButton fullWidth onClick={accept} loading={loading}>
        Accepteer invite
      </PrimaryButton>
      <GhostButton fullWidth onClick={() => router.push("/dashboard")}>
        Niet nu
      </GhostButton>
      {error && <p className="text-center text-xs text-danger">{error}</p>}
    </div>
  );
}
