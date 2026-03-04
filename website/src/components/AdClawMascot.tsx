/**
 * AdClaw mascot (same as logo symbol). Used in Hero and Nav.
 */
import { CatPawIcon } from "./CatPawIcon";

interface AdClawMascotProps {
  size?: number;
  className?: string;
}

export function AdClawMascot({ size = 80, className = "" }: AdClawMascotProps) {
  return <CatPawIcon size={size} className={className} />;
}
