"use client";

import Image from "next/image";
import Link from "next/link";
import {
  memo,
  useCallback,
  useRef,
  type MouseEvent as ReactMouseEvent,
} from "react";
import {
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

/* -------------------------------------------------------------------------- */
/*  Public API                                                                */
/* -------------------------------------------------------------------------- */

export type ProjectCardLayout = "large" | "wide" | "tall" | "small";

export interface ProjectCardProps {
  readonly project: Project;
  readonly layout?: ProjectCardLayout;
}

/* -------------------------------------------------------------------------- */
/*  Tunables                                                                  */
/* -------------------------------------------------------------------------- */

const TILT_DEG = 9;
const TILT_SPRING = { stiffness: 220, damping: 22, mass: 0.55 } as const;
const HOVER_SPRING = { stiffness: 280, damping: 24, mass: 0.6 } as const;

/** Bento span classes per layout key. Mobile is always 1-col. */
const LAYOUT_SPAN: Record<ProjectCardLayout, string> = {
  large: "md:col-span-2 xl:col-span-4 xl:row-span-2",
  tall:  "md:col-span-1 xl:col-span-2 xl:row-span-2",
  wide:  "md:col-span-2 xl:col-span-4",
  small: "md:col-span-1 xl:col-span-2",
};

/** Image height tracks the layout — taller layouts get a taller hero. */
const IMAGE_HEIGHT: Record<ProjectCardLayout, string> = {
  large: "h-56 md:h-72 xl:h-80",
  tall:  "h-56 md:h-64 xl:h-80",
  wide:  "h-44 md:h-52",
  small: "h-44 md:h-48",
};

/** Entrance variant — controlled by the parent grid's staggerChildren. */
export const projectCardVariants: Variants = {
  hidden: { opacity: 0, y: 36, filter: "blur(10px)" },
  visible: {
    opacity: 1,
    y: 0,
    filter: "blur(0px)",
    transition: { type: "spring", stiffness: 120, damping: 20, mass: 0.7 },
  },
};

/** A motion-enabled Link so the entire card is one navigable surface. */
const MotionLink = motion.create(Link);

/* -------------------------------------------------------------------------- */
/*  Component                                                                 */
/* -------------------------------------------------------------------------- */

function ProjectCardImpl({ project, layout = "small" }: ProjectCardProps) {
  const surfaceRef = useRef<HTMLAnchorElement | null>(null);
  const prefersReducedMotion = useReducedMotion();

  // Normalized cursor position inside the card (0..1). Defaults to centered.
  const px = useMotionValue(0.5);
  const py = useMotionValue(0.5);

  // 3D tilt — invert Y so pointer-up tilts the card backward (natural).
  const rotateX = useSpring(
    useTransform(py, [0, 1], [TILT_DEG, -TILT_DEG]),
    TILT_SPRING,
  );
  const rotateY = useSpring(
    useTransform(px, [0, 1], [-TILT_DEG, TILT_DEG]),
    TILT_SPRING,
  );

  // Cursor in % for the radial gradients (spotlight + border beam).
  const mxPct = useTransform(px, (v) => `${v * 100}%`);
  const myPct = useTransform(py, (v) => `${v * 100}%`);

  const spotlight = useMotionTemplate`radial-gradient(320px circle at ${mxPct} ${myPct}, rgba(226, 232, 240, 0.16), transparent 65%)`;
  const beam = useMotionTemplate`radial-gradient(420px circle at ${mxPct} ${myPct}, rgba(255, 255, 255, 0.55), rgba(212, 175, 55, 0.18) 35%, transparent 65%)`;

  const handleMove = useCallback(
    (e: ReactMouseEvent<HTMLAnchorElement>) => {
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

  return (
    <motion.div
      layoutId={`project-${project.id}`}
      variants={projectCardVariants}
      className={[
        "group/card relative h-full",
        // Perspective lives on the parent so the inner rotation has depth.
        "[perspective:1400px]",
        LAYOUT_SPAN[layout],
      ].join(" ")}
    >
      <MotionLink
        ref={surfaceRef}
        href={`/projects/${project.id}`}
        onMouseMove={handleMove}
        onMouseLeave={handleLeave}
        whileHover={{ scale: 1.02, y: -2 }}
        transition={HOVER_SPRING}
        style={{
          rotateX: prefersReducedMotion ? 0 : rotateX,
          rotateY: prefersReducedMotion ? 0 : rotateY,
          transformStyle: "preserve-3d",
          backgroundColor: "rgba(10, 10, 10, 0.7)",
        }}
        className={[
          "relative flex h-full w-full flex-col overflow-hidden rounded-2xl",
          "border border-white/10 backdrop-blur-xl",
          "shadow-[0_10px_40px_-12px_rgba(0,0,0,0.6)]",
          "transition-shadow duration-500 ease-out",
          "group-hover/card:shadow-[0_30px_80px_-20px_rgba(212,175,55,0.22),0_0_0_1px_rgba(226,232,240,0.16)]",
          "will-change-transform",
          "focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-gold/60 focus-visible:ring-offset-2 focus-visible:ring-offset-background",
        ].join(" ")}
        aria-label={`${project.title} — ${project.tagline}`}
      >
        {/* ── Border Beam ── radial gradient masked to a 1px ring ── */}
        <motion.span
          aria-hidden
          style={{
            background: beam,
            WebkitMask:
              "linear-gradient(#000 0 0) content-box, linear-gradient(#000 0 0)",
            WebkitMaskComposite: "xor",
            maskComposite: "exclude",
            padding: "1px",
          }}
          className="pointer-events-none absolute inset-0 rounded-2xl opacity-0 transition-opacity duration-500 group-hover/card:opacity-100"
        />

        {/* ── Adaptive Spotlight ── follows cursor across the surface ── */}
        <motion.span
          aria-hidden
          style={{ background: spotlight }}
          className="pointer-events-none absolute inset-0 rounded-2xl opacity-0 transition-opacity duration-500 group-hover/card:opacity-100"
        />

        {/* ── Parallax Layer 1: hero image (translateZ 28px) ── */}
        <motion.div
          style={{
            transform: "translateZ(28px)",
            transformStyle: "preserve-3d",
          }}
          className={[
            "relative w-full overflow-hidden",
            IMAGE_HEIGHT[layout],
          ].join(" ")}
        >
          <Image
            src={project.visuals.mainImage}
            alt={`${project.title} — cover image`}
            fill
            sizes="(max-width: 768px) 100vw, (max-width: 1280px) 50vw, 33vw"
            className="object-cover transition-transform duration-700 ease-out group-hover/card:scale-[1.04]"
          />
          {/* Bottom fade so the parallax text reads cleanly over the image. */}
          <div
            aria-hidden
            className="absolute inset-0 bg-gradient-to-b from-transparent via-black/30 to-[rgba(10,10,10,0.95)]"
          />
        </motion.div>

        {/* ── Parallax Layer 2: text content (translateZ 56px) ── */}
        <motion.div
          style={{
            transform: "translateZ(56px)",
            transformStyle: "preserve-3d",
          }}
          className="relative flex flex-1 flex-col gap-3 p-6"
        >
          <header className="flex items-start justify-between gap-3">
            <span className="text-[11px] uppercase tracking-[0.18em] text-subtle">
              {project.category}
            </span>
            <ArrowUpRight
              className="h-4 w-4 shrink-0 text-muted transition-all duration-300 group-hover/card:-translate-y-0.5 group-hover/card:translate-x-0.5 group-hover/card:text-[#E2E8F0]"
              aria-hidden
            />
          </header>

          <h3
            className="font-display text-xl font-semibold tracking-tight text-[#E2E8F0] md:text-2xl"
            style={{
              textShadow: "0 1px 24px rgba(226, 232, 240, 0.12)",
            }}
          >
            {project.title}
          </h3>

          <p className="line-clamp-2 text-sm leading-relaxed text-muted">
            {project.tagline}
          </p>

          <ul className="mt-auto flex flex-wrap items-center gap-1.5 pt-2">
            {project.techStack.slice(0, 4).map((t) => (
              <li
                key={t.name}
                className="rounded-full border border-white/10 bg-white/[0.03] px-2.5 py-0.5 text-[10px] uppercase tracking-wider text-muted"
              >
                {t.name}
              </li>
            ))}
            {project.techStack.length > 4 ? (
              <li className="text-[10px] uppercase tracking-wider text-subtle">
                +{project.techStack.length - 4}
              </li>
            ) : null}
          </ul>
        </motion.div>
      </MotionLink>
    </motion.div>
  );
}

const ProjectCard = memo(ProjectCardImpl);
ProjectCard.displayName = "ProjectCard";
export default ProjectCard;
