import Link from "next/link";

export default function HomePage() {
  return (
    <main className="mx-auto flex min-h-screen max-w-4xl flex-col items-start gap-6 px-6 py-16">
      <div className="space-y-3">
        <p className="text-sm uppercase tracking-[0.2em] text-slate-400">Youpp</p>
        <h1 className="text-4xl font-semibold text-white">Public site renderer</h1>
        <p className="text-lg text-slate-300">
          Preview a published site from the no-code platform.
        </p>
      </div>
      <Link
        className="inline-flex items-center gap-2 rounded-full bg-white px-5 py-3 text-sm font-semibold text-slate-900 shadow-lg shadow-white/20 transition hover:-translate-y-0.5"
        href="/s/demo-site"
      >
        Open demo site
      </Link>
    </main>
  );
}
