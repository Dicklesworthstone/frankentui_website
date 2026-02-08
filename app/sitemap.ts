import type { MetadataRoute } from "next";

export default function sitemap(): MetadataRoute.Sitemap {
  const base = "https://frankentui.com";
  const now = new Date();

  return [
    { url: base, lastModified: now, changeFrequency: "weekly", priority: 1.0 },
    { url: `${base}/showcase`, lastModified: now, changeFrequency: "monthly", priority: 0.8 },
    { url: `${base}/architecture`, lastModified: now, changeFrequency: "monthly", priority: 0.8 },
    { url: `${base}/how-it-was-built`, lastModified: now, changeFrequency: "monthly", priority: 0.7 },
    { url: `${base}/glossary`, lastModified: now, changeFrequency: "monthly", priority: 0.7 },
    { url: `${base}/getting-started`, lastModified: now, changeFrequency: "weekly", priority: 0.9 },
  ];
}
