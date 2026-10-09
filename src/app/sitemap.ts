import type { MetadataRoute } from "next";
import { products, stores } from "@/lib/data";
import { SITE_URL } from "@/lib/site";

const STATIC_ROUTES = [
  "",
  "/produtos",
  "/lojas",
  "/cotacao",
  "/sobre",
  "/atendimento",
  "/privacidade",
  "/trocas-devolucoes",
  "/regulamento"
];

export default function sitemap(): MetadataRoute.Sitemap {
  const now = new Date();

  const staticEntries: MetadataRoute.Sitemap = STATIC_ROUTES.map((path) => ({
    url: `${SITE_URL}${path}`,
    lastModified: now,
    changeFrequency: path === "" ? "daily" : "weekly",
    priority: path === "" ? 1 : 0.7
  }));

  const productEntries: MetadataRoute.Sitemap = products.map((p) => ({
    url: `${SITE_URL}/produtos/${p.slug}`,
    lastModified: now,
    changeFrequency: "weekly",
    priority: 0.8
  }));

  const storeEntries: MetadataRoute.Sitemap = stores.map((s) => ({
    url: `${SITE_URL}/lojas/${s.slug}`,
    lastModified: now,
    changeFrequency: "weekly",
    priority: 0.6
  }));

  return [...staticEntries, ...storeEntries, ...productEntries];
}
