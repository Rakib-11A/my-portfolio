"use client";

import Image from "next/image";
import {
  memo,
  useCallback,
  useEffect,
  useRef,
  type CSSProperties,
  type MouseEvent as ReactMouseEvent,
} from "react";
import {
  animate,
  motion,
  useMotionTemplate,
  useMotionValue,
  useReducedMotion,
  useSpring,
  useTransform,
  type Variants,
} from "motion/react";
import { ArrowUpRight } from "lucide-react";

import type { Project } from "@/constants/projects";

export interface ProjectCardProps {
  readonly project: Project;
  /** Open the in-place detail modal — wired by the parent row. */
  readonly onOpen: (project: Project) => void;
}

const TILT_DEG = 9;
const TILT_SPRING = { stiffness: 240, damping: 26, mass: 0.5 } as const;
const HOVER_SPRING = { stiffness: 260, damping: 24, mass: 0.6 } as const;

/**
 * Per-project accent — Deep Space palette: gold, accent-green, metallic silver.
 * The card glow, beam, and spotlight all key off this value.
 */
const ACCENT_BY_ID: Readonly<Record<string, string>> = {
  "planora":            "#D4AF37", // gold
  "nexus-med":          "#10B981", // accent green
  "nagad-auto-lifting": "#D4AF37", // gold
  "syfmart":            "#10B981", // accent green
};
const SILVER = "#C0C8D0";

const getAccent = (id: string): string => ACCENT_BY_ID[id] ?? SILVER;

/** Blur-to-clear entrance — snaps via a high-damping spring. */
export const projectCardVariants: Variants = {
  hidden: { opacity: 0, y: 28, scale: 0.96, filter: "blur(10px)" },
  visible: {
    opacity: 1,
    y: 0,
    scale: 1,
    filter: "blur(0px)",
    transition: { type: "spring", stiffness: 200, damping: 28, mass: 0.8 },
  },
};

