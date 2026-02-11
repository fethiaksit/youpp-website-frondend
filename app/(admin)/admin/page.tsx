"use client";

import { useEffect, useMemo, useState } from "react";
import Link from "next/link";
import { apiRequest } from "@/lib/apiClient";
import { clearTokens, getAccessToken } from "@/lib/auth";
import type { Section } from "@/lib/types";

type Site = {
  id: string;
  name: string;
  slug: string;
  status?: "published" | "draft" | string;
  content?: {
    sections?: Section[];
  };
};

type SitesResponse = Site[];

type CreateSiteResponse = Site;

type SiteContentPayload = {
  content: {
    sections: Section[];
  };
};

const defaultHero = {
  type: "hero" as const,
  data: {
    title: "",
    subtitle: "",
  },
};

const defaultCta = {
  type: "cta" as const,
  data: {
    title: "",
    buttonText: "",
    buttonHref: "",
  },
};

function slugify(value: string) {
  return value
    .toLowerCase()
    .trim()
    .replace(/[^a-z0-9]+/g, "-")
    .replace(/^-+|-+$/g, "");
}

function getSection(sections: Section[] | undefined, type: Section["type"]) {
  return sections?.find((section) => section.type === type);
}

export default function AdminDashboardPage() {
  const [site, setSite] = useState<Site | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const [siteName, setSiteName] = useState("");
  const [siteSlug, setSiteSlug] = useState("");
  const [slugTouched, setSlugTouched] = useState(false);
  const [isCreating, setIsCreating] = useState(false);

  const [heroTitle, setHeroTitle] = useState("");
  const [heroSubtitle, setHeroSubtitle] = useState("");
  const [ctaTitle, setCtaTitle] = useState("");
  const [ctaButtonText, setCtaButtonText] = useState("");
  const [ctaButtonHref, setCtaButtonHref] = useState("");

  const [isSaving, setIsSaving] = useState(false);
  const [isPublishing, setIsPublishing] = useState(false);
  const [lastSavedAt, setLastSavedAt] = useState<string | null>(null);

  useEffect(() => {
    const token = getAccessToken();
    if (!token) {
      window.location.href = "/admin/login";
      return;
    }

    const loadSite = async () => {
      try {
        const response = await apiRequest<SitesResponse>("/api/sites");
        const currentSite = response[0] ?? null;
        setSite(currentSite);

        if (currentSite?.content?.sections) {
          const heroSection = getSection(currentSite.content.sections, "hero");
          const ctaSection = getSection(currentSite.content.sections, "cta");
          if (heroSection?.type === "hero") {
            setHeroTitle(heroSection.data.title ?? "");
            setHeroSubtitle(heroSection.data.subtitle ?? "");
          }
          if (ctaSection?.type === "cta") {
            setCtaTitle(ctaSection.data.title ?? "");
            setCtaButtonText(ctaSection.data.buttonText ?? "");
            setCtaButtonHref(ctaSection.data.buttonHref ?? "");
          }
        }
      } catch (loadError) {
        const message =
          loadError instanceof Error
            ? loadError.message
            : "Unable to load site.";
        setError(message);
      } finally {
        setIsLoading(false);
      }
    };

    loadSite();
  }, []);

  useEffect(() => {
    if (!slugTouched) {
      setSiteSlug(slugify(siteName));
    }
  }, [siteName, slugTouched]);

  const publishStatus = site?.status ?? "draft";

  const savePayload = useMemo<SiteContentPayload>(() => {
    const sections: Section[] = [
      {
        ...defaultHero,
        data: {
          title: heroTitle,
          subtitle: heroSubtitle,
        },
      },
      {
        ...defaultCta,
        data: {
          title: ctaTitle,
          buttonText: ctaButtonText,
          buttonHref: ctaButtonHref,
        },
      },
    ];

    return { content: { sections } };
  }, [heroTitle, heroSubtitle, ctaTitle, ctaButtonText, ctaButtonHref]);

  const handleCreateSite = async () => {
    if (!siteName || !siteSlug) {
      setError("Please provide a name and slug for your site.");
      return;
    }

    setError(null);
    setIsCreating(true);

    try {
      const response = await apiRequest<CreateSiteResponse>("/api/sites", {
        method: "POST",
        body: JSON.stringify({ name: siteName, slug: siteSlug }),
      });
      setSite(response);
    } catch (createError) {
      const message =
        createError instanceof Error
          ? createError.message
          : "Unable to create site.";
      setError(message);
    } finally {
      setIsCreating(false);
    }
  };

  const handleSave = async () => {
    if (!site) {
      return;
    }

    setError(null);
    setIsSaving(true);

    try {
      await apiRequest(`/api/sites/${site.id}/content`, {
        method: "PUT",
        body: JSON.stringify(savePayload),
      });
      setLastSavedAt(new Date().toLocaleTimeString());
    } catch (saveError) {
      const message =
        saveError instanceof Error ? saveError.message : "Unable to save.";
      setError(message);
    } finally {
      setIsSaving(false);
    }
  };

  const handlePublishToggle = async () => {
    if (!site) {
      return;
    }

    setError(null);
    setIsPublishing(true);

    try {
      const endpoint =
        publishStatus === "published"
          ? `/api/sites/${site.id}/unpublish`
          : `/api/sites/${site.id}/publish`;
      await apiRequest(endpoint, { method: "POST" });
      const nextStatus =
        publishStatus === "published" ? "draft" : "published";
      setSite({ ...site, status: nextStatus });
    } catch (publishError) {
      const message =
        publishError instanceof Error
          ? publishError.message
          : "Unable to update publish status.";
      setError(message);
    } finally {
      setIsPublishing(false);
    }
  };

  const handleLogout = () => {
    clearTokens();
    window.location.href = "/admin/login";
  };

  if (isLoading) {
    return (
      <main className="mx-auto flex min-h-screen max-w-5xl flex-col items-center justify-center px-6 py-16 text-slate-200">
        Loading admin panel...
      </main>
    );
  }

  return (
    <main className="mx-auto flex min-h-screen max-w-5xl flex-col gap-8 px-6 py-16">
      <header className="flex flex-col gap-4 rounded-3xl border border-white/10 bg-slate-900/40 p-6 shadow-2xl shadow-black/30 md:flex-row md:items-center md:justify-between">
        <div>
          <p className="text-xs uppercase tracking-[0.3em] text-slate-400">
            Admin Dashboard
          </p>
          <h1 className="text-3xl font-semibold text-white">
            {site ? site.name : "Start your site"}
          </h1>
          <p className="text-sm text-slate-300">
            Manage your public site content and publishing status.
          </p>
        </div>
        <div className="flex flex-wrap items-center gap-3">
          {site ? (
            <Link
              className="rounded-full border border-white/20 px-4 py-2 text-sm text-white transition hover:border-white/50"
              href={`/s/${site.slug}`}
              target="_blank"
            >
              View public site
            </Link>
          ) : null}
          <button
            className="rounded-full border border-white/20 px-4 py-2 text-sm text-white transition hover:border-white/50"
            onClick={handleLogout}
            type="button"
          >
            Sign out
          </button>
        </div>
      </header>

      {error ? (
        <p className="rounded-2xl border border-red-500/30 bg-red-500/10 px-4 py-3 text-sm text-red-200">
          {error}
        </p>
      ) : null}

      {!site ? (
        <section className="rounded-3xl border border-white/10 bg-slate-900/40 p-6 shadow-2xl shadow-black/30">
          <h2 className="text-xl font-semibold text-white">Start your site</h2>
          <p className="mt-2 text-sm text-slate-300">
            Create your first website to begin editing sections.
          </p>
          <div className="mt-6 grid gap-4 md:grid-cols-2">
            <label className="text-sm text-slate-200">
              Site name
              <input
                className="mt-2 w-full rounded-xl border border-white/10 bg-slate-950/60 px-4 py-3 text-sm text-white focus:border-white/40 focus:outline-none"
                type="text"
                value={siteName}
                onChange={(event) => setSiteName(event.target.value)}
                placeholder="Youpp Studio"
              />
            </label>
            <label className="text-sm text-slate-200">
              Slug
              <input
                className="mt-2 w-full rounded-xl border border-white/10 bg-slate-950/60 px-4 py-3 text-sm text-white focus:border-white/40 focus:outline-none"
                type="text"
                value={siteSlug}
                onChange={(event) => {
                  setSlugTouched(true);
                  setSiteSlug(slugify(event.target.value));
                }}
                placeholder="youpp-studio"
              />
            </label>
          </div>
          <button
            className="mt-6 rounded-xl bg-white px-5 py-3 text-sm font-semibold text-slate-900 transition hover:-translate-y-0.5 disabled:cursor-not-allowed disabled:opacity-60"
            type="button"
            onClick={handleCreateSite}
            disabled={isCreating}
          >
            {isCreating ? "Creating..." : "Create site"}
          </button>
        </section>
      ) : (
        <section className="grid gap-6 lg:grid-cols-[2fr,1fr]">
          <div className="space-y-6">
            <div className="rounded-3xl border border-white/10 bg-slate-900/40 p-6 shadow-2xl shadow-black/30">
              <h2 className="text-xl font-semibold text-white">Hero section</h2>
              <div className="mt-4 space-y-4">
                <label className="block text-sm text-slate-200">
                  Title
                  <input
                    className="mt-2 w-full rounded-xl border border-white/10 bg-slate-950/60 px-4 py-3 text-sm text-white focus:border-white/40 focus:outline-none"
                    type="text"
                    value={heroTitle}
                    onChange={(event) => setHeroTitle(event.target.value)}
                  />
                </label>
                <label className="block text-sm text-slate-200">
                  Subtitle
                  <input
                    className="mt-2 w-full rounded-xl border border-white/10 bg-slate-950/60 px-4 py-3 text-sm text-white focus:border-white/40 focus:outline-none"
                    type="text"
                    value={heroSubtitle}
                    onChange={(event) => setHeroSubtitle(event.target.value)}
                  />
                </label>
              </div>
            </div>

            <div className="rounded-3xl border border-white/10 bg-slate-900/40 p-6 shadow-2xl shadow-black/30">
              <h2 className="text-xl font-semibold text-white">CTA section</h2>
              <div className="mt-4 space-y-4">
                <label className="block text-sm text-slate-200">
                  Title
                  <input
                    className="mt-2 w-full rounded-xl border border-white/10 bg-slate-950/60 px-4 py-3 text-sm text-white focus:border-white/40 focus:outline-none"
                    type="text"
                    value={ctaTitle}
                    onChange={(event) => setCtaTitle(event.target.value)}
                  />
                </label>
                <label className="block text-sm text-slate-200">
                  Button text
                  <input
                    className="mt-2 w-full rounded-xl border border-white/10 bg-slate-950/60 px-4 py-3 text-sm text-white focus:border-white/40 focus:outline-none"
                    type="text"
                    value={ctaButtonText}
                    onChange={(event) => setCtaButtonText(event.target.value)}
                  />
                </label>
                <label className="block text-sm text-slate-200">
                  Button link
                  <input
                    className="mt-2 w-full rounded-xl border border-white/10 bg-slate-950/60 px-4 py-3 text-sm text-white focus:border-white/40 focus:outline-none"
                    type="url"
                    value={ctaButtonHref}
                    onChange={(event) => setCtaButtonHref(event.target.value)}
                    placeholder="https://example.com"
                  />
                </label>
              </div>
            </div>
          </div>

          <aside className="space-y-4">
            <div className="rounded-3xl border border-white/10 bg-slate-900/40 p-6 shadow-2xl shadow-black/30">
              <h3 className="text-lg font-semibold text-white">Status</h3>
              <dl className="mt-4 space-y-2 text-sm text-slate-200">
                <div className="flex items-center justify-between">
                  <dt>Publish status</dt>
                  <dd className="capitalize text-white">{publishStatus}</dd>
                </div>
                <div className="flex items-center justify-between">
                  <dt>Last saved</dt>
                  <dd className="text-white">
                    {lastSavedAt ?? "Not saved yet"}
                  </dd>
                </div>
              </dl>
            </div>

            <div className="flex flex-col gap-3 rounded-3xl border border-white/10 bg-slate-900/40 p-6 shadow-2xl shadow-black/30">
              <button
                className="rounded-xl bg-white px-4 py-3 text-sm font-semibold text-slate-900 transition hover:-translate-y-0.5 disabled:cursor-not-allowed disabled:opacity-60"
                type="button"
                onClick={handleSave}
                disabled={isSaving}
              >
                {isSaving ? "Saving..." : "Save"}
              </button>
              <button
                className="rounded-xl border border-white/20 px-4 py-3 text-sm font-semibold text-white transition hover:border-white/50 disabled:cursor-not-allowed disabled:opacity-60"
                type="button"
                onClick={handlePublishToggle}
                disabled={isPublishing}
              >
                {isPublishing
                  ? "Updating..."
                  : publishStatus === "published"
                  ? "Unpublish"
                  : "Publish"}
              </button>
            </div>
          </aside>
        </section>
      )}
    </main>
  );
}
