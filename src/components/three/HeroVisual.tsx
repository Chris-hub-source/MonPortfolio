"use client";

import { useEffect, useRef, useState } from "react";
import dynamic from "next/dynamic";
import { useTheme } from "@/components/layout/ThemeProvider";
import SceneFallback from "./SceneFallback";
import type { ScenePalette } from "./HeroScene";

// Chargé uniquement côté navigateur, après l'affichage du texte
const HeroScene = dynamic(() => import("./HeroScene"), {
  ssr: false,
  loading: () => <SceneFallback />,
});

type Mode = "pending" | "static" | "lite" | "full";

const PALETTE: Record<"dark" | "light", ScenePalette> = {
  dark: { dots: "#8b7dff", core: "#0b0f1d", glow: "#6d5efc", ring: "#8b7dff" },
  light: { dots: "#6d5efc", core: "#ebe8ff", glow: "#8b7dff", ring: "#6d5efc" },
};

export default function HeroVisual() {
  const { resolvedTheme } = useTheme();
  const containerRef = useRef<HTMLDivElement>(null);
  const [mode, setMode] = useState<Mode>("pending");
  const [visible, setVisible] = useState(true);

  // Choix du niveau de qualité
  useEffect(() => {
    const reduceMotion = window.matchMedia(
      "(prefers-reduced-motion: reduce)",
    ).matches;
    const smallScreen = window.matchMedia("(max-width: 767px)").matches;
    const weakDevice = (navigator.hardwareConcurrency ?? 4) <= 4;

    // eslint-disable-next-line react-hooks/set-state-in-effect
    setMode(reduceMotion ? "static" : smallScreen || weakDevice ? "lite" : "full");
  }, []);

  // Pause du rendu quand la scène n'est plus à l'écran
  useEffect(() => {
    const el = containerRef.current;
    if (!el) return;
    const observer = new IntersectionObserver(
      ([entry]) => setVisible(entry.isIntersecting),
      { threshold: 0.05 },
    );
    observer.observe(el);
    return () => observer.disconnect();
  }, []);

  const palette = resolvedTheme === "dark" ? PALETTE.dark : PALETTE.light;

  return (
    <div
      ref={containerRef}
      aria-hidden="true"
      className="relative mx-auto aspect-square w-full max-w-sm md:max-w-none"
    >
      {mode === "pending" || mode === "static" ? (
        <SceneFallback />
      ) : (
        <HeroScene palette={palette} lite={mode === "lite"} active={visible} />
      )}
    </div>
  );
}