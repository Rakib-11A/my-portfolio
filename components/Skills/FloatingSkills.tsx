"use client";

import { CSSProperties, ComponentType, SVGProps } from "react";
import { motion, useReducedMotion } from "motion/react";
import {
  SiDocker,
  SiGo,
  SiNextdotjs,
  SiNodedotjs,
  SiPostgresql,
  SiPrisma,
  SiRubyonrails,
  SiTailwindcss,
  SiTypescript,
} from "react-icons/si";

type IconComponent = ComponentType<{ className?: string }>;

type Skill = {
  name: string;
  Icon: IconComponent;
  color: string;
};

/**
 * Brand colors are taken from Simple Icons. A few are remapped because the
 * official mark is dark (#000 or near-black) and would vanish on the pitch
 * black theme — we substitute the most widely-recognised brand-aligned hue.
 *   - Next.js: #000000 → #FFFFFF (the official dark-theme variant)
 *   - Prisma:  #2D3748 → #5A67D8 (their canonical indigo gradient)
 *   - AWS:     #232F3E → #FF9900 (the iconic Amazon orange)
 */
const SKILLS: Skill[] = [
  { name: "TypeScript",    Icon: SiTypescript,   color: "#3178C6" },
  { name: "Go",            Icon: SiGo,           color: "#00ADD8" },
  { name: "Next.js",       Icon: SiNextdotjs,    color: "#FFFFFF" },
  { name: "Node.js",       Icon: SiNodedotjs,    color: "#5FA04E" },
  { name: "Docker",        Icon: SiDocker,       color: "#2496ED" },
  { name: "AWS",           Icon: SiAmazonAws,    color: "#FF9900" },
  { name: "PostgreSQL",    Icon: SiPostgresql,   color: "#4169E1" },
  { name: "Prisma",        Icon: SiPrisma,       color: "#5A67D8" },
  { name: "Tailwind CSS",  Icon: SiTailwindcss,  color: "#06B6D4" },
  { name: "Ruby on Rails", Icon: SiRubyonrails,  color: "#D30001" },
];

// Deterministic per-index float timing — random values would mismatch
// between SSR and CSR. These ranges keep the motion lively but graceful.
function floatTransition(index: number) {
  return {
    duration: 4.5 + ((index * 0.7) % 2.5),
    delay: (index * 0.43) % 3,
    repeat: Infinity,
    ease: "easeInOut" as const,
  };
}

export default function FloatingSkills() {
  const prefersReducedMotion = useReducedMotion();

  return (
    <section
      id="skills"
      className="relative px-6 py-24 sm:py-32"
      aria-labelledby="skills-heading"
    >
      <div className="mx-auto max-w-6xl">
        <header className="mb-16 max-w-2xl sm:mb-20 lg:mx-auto lg:text-center">
          <p className="mb-3 text-xs uppercase tracking-[0.28em] text-accent/85">
            The toolkit
          </p>
          <h2
            id="skills-heading"
            className="font-display text-4xl font-bold leading-tight tracking-tight text-foreground sm:text-5xl lg:text-6xl"
          >
            Tools I reach for{" "}
            <span className="bg-linear-to-r from-foreground to-muted bg-clip-text text-transparent">
              without thinking
            </span>
            .
          </h2>
        </header>

        <ul
          role="list"
          className="mx-auto flex max-w-5xl flex-wrap items-center justify-center gap-x-6 gap-y-14 sm:gap-x-10 sm:gap-y-16 lg:gap-x-12 lg:gap-y-20"
        >
          {SKILLS.map((skill, i) => (
            <SkillOrb
              key={skill.name}
              skill={skill}
              index={i}
              animate={!prefersReducedMotion}
            />
          ))}
        </ul>
      </div>
    </section>
  );
}

