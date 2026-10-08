import { RING_A, RING_B } from "@/components/three/techs";

const techs = [...RING_A, ...RING_B];

export default function TechMarquee() {
  return (
    <div
      aria-hidden="true"
      className="overflow-hidden border-y border-border py-6 [mask-image:linear-gradient(to_right,transparent,black_12%,black_88%,transparent)]"
    >
      {/* Deux copies identiques : la boucle est invisible */}
      <div className="flex w-max animate-marquee hover:[animation-play-state:paused]">
        {[0, 1].map((copy) => (
          <ul key={copy} className="flex shrink-0 items-center gap-12 pr-12">
            {techs.map((tech) => (
              <li
                key={tech.title}
                className="flex items-center gap-3 text-muted transition hover:text-foreground"
              >
                <svg viewBox="0 0 24 24" className="h-7 w-7" fill="currentColor">
                  <path d={tech.path} />
                </svg>
                <span className="whitespace-nowrap text-sm font-medium">
                  {tech.title}
                </span>
              </li>
            ))}
          </ul>
        ))}
      </div>
    </div>
  );
}