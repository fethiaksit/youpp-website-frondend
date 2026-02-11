import Link from "next/link";
import type { HeroSection } from "@/lib/types";

const DEFAULT_BUTTON_HREF = "#";

export default function Hero({ data }: HeroSection) {
  return (
    <section className="rounded-3xl border border-white/10 bg-slate-900/40 px-8 py-16 shadow-xl shadow-black/20">
      <div className="space-y-6">
        <div className="space-y-3">
          <p className="text-xs uppercase tracking-[0.3em] text-slate-400">
            Highlight
          </p>
          <h1 className="text-4xl font-semibold leading-tight text-white sm:text-5xl">
            {data.title}
          </h1>
          {data.subtitle ? (
            <p className="max-w-2xl text-lg text-slate-300">{data.subtitle}</p>
          ) : null}
        </div>
        {data.buttonText ? (
          <Link
            className="inline-flex items-center gap-2 rounded-full bg-white px-6 py-3 text-sm font-semibold text-slate-900 shadow-lg shadow-white/20 transition hover:-translate-y-0.5"
            href={data.buttonHref ?? DEFAULT_BUTTON_HREF}
          >
            {data.buttonText}
          </Link>
        ) : null}
      </div>
    </section>
  );
}
