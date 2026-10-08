import {
  siFlutter,
  siGit,
  siLaravel,
  siNextdotjs,
  siPostgresql,
  siPrisma,
  siReact,
  siSupabase,
  siTailwindcss,
  siTypescript,
} from "simple-icons";
import type { SimpleIcon } from "simple-icons";

export type Tech = Pick<SimpleIcon, "title" | "path" | "hex">;

const pick = ({ title, path, hex }: SimpleIcon): Tech => ({ title, path, hex });

// Deux anneaux de 5 logos : on mélange les domaines pour un rendu équilibré
export const RING_A: Tech[] = [
  siNextdotjs,
  siTypescript,
  siFlutter,
  siPrisma,
  siSupabase,
].map(pick);

export const RING_B: Tech[] = [
  siReact,
  siTailwindcss,
  siLaravel,
  siPostgresql,
  siGit,
].map(pick); 