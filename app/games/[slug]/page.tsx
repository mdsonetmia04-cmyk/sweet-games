import type { Metadata } from "next";
import { notFound } from "next/navigation";
import { GAMES, getGame } from "@/lib/game-registry";
import GameShell from "@/components/game-player/GameShell";
import GameLoader from "@/components/game-player/GameLoader";

export function generateStaticParams() {
  return GAMES.map((g) => ({ slug: g.slug }));
}

export async function generateMetadata({
  params,
}: {
  params: Promise<{ slug: string }>;
}): Promise<Metadata> {
  const { slug } = await params;
  const game = getGame(slug);
  if (!game) return { title: "Game not found" };
  return {
    title: `${game.name} — Play Free`,
    description: `Play ${game.name} free online. ${game.tagline} No login, no downloads. Just play and enjoy.`,
    alternates: { canonical: `https://sweetgames.app/games/${game.slug}` },
    openGraph: {
      title: `${game.name} | Sweet Games`,
      description: `Play ${game.name} free online. ${game.tagline}`,
      url: `https://sweetgames.app/games/${game.slug}`,
    },
    twitter: {
      card: "summary",
      title: `${game.name} | Sweet Games`,
      description: `Play ${game.name} free online. ${game.tagline}`,
    },
  };
}

export default async function GamePage({
  params,
}: {
  params: Promise<{ slug: string }>;
}) {
  const { slug } = await params;
  const game = getGame(slug);
  if (!game) notFound();

  return (
    <GameShell game={game}>
      <GameLoader slug={game.slug} />
    </GameShell>
  );
}
