import Link from "next/link";
import { redirect } from "next/navigation";
import { MobilePage } from "@/components/layout/MobilePage";
import { PageHeader } from "@/components/layout/PageHeader";
import { GlassCard } from "@/components/ui/GlassCard";
import { PrimaryButton } from "@/components/ui/PrimaryButton";
import { GhostButton } from "@/components/ui/GhostButton";
import { getServerSupabase } from "@/lib/supabase/server";
import { AcceptInviteButton } from "./AcceptInviteButton";

type Params = { code: string };

type InvitePreview = {
  invite_code: string;
  status: string;
  expires_at: string;
  inviter_id: string;
  inviter_display_name: string | null;
};

export default async function InvitePage({
  params,
}: {
  params: Promise<Params>;
}) {
  const { code } = await params;
  const supabase = await getServerSupabase();

  const { data: previewRows } = await supabase.rpc("get_invite_preview", {
    p_code: code,
  });
  const preview = (previewRows?.[0] ?? null) as InvitePreview | null;

  const {
    data: { user },
  } = await supabase.auth.getUser();

  const expired = preview
    ? new Date(preview.expires_at).getTime() < Date.now()
    : false;
  const isInvalid =
    !preview || preview.status !== "pending" || expired;
  const isOwnInvite = preview && user && preview.inviter_id === user.id;

  // If the user is the owner of this invite, no point showing the accept
  // screen; bounce them back to dashboard.
  if (isOwnInvite) {
    redirect("/dashboard");
  }

  return (
    <MobilePage contentClassName="gap-8 pt-[max(env(safe-area-inset-top),3rem)]">
      <PageHeader
        eyebrow="Invite"
        title={
          isInvalid ? (
            <>
              Deze invite{" "}
              <span className="text-purple-bright">werkt niet meer</span>.
            </>
          ) : (
            <>
              <span className="text-purple-bright">
                {preview!.inviter_display_name ?? "Iemand"}
              </span>{" "}
              heeft je uitgenodigd.
            </>
          )
        }
        subtitle={
          isInvalid
            ? "De link is verlopen of ingetrokken. Vraag de inviter om een nieuwe."
            : "Als buddy zie je elkaars streaks en struggle signals. Geen feed, geen oordeel. Klein en privé."
        }
      />

      {!isInvalid && (
        <GlassCard tone="elevated" padding="md" className="flex flex-col gap-3">
          <h3 className="text-sm font-semibold text-foreground">
            Wat buddy zijn inhoudt
          </h3>
          <ul className="flex flex-col gap-1.5 text-xs text-muted">
            <li>• Je ziet wanneer ze clean blijven en wanneer ze worstelen.</li>
            <li>• Je kunt een korte support pushen wanneer het zwaar is.</li>
            <li>• Geen gesprekken, geen feed, geen publieke profielen.</li>
            <li>• Je kunt op elk moment vertrekken.</li>
          </ul>
        </GlassCard>
      )}

      <div className="flex flex-col gap-3">
        {isInvalid ? (
          <Link href="/" className="contents">
            <PrimaryButton fullWidth>Terug naar start</PrimaryButton>
          </Link>
        ) : user ? (
          <AcceptInviteButton code={code} />
        ) : (
          <>
            <Link href={`/login?next=/invite/${code}`} className="contents">
              <PrimaryButton fullWidth>Inloggen om te accepteren</PrimaryButton>
            </Link>
            <Link href="/" className="contents">
              <GhostButton fullWidth>Niet nu</GhostButton>
            </Link>
          </>
        )}
      </div>

      <footer className="mt-auto pt-8 text-center">
        <p className="text-[11px] text-muted">
          LOCKD is een private behavioral control tool. Buddies zijn een
          accountability circle, geen social netwerk.
        </p>
      </footer>
    </MobilePage>
  );
}