function SkillOrb({
  skill,
  index,
  animate,
}: {
  skill: Skill;
  index: number;
  animate: boolean;
}) {
  const Icon = skill.Icon;
  const styleVars = { "--brand": skill.color } as CSSProperties;

  return (
    <motion.li
      style={styleVars}
      animate={animate ? { y: [0, -15, 0] } : undefined}
      transition={animate ? floatTransition(index) : undefined}
      className="group relative"
    >
      <motion.div
        role="img"
        aria-label={skill.name}
        whileHover={{ scale: 1.1 }}
        whileTap={{ scale: 0.95 }}
        transition={{ type: "spring", stiffness: 320, damping: 20 }}
        className={[
          "relative grid place-items-center cursor-default",
          "h-20 w-20 sm:h-24 sm:w-24 lg:h-28 lg:w-28",
          "rounded-full",
          "border border-border bg-white/3 backdrop-blur-md",
          "shadow-[inset_0_1px_0_rgba(255,255,255,0.06)]",
          "transition-[border-color,box-shadow] duration-300",
          "group-hover:border-[color:var(--brand)]/45",
          "group-hover:shadow-[0_0_50px_-6px_color-mix(in_oklab,var(--brand)_60%,transparent),inset_0_1px_0_rgba(255,255,255,0.1)]",
        ].join(" ")}
      >
        {/* Inner radial wash that warms to the brand color on hover */}
        <span
          aria-hidden
          className="pointer-events-none absolute inset-0 rounded-full opacity-0 transition-opacity duration-300 group-hover:opacity-100"
          style={{
            background:
              "radial-gradient(circle at center, color-mix(in oklab, var(--brand) 28%, transparent) 0%, transparent 72%)",
          }}
        />

        <Icon
          className={[
            "relative h-9 w-9 sm:h-10 sm:w-10 lg:h-12 lg:w-12",
            "text-zinc-400/85 transition-[color,filter] duration-300",
            "group-hover:text-[color:var(--brand)]",
            "group-hover:[filter:drop-shadow(0_0_12px_var(--brand))]",
          ].join(" ")}
        />
      </motion.div>

      {/* Tooltip — absolutely positioned so it never affects layout */}
      <span
        aria-hidden
        className={[
          "pointer-events-none absolute left-1/2 top-full z-10 mt-4 -translate-x-1/2",
          "whitespace-nowrap rounded-full border border-border-strong bg-elevated/85 px-3 py-1",
          "text-xs font-medium text-foreground backdrop-blur-md",
          "opacity-0 -translate-y-1 transition-[opacity,transform] duration-200",
          "group-hover:opacity-100 group-hover:translate-y-0",
        ].join(" ")}
      >
        {skill.name}
      </span>
    </motion.li>
  );
}

/**
 * AWS was removed from `react-icons/si` (Simple Icons trademark cleanup).
 * Inline the canonical Simple Icons path so the orb renders identically to
 * the rest. Uses currentColor so the parent's color/drop-shadow cascade still
 * drives the brand-glow reveal.
 */
