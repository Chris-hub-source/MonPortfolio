"use client";

import type { ReactNode } from "react";
import { motion, useReducedMotion } from "framer-motion";

const ease: [number, number, number, number] = [0.22, 1, 0.36, 1];

type Tag = "div" | "ul" | "ol" | "li";

type Props = {
  children: ReactNode;
  className?: string;
  as?: Tag;
};

// Conteneur : fait apparaître ses StaggerItem les uns après les autres
export function Stagger({
  children,
  className,
  as = "div",
  stagger = 0.09,
  delay = 0,
}: Props & { stagger?: number; delay?: number }) {
  const reduce = useReducedMotion();
  const Comp = motion[as] as typeof motion.div;

  return (
    <Comp
      className={className}
      initial={reduce ? "visible" : "hidden"}
      whileInView="visible"
      viewport={{ once: true, margin: "0px 0px -60px 0px" }}
      variants={{
        hidden: {},
        visible: { transition: { staggerChildren: stagger, delayChildren: delay } },
      }}
    >
      {children}
    </Comp>
  );
}

export function StaggerItem({ children, className, as = "div" }: Props) {
  const Comp = motion[as] as typeof motion.div;

  return (
    <Comp
      className={className}
      variants={{
        hidden: { opacity: 0, y: 24 },
        visible: { opacity: 1, y: 0, transition: { duration: 0.6, ease } },
      }}
    >
      {children}
    </Comp>
  );
}