function ProjectCardImpl({ project, onOpen }: ProjectCardProps) {
  const surfaceRef = useRef<HTMLButtonElement | null>(null);
  const prefersReducedMotion = useReducedMotion();
  const accent = getAccent(project.id);

  // Normalised pointer position inside the card (0–1 on each axis).
  const px = useMotionValue(0.5);
  const py = useMotionValue(0.5);

  // Y is inverted so a pointer-up tilts the top edge backward.
  const rotateX = useSpring(
    useTransform(py, [0, 1], [TILT_DEG, -TILT_DEG]),
    TILT_SPRING,
  );
  const rotateY = useSpring(
    useTransform(px, [0, 1], [-TILT_DEG, TILT_DEG]),
    TILT_SPRING,
  );

  const mxPct = useTransform(px, (v) => `${v * 100}%`);
  const myPct = useTransform(py, (v) => `${v * 100}%`);

  // Cursor-tracked spotlight, tinted with the project's accent.
  const spotlight = useMotionTemplate`radial-gradient(520px circle at ${mxPct} ${myPct}, ${accent}26, transparent 55%)`;

  // Continuously rotating conic gradient — the "border beam".
  const beamAngle = useMotionValue(0);
  useEffect(() => {
    if (prefersReducedMotion) return;
    const controls = animate(beamAngle, 360, {
      duration: 6,
      ease: "linear",
      repeat: Infinity,
    });
    return () => controls.stop();
  }, [beamAngle, prefersReducedMotion]);
  const beam = useMotionTemplate`conic-gradient(from ${beamAngle}deg at 50% 50%, transparent 0deg, ${accent} 80deg, transparent 160deg, transparent 200deg, ${accent}80 280deg, transparent 360deg)`;

  const handleMove = useCallback(
    (e: ReactMouseEvent<HTMLButtonElement>) => {
      if (prefersReducedMotion || !surfaceRef.current) return;
      const rect = surfaceRef.current.getBoundingClientRect();
      px.set((e.clientX - rect.left) / rect.width);
      py.set((e.clientY - rect.top) / rect.height);
    },
    [prefersReducedMotion, px, py],
  );

  const handleLeave = useCallback(() => {
    px.set(0.5);
    py.set(0.5);
  }, [px, py]);

  const handleClick = useCallback(() => {
    onOpen(project);
  }, [onOpen, project]);

  // Card-scoped CSS variables so children can reference the accent in arbitrary utilities.
  const cardStyle = { "--accent": accent } as CSSProperties;

  return (
    <motion.div
      layoutId={`project-${project.id}`}
      variants={projectCardVariants}
      style={{ ...cardStyle, perspective: "1100px" }}
      className="group/card relative h-full w-full"
    >
      {/* Outer accent halo — deep, soft glow that lives behind the glass. */}
      <div
        aria-hidden
        className="pointer-events-none absolute -inset-px rounded-[1.05rem] opacity-40 blur-2xl transition-opacity duration-700 ease-out group-hover/card:opacity-90"
        style={{
          background: `radial-gradient(60% 60% at 50% 50%, ${accent}40 0%, transparent 70%)`,
        }}
      />

      <motion.button
        ref={surfaceRef}
        type="button"
        onClick={handleClick}
        onMouseMove={handleMove}
        onMouseLeave={handleLeave}
        whileHover={{ y: -3 }}
        transition={HOVER_SPRING}
        style={{
          rotateX: prefersReducedMotion ? 0 : rotateX,
          rotateY: prefersReducedMotion ? 0 : rotateY,
          transformStyle: "preserve-3d",
          // Glassmorphism — pitch black at the bottom, faintly lit at the top.
          backgroundColor: "rgba(10,10,10,0.7)",
          backgroundImage:
            "radial-gradient(120% 80% at 50% 0%, rgba(40,40,46,0.55) 0%, rgba(10,10,10,0.85) 55%, rgba(8,8,10,0.92) 100%)",
        }}
        className={[
          // Uniform sizing — every card is identical in footprint.
          "relative flex h-110 w-full flex-col overflow-hidden rounded-2xl text-left",
          // Ultra-thin metallic border + xl backdrop blur.
          "border border-white/10 backdrop-blur-xl",
          "shadow-[0_20px_60px_-20px_rgba(0,0,0,0.85)]",
          "transition-shadow duration-500 ease-out",
          "group-hover/card:shadow-[0_40px_120px_-30px_var(--accent),0_0_0_1px_rgba(255,255,255,0.10)]",
          "will-change-transform cursor-pointer",
          "focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-(--accent)/60 focus-visible:ring-offset-2 focus-visible:ring-offset-background",
        ].join(" ")}
        aria-label={`Open ${project.title} — ${project.tagline}`}
      >
        {/* Border beam — conic gradient masked to a 1px ring. */}
        <motion.span
          aria-hidden
          style={{
            background: beam,
            // Two-layer mask "punches out" the interior, leaving only a 1px frame.
            WebkitMask:
              "linear-gradient(#000 0 0) content-box, linear-gradient(#000 0 0)",
            mask: "linear-gradient(#000 0 0) content-box, linear-gradient(#000 0 0)",
            WebkitMaskComposite: "xor",
            maskComposite: "exclude",
            padding: "1px",
          }}
          className="pointer-events-none absolute inset-0 rounded-2xl opacity-60 transition-opacity duration-500 group-hover/card:opacity-100"
        />

        {/* Cursor-tracked spotlight. */}
        <motion.span
          aria-hidden
          style={{ background: spotlight }}
          className="pointer-events-none absolute inset-0 rounded-2xl opacity-0 transition-opacity duration-500 group-hover/card:opacity-100"
        />

        {/* Center-glow on the glass itself — barely-there interior light. */}
        <span
          aria-hidden
          className="pointer-events-none absolute inset-0 rounded-2xl"
          style={{
            background:
              "radial-gradient(75% 55% at 50% 30%, rgba(255,255,255,0.04) 0%, transparent 70%)",
          }}
        />

        {/* Layer 1 — recessed hero image (parallax: pushed away on Z). */}
        <motion.div
          style={{
            transform: "translateZ(-30px)",
            transformStyle: "preserve-3d",
          }}
          className="relative h-44 w-full overflow-hidden md:h-48"
        >
          <Image
            src={project.visuals.mainImage}
            alt={`${project.title} — cover`}
            fill
            sizes="(max-width: 768px) 100vw, (max-width: 1024px) 50vw, 33vw"
            className="object-cover filter-[grayscale(0.45)_contrast(1.05)] transition-[filter,transform] duration-700 ease-out group-hover/card:scale-[1.06] group-hover/card:filter-[grayscale(0)_contrast(1.1)]"
          />
          {/* Tint the cover with the accent — barely-there color wash. */}
          <div
            aria-hidden
            className="absolute inset-0 mix-blend-overlay opacity-30 transition-opacity duration-700 group-hover/card:opacity-50"
            style={{
              background: `linear-gradient(180deg, transparent 40%, ${accent}30 100%)`,
            }}
          />
          <div
            aria-hidden
            className="absolute inset-0 bg-linear-to-b from-transparent via-black/40 to-[rgba(8,8,10,0.95)]"
          />
        </motion.div>

        {/* Layer 2 — floating text content (parallax: pulled forward on Z). */}
        <motion.div
          style={{
            transform: "translateZ(40px)",
            transformStyle: "preserve-3d",
          }}
          className="relative flex flex-1 flex-col gap-3 p-6"
        >
          <header className="flex items-start justify-between gap-3">
            <div className="flex items-center gap-2">
              <span
                aria-hidden
                className="h-1.5 w-1.5 rounded-full"
                style={{
                  background: accent,
                  boxShadow: `0 0 12px ${accent}`,
                }}
              />
              <span className="font-mono text-[10px] uppercase tracking-[0.22em] text-subtle">
                {project.category}
              </span>
            </div>
            <motion.span
              style={{ transform: "translateZ(30px)" }}
              className="rounded-full border border-white/10 bg-black/40 p-1.5 backdrop-blur-md transition-all duration-300 group-hover/card:border-(--accent)/40 group-hover/card:bg-black/60"
            >
              <ArrowUpRight
                className="h-3.5 w-3.5 text-muted transition-all duration-300 group-hover/card:-translate-y-0.5 group-hover/card:translate-x-0.5 group-hover/card:text-foreground"
                aria-hidden
              />
            </motion.span>
          </header>

          <h3
            className="font-display text-lg font-semibold tracking-tight text-foreground md:text-xl"
            style={{
              textShadow: `0 1px 24px ${accent}24, 0 1px 2px rgba(0,0,0,0.5)`,
            }}
          >
            {project.title}
          </h3>

          <p className="line-clamp-2 text-sm leading-relaxed text-muted">
            {project.tagline}
          </p>

          {/* Layer 3 — tags, pushed even further forward in Z. */}
          <motion.ul
            style={{
              transform: "translateZ(20px)",
              transformStyle: "preserve-3d",
            }}
            className="mt-auto flex flex-wrap items-center gap-1.5 pt-3"
          >
            {project.techStack.slice(0, 4).map((t) => (
              <li
                key={t.name}
                className="rounded-full border border-white/10 bg-white/5 px-2.5 py-0.5 font-mono text-[10px] uppercase tracking-wider text-muted backdrop-blur-md transition-colors duration-300 group-hover/card:border-(--accent)/30 group-hover/card:text-foreground"
              >
                {t.name}
              </li>
            ))}
            {project.techStack.length > 4 ? (
              <li className="font-mono text-[10px] uppercase tracking-wider text-subtle">
                +{project.techStack.length - 4}
              </li>
            ) : null}
          </motion.ul>
        </motion.div>
      </motion.button>
    </motion.div>
  );
}

const ProjectCard = memo(ProjectCardImpl);
ProjectCard.displayName = "ProjectCard";
export default ProjectCard;
