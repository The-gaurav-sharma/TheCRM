import { Compass, TrendingUp, Sparkles, ShieldCheck } from "lucide-react";

/**
 * Split-screen auth layout, restyled to match atlass-partners.com:
 * ink-navy panel, muted brass accent, serif display type, and a
 * hairline "confidential document" frame as the signature motif —
 * echoing the "Confidential · Atlass Partners" mark used on their site.
 */
export function AuthShell({ children }) {
  return (
    <div className="flex min-h-screen bg-[#F6F3EC]">
      {/* Brand / marketing panel */}
      <div className="relative hidden w-1/2 flex-col justify-between overflow-hidden bg-[#0E1720] p-12 text-white lg:flex">
        {/* subtle brass glow, not a bright blur */}
        <div className="absolute -right-24 -top-24 h-80 w-80 rounded-full bg-[#C9A24B]/10 blur-3xl" />
        <div className="absolute -bottom-32 -left-16 h-96 w-96 rounded-full bg-[#C9A24B]/[0.06] blur-3xl" />

        {/* hairline corner frame — the signature "confidential document" motif */}
        <div className="pointer-events-none absolute inset-6 border border-white/10">
          <span className="absolute -left-px -top-px h-3 w-3 border-l border-t border-[#C9A24B]" />
          <span className="absolute -right-px -top-px h-3 w-3 border-r border-t border-[#C9A24B]" />
          <span className="absolute -bottom-px -left-px h-3 w-3 border-b border-l border-[#C9A24B]" />
          <span className="absolute -bottom-px -right-px h-3 w-3 border-b border-r border-[#C9A24B]" />
        </div>

        <div className="relative flex items-center gap-2.5">
          <div className="flex h-9 w-9 items-center justify-center rounded-sm border border-[#C9A24B]/40 bg-white/5">
            <span className="font-serif text-lg font-semibold text-[#C9A24B]">A</span>
          </div>
          <span className="font-serif text-lg font-semibold tracking-wide">
            Atlass CRM
          </span>
        </div>

        <div className="relative">
          <p className="mb-4 text-[11px] font-medium uppercase tracking-[0.25em] text-[#C9A24B]">
            Confidential · Atlass CRM
          </p>
          <h2 className="font-serif text-4xl font-semibold leading-tight">
            People before pipelines. Judgement, guided by data.
          </h2>
          <div className="mt-4 h-px w-16 bg-[#C9A24B]/60" />
          <p className="mt-4 max-w-md text-white/60">
            Atlass CRM unifies your leads, contacts and follow-ups — then layers
            AI-drafted summaries, emails and pipeline insight on top, so every
            call is made with the full picture.
          </p>

          <div className="mt-10 space-y-4">
            {[
              { icon: TrendingUp, text: "Visual pipeline, senior-level clarity on every deal" },
              { icon: Sparkles, text: "AI lead scoring & instant email drafting" },
              { icon: Compass, text: "Built for cross-border sales teams" },
              { icon: ShieldCheck, text: "Confidential by design — your data stays yours" },
            ].map(({ icon: Icon, text }) => (
              <div key={text} className="flex items-center gap-3">
                <div className="flex h-9 w-9 shrink-0 items-center justify-center rounded-sm border border-white/10 bg-white/[0.03]">
                  <Icon className="h-[18px] w-[18px] text-[#C9A24B]" />
                </div>
                <span className="text-sm text-white/80">{text}</span>
              </div>
            ))}
          </div>
        </div>

        <p className="relative text-xs text-white/40">
          © {new Date().getFullYear()} Time To Program. All rights reserved.
        </p>
      </div>

      {/* Form panel */}
      <div className="flex w-full flex-col items-center justify-center px-6 py-12 lg:w-1/2">
        <div className="w-full max-w-sm animate-fade-up">{children}</div>
      </div>
    </div>
  );
}