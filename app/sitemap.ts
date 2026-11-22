import type { MetadataRoute } from "next";
import { GAMES } from "@/lib/game-registry";

const SITE_URL = "https://sweetgames.app";

export default function sitemap(): MetadataRoute.Sitemap {
  const games = GAMES.map((g) => ({
    url: `${SITE_URL}/games/${g.slug}`,
    lastModified: new Date(g.addedAt),
    changeFrequency: "weekly" as const,
    priority: 0.8,
  }));
  return [
    {
      url: SITE_URL,
      lastModified: new Date(),
      changeFrequency: "daily",
      priority: 1,
    },
    {
      url: `${SITE_URL}/games`,
      lastModified: new Date(),
      changeFrequency: "daily",
      priority: 0.9,
    },
    {
      url: `${SITE_URL}/favorites`,
      lastModified: new Date(),
      changeFrequency: "monthly",
      priority: 0.5,
    },
    {
      url: `${SITE_URL}/privacy`,
      lastModified: new Date(),
      changeFrequency: "yearly",
      priority: 0.3,
    },
    ...games,
  ];
}