function SiAmazonAws({ className }: { className?: string }) {
  return (
    <svg
      viewBox="0 0 24 24"
      fill="currentColor"
      className={className}
      aria-hidden
      {...({} as SVGProps<SVGSVGElement>)}
    >
      <path d="M6.763 10.036c0 .296.032.535.088.71.064.176.144.368.256.576.04.063.056.127.056.183 0 .08-.048.16-.152.24l-.503.335a.383.383 0 0 1-.208.072c-.08 0-.16-.04-.239-.112a2.47 2.47 0 0 1-.287-.375 6.18 6.18 0 0 1-.248-.471c-.622.734-1.405 1.101-2.347 1.101-.67 0-1.205-.191-1.596-.574-.391-.384-.59-.894-.59-1.533 0-.678.239-1.23.726-1.644.487-.415 1.133-.623 1.955-.623.272 0 .551.024.846.064.296.04.6.104.918.176v-.583c0-.607-.127-1.03-.375-1.277-.255-.248-.686-.367-1.3-.367-.28 0-.568.031-.863.103-.295.072-.583.16-.862.272a2.287 2.287 0 0 1-.28.104.488.488 0 0 1-.127.023c-.112 0-.168-.08-.168-.247v-.391c0-.128.016-.224.056-.28a.597.597 0 0 1 .224-.167c.279-.144.614-.264 1.005-.36a4.84 4.84 0 0 1 1.246-.151c.95 0 1.644.216 2.091.647.439.43.662 1.085.662 1.963v2.586zm-3.24 1.214c.263 0 .534-.048.822-.144.287-.096.543-.271.758-.51.128-.152.224-.32.272-.512.047-.191.08-.423.08-.694v-.335a6.66 6.66 0 0 0-.735-.136 6.02 6.02 0 0 0-.75-.048c-.535 0-.926.104-1.19.32-.263.215-.39.518-.39.917 0 .375.095.655.295.846.191.2.47.296.838.296zm6.41.862c-.144 0-.24-.024-.304-.08-.064-.048-.12-.16-.168-.311L7.586 5.55a1.398 1.398 0 0 1-.072-.32c0-.128.064-.2.191-.2h.783c.151 0 .255.025.31.08.065.048.113.16.16.312l1.342 5.284 1.245-5.284c.04-.16.088-.264.151-.312a.549.549 0 0 1 .32-.08h.638c.152 0 .256.025.32.08.063.048.12.16.151.312l1.261 5.348 1.381-5.348c.048-.16.104-.264.16-.312a.52.52 0 0 1 .311-.08h.743c.127 0 .2.065.2.2 0 .04-.009.08-.017.128a1.137 1.137 0 0 1-.056.2l-1.923 6.17c-.048.16-.104.263-.168.311a.51.51 0 0 1-.303.08h-.687c-.151 0-.255-.024-.32-.08-.063-.056-.119-.16-.15-.32l-1.238-5.148-1.23 5.14c-.04.16-.087.264-.15.32-.065.056-.177.08-.32.08zm10.256.215c-.415 0-.83-.048-1.229-.143-.399-.096-.71-.2-.918-.32-.128-.071-.215-.151-.247-.223a.563.563 0 0 1-.048-.224v-.407c0-.167.064-.247.183-.247.048 0 .096.008.144.024.048.016.12.048.2.08.271.12.566.215.878.279.319.064.63.096.95.096.502 0 .894-.088 1.165-.264a.86.86 0 0 0 .415-.758.777.777 0 0 0-.215-.559c-.144-.151-.416-.287-.807-.415l-1.157-.36c-.583-.183-1.014-.454-1.277-.813a1.902 1.902 0 0 1-.4-1.158c0-.335.072-.63.216-.886.144-.255.335-.479.575-.654.24-.184.51-.32.83-.415.32-.096.655-.136 1.006-.136.175 0 .359.008.535.032.183.024.35.056.518.088.16.04.312.08.455.127.144.048.256.096.336.144a.69.69 0 0 1 .24.2.43.43 0 0 1 .071.263v.375c0 .168-.064.256-.184.256a.83.83 0 0 1-.303-.096 3.652 3.652 0 0 0-1.532-.311c-.455 0-.815.071-1.062.223-.248.152-.375.383-.375.71 0 .224.08.416.24.566.159.152.454.304.877.44l1.134.358c.574.184.99.44 1.237.767.247.327.367.702.367 1.117 0 .343-.072.655-.207.926-.144.272-.336.511-.583.703-.248.2-.543.343-.886.447-.36.111-.734.167-1.142.167zM21.698 16.207c-2.626 1.94-6.442 2.969-9.722 2.969-4.598 0-8.74-1.7-11.87-4.526-.247-.223-.024-.527.27-.351 3.384 1.963 7.559 3.153 11.877 3.153 2.914 0 6.114-.607 9.06-1.852.439-.2.814.287.385.607zM22.792 14.961c-.336-.43-2.22-.207-3.074-.103-.255.032-.295-.192-.063-.36 1.5-1.053 3.967-.75 4.254-.399.287.36-.08 2.826-1.485 4.007-.215.184-.423.088-.327-.151.32-.79 1.03-2.57.694-2.994z" />
    </svg>
  );
}
