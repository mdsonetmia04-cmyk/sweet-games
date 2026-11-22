import {
  Blocks,
  Bomb,
  CircleDot,
  Crown,
  Dices,
  Hash,
  LayoutGrid,
  Worm,
  X,
  Zap,
  type LucideIcon,
} from "lucide-react";

const ICONS: Record<string, LucideIcon> = {
  dices: Dices,
  crown: Crown,
  worm: Worm,
  "layout-grid": LayoutGrid,
  x: X,
  blocks: Blocks,
  "circle-dot": CircleDot,
  hash: Hash,
  bomb: Bomb,
  zap: Zap,
};

export default function GameIcon({
  icon,
  className,
}: {
  icon: string;
  className?: string;
}) {
  const Icon = ICONS[icon] ?? Zap;
  return <Icon className={className} aria-hidden />;
}
