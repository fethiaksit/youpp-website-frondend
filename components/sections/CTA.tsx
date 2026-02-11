import Link from "next/link";
import type { CtaSection } from "@/lib/types";

const DEFAULT_BUTTON_HREF = "#";

export default function CTA({ data }: CtaSection) {
  return (
    <section className="rounded-3xl border border-white/10 bg-gradient-to-br from-slate-900/80 to-slate-900/40 px-8 py-12">
      <div className="flex flex-col gap-6 sm:flex-row sm:items-center sm:justify-between">
        <h2 className="text-2xl font-semibold text-white">{data.title}</h2>
        {data.buttonText ? (
          <Link
            className="inline-flex items-center justify-center rounded-full border border-white/30 px-5 py-3 text-sm font-semibold text-white transition hover:border-white hover:bg-white hover:text-slate-900"
            href={data.buttonHref ?? DEFAULT_BUTTON_HREF}
          >
            {data.buttonText}
          </Link>
        ) : null}
      </div>
    </section>
  );
}
