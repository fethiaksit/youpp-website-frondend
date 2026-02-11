"use client";

import { useEffect, useMemo, useState } from "react";
import Link from "next/link";
import { apiRequest } from "@/lib/apiClient";
import { clearTokens, getAccessToken } from "@/lib/auth";
import type { Section } from "@/lib/types";
import styles from "./dashboard.module.css";
import Image from "next/image";

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

// ... (importlar ve mantık kısımları aynı kalıyor)

  return (
    <main className={styles.container}>
      {/* Sidebar */}
      <aside className={styles.sidebar}>
    <img src="/youpp-logo.png" alt="Youpp Logo" width={100} />
        <nav className={styles.nav}>
          <a href="#" className={`${styles.navItem} ${styles.navItemActive}`}>Dashboard</a>
          <a href="#" className={styles.navItem}>Pages</a>
          <a href="#" className={styles.navItem}>Settings</a>
        </nav>
        <button onClick={handleLogout} className={styles.logoutBtn}>Sign out</button>
      </aside>

      {/* Main Content */}
      <div className={styles.mainContent}>
        <header className={styles.header}>
          <div className={styles.headerTitle}>
            <h1>{site ? site.name : "Start your site"}</h1>
            <p>Manage your public site content and publishing status.</p>
          </div>
          {site && (
            <Link className={styles.viewBtn} href={`/s/${site.slug}`} target="_blank">
              View Public Site
            </Link>
          )}
        </header>

        {error && <div className={styles.errorText}>{error}</div>}

        {!site ? (
          <section className={styles.sectionCard}>
            <h2 className={styles.sectionTitle}>Create New Site</h2>
            <div className={styles.inputGroup}>
                <label>Site Name</label>
                <input 
                  className={styles.input} 
                  value={siteName} 
                  onChange={(e) => setSiteName(e.target.value)}
                  placeholder="My Creative Studio"
                />
            </div>
            <button className={styles.saveBtn} onClick={handleCreateSite}>Create Site</button>
          </section>
        ) : (
          <div className={styles.actionGrid}>
            <div className={styles.editorArea}>
              <div className={styles.sectionCard}>
                <h2 className={styles.sectionTitle}>Hero Section</h2>
                <div className={styles.inputGroup}>
                  <label>Hero Title</label>
                  <input 
                    className={styles.input} 
                    value={heroTitle} 
                    onChange={(e) => setHeroTitle(e.target.value)} 
                  />
                </div>
                <div className={styles.inputGroup}>
                  <label>Hero Subtitle</label>
                  <input 
                    className={styles.input} 
                    value={heroSubtitle} 
                    onChange={(e) => setHeroSubtitle(e.target.value)} 
                  />
                </div>
              </div>

              <div className={styles.sectionCard}>
                <h2 className={styles.sectionTitle}>CTA Section</h2>
                <div className={styles.inputGroup}>
                  <label>CTA Title</label>
                  <input 
                    className={styles.input} 
                    value={ctaTitle} 
                    onChange={(e) => setCtaTitle(e.target.value)} 
                  />
                </div>
              </div>
            </div>

            <aside className={styles.statusPanel}>
              <div className={styles.statusCard}>
                <h3 className={styles.sectionTitle}>Publishing</h3>
                <div style={{marginBottom: '20px', fontSize: '14px'}}>
                  <div style={{display: 'flex', justifyContent: 'space-between', marginBottom: '8px'}}>
                    <span>Status:</span>
                    <strong style={{color: publishStatus === 'published' ? '#10b981' : '#f59e0b'}}>
                        {publishStatus.toUpperCase()}
                    </strong>
                  </div>
                  <div style={{display: 'flex', justifyContent: 'space-between'}}>
                    <span>Last Saved:</span>
                    <span>{lastSavedAt || "Never"}</span>
                  </div>
                </div>
                
                <button className={styles.saveBtn} onClick={handleSave} disabled={isSaving}>
                  {isSaving ? "Saving..." : "Save Changes"}
                </button>
                <button className={styles.publishBtn} onClick={handlePublishToggle}>
                  {publishStatus === "published" ? "Unpublish" : "Go Live"}
                </button>
              </div>
            </aside>
          </div>
        )}
      </div>
    </main>
  );

}
