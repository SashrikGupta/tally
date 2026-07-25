import { clsx } from 'clsx';
import { twMerge } from 'tailwind-merge';

/**
 * Compose class names safely: conditional classes via clsx, then dedupe
 * conflicting Tailwind utilities via tailwind-merge.
 *
 * This is the ONLY approved way to build a dynamic className in this codebase.
 * Never interpolate a class name from a variable (`` `p-${x}` ``,
 * `` `bg-[${color}]` ``) — Tailwind's JIT scanner can't see it and the class
 * silently never ships. See Context/05-design-system.md.
 */
export function cn(...inputs) {
  return twMerge(clsx(inputs));
}
