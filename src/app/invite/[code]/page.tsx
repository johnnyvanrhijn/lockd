import Link from "next/link";
import { headers } from "next/headers";
import { MobilePage } from "@/components/layout/MobilePage";
import { PageHeader } from "@/components/layout/PageHeader";
import { GlassCard } from "@/components/ui/GlassCard";
import { PrimaryButton } from "@/components/ui/PrimaryButton";
import { GhostButton } from "@/components/ui/GhostButton";
import { getServerSupabase } from "@/lib/supabase/server";
import { InviteLinkCard } from "@/components/onboarding/InviteLinkCard";
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
  const isInvalid = !preview || preview.status !== "pending" || expired;
  const isOwnInvite = Boolean(
    preview && user && preview.inviter_id === user.id,
  );

  // -- The inviter themselves opens their own invite link.
  //    Show what the link is for + a copy-to-clipboard, not the accept screen
  //    (you can't be your own buddy).
  if (isOwnInvite && !isInvalid) {
    const hdrs = await headers();
    const proto = hdrs.get("x-forwarded-proto") ?? "https";
    const host = hdrs.get("host") ?? "project-laknm.vercel.app";
    const fullUrl = `${proto}://${host}/invite/${code}`;

    return (
      <MobilePage contentClassName="gap-8 pt-[max(env(safe-area-inset-top),3rem)]">
        <PageHeader
          eyebrow="Jouw invite link"
          title={
            <>
              Dit is{" "}
              <span className="text-purple-bright">jouw</span> link.
            </>
          }
          subtitle="Stuur 'm naar 1 tot 5 mensen die jou scherp houden. Iedereen die de link opent ziet een uitnodiging op jouw naam."
        />

        <InviteLinkCard url={fullUrl} />

        <GlassCard tone="elevated" padding="md" className="flex flex-col gap-2">
          <h3 className="text-sm font-semibold text-foreground">
            Hoe het werkt
          </h3>
          <ul className="flex flex-col gap-1.5 text-xs text-muted">
            <li>1. Deel de link via WhatsApp, SMS of email.</li>
            <li>2. De ontvanger opent de link en logt in met magic link.</li>
            <li>3. Na accepteren staat ie in jouw circle.</li>
          </ul>
          <p className="mt-2 text-[11px] text-muted">
            Tip: wil je 'm zelf testen? Open de link in een privé venster
            of op een ander apparaat zonder ingelogd account.
          </p>
        </GlassCard>

        <div className="flex flex-col gap-3">
          <Link href="/dashboard" className="contents">
            <PrimaryButton fullWidth>Terug naar dashboard</PrimaryButton>
          </Link>
        </div>
      </MobilePage>
    );
  }

  return (
    <MobilePage contentClassName="gap-8 pt-[max(env(safe-area-inset-top),3rem)]">
      <PageHeader
        eyebrow="Uitnodiging"
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
              <PrimaryButton fullWidth>
                Maak account en accepteer
              </PrimaryButton>
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
