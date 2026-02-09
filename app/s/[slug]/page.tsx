import SectionRenderer from "@/components/SectionRenderer";
import type { SiteResponse } from "@/lib/types";

const baseUrl = process.env.BACKEND_BASE_URL;

function NotFoundState() {
  return (
    <main className="mx-auto flex min-h-screen max-w-3xl flex-col items-center justify-center gap-6 px-6 py-16 text-center">
      <p className="text-sm uppercase tracking-[0.3em] text-slate-400">
        404
      </p>
      <h1 className="text-3xl font-semibold text-white">Site not found</h1>
      <p className="text-base text-slate-300">
        The site you are looking for does not exist or is not published yet.
      </p>
    </main>
  );
}

async function getSite(slug: string): Promise<SiteResponse | null> {
  if (!baseUrl) {
    throw new Error("BACKEND_BASE_URL is not configured.");
  }

  const response = await fetch(`${baseUrl}/s/${slug}`, { cache: "no-store" });

  if (!response.ok) {
    return null;
  }

  return (await response.json()) as SiteResponse;
}

export default async function SitePage({
  params
}: {
  params: { slug: string };
}) {
  const data = await getSite(params.slug);

  if (!data || data.published === false) {
    return <NotFoundState />;
  }

  const sections = data.content?.sections ?? [];

  return (
    <main className="mx-auto flex min-h-screen max-w-5xl flex-col gap-10 px-6 py-16">
      <header className="space-y-2">
        <p className="text-xs uppercase tracking-[0.3em] text-slate-400">
          {data.slug}
        </p>
        <h1 className="text-2xl font-semibold text-white">Public site</h1>
      </header>
      <div className="flex flex-col gap-8">
        {sections.map((section, index) => (
          <SectionRenderer key={`${section.type}-${index}`} section={section} />
        ))}
      </div>
    </main>
  );
}
