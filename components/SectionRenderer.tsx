import type { Section } from "@/lib/types";
import CTA from "@/components/sections/CTA";
import Hero from "@/components/sections/Hero";

export default function SectionRenderer({ section }: { section: Section }) {
  switch (section.type) {
    case "hero":
      return <Hero {...section} />;
    case "cta":
      return <CTA {...section} />;
    default: {
      if (process.env.NODE_ENV !== "production") {
        console.warn(`Unknown section type: ${section.type}`);
      }
      return null;
    }
  }
}
