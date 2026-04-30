"use client";

import {
  memo,
  useCallback,
  useEffect,
  useMemo,
  useRef,
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
} from "motion/react";
import type { IconType } from "react-icons";
import { FaGithub, FaLinkedin, FaXTwitter, FaAws } from "react-icons/fa6";
import {
  SiNextdotjs,
  SiTypescript,
  SiGo,
  SiNodedotjs,
  SiDocker,
  SiPostgresql,
} from "react-icons/si";

/* -------------------------------------------------------------------------- */
/*  Types                                                                     */
/* -------------------------------------------------------------------------- */

interface SocialLink {
  readonly name: string;
  readonly href: string;
  readonly Icon: IconType;
  /** Brand-tone for the radial hover glow. */
  readonly glow: string;
}

interface TechItem {
  readonly name: string;
  readonly Icon: IconType;
  /** Authentic brand color, applied once the icon de-saturates on hover. */
  readonly color: string;
}

/* -------------------------------------------------------------------------- */
/*  Constants                                                                 */
/* -------------------------------------------------------------------------- */

const SILVER = "#E2E8F0";
const NEON_GREEN = "#10B981";
const NEON_GOLD = "#D4AF37";

const SOCIALS: readonly SocialLink[] = [
  { name: "GitHub",   href: "https://github.com/Rakib-11A",                     Icon: FaGithub,   glow: "#ffffff" },
  { name: "LinkedIn", href: "https://www.linkedin.com/in/rakib-hasan-11a/",     Icon: FaLinkedin, glow: "#0A66C2" },
  { name: "Twitter",  href: "https://twitter.com/Rakib_11A",                    Icon: FaXTwitter, glow: "#E2E8F0" },
];

const TECH: readonly TechItem[] = [
  { name: "Next.js",    Icon: SiNextdotjs,  color: "#FFFFFF" },
  { name: "TypeScript", Icon: SiTypescript, color: "#3178C6" },
  { name: "Go",         Icon: SiGo,         color: "#00ADD8" },
  { name: "Node.js",    Icon: SiNodedotjs,  color: "#5FA04E" },
  { name: "AWS",        Icon: FaAws,        color: "#FF9900" },
  { name: "Docker",     Icon: SiDocker,     color: "#2496ED" },
  { name: "PostgreSQL", Icon: SiPostgresql, color: "#336791" },
];

/* -------------------------------------------------------------------------- */
/*  Footer (root)                                                             */
/* -------------------------------------------------------------------------- */

function FooterImpl() {
  const year = useMemo<number>(() => new Date().getFullYear(), []);

  return (
    <motion.footer
      initial={{ opacity: 0, y: 40, filter: "blur(8px)" }}
      whileInView={{ opacity: 1, y: 0, filter: "blur(0px)" }}
      viewport={{ once: true, amount: 0.2 }}
      transition={{ type: "spring", stiffness: 160, damping: 28, mass: 1 }}
      className={[
        "relative isolate w-full overflow-hidden",
        "bg-black",
        "px-4 pb-8 pt-14 sm:px-6 md:pt-20",
      ].join(" ")}
    >
      {/* Ambient halo — barely-there brand wash. */}
      <div
        aria-hidden
        className="pointer-events-none absolute inset-0 -z-10 opacity-60"
        style={{
          background:
            "radial-gradient(50% 60% at 15% 0%, rgba(212,175,55,0.06) 0%, transparent 65%), radial-gradient(45% 55% at 85% 100%, rgba(16,185,129,0.06) 0%, transparent 65%)",
        }}
      />

      <div className="mx-auto flex max-w-6xl flex-col gap-12">
        <ExecutiveGrid year={year} />
        <TechOrbit />
        {/* Border container — the beam lives inside this 1px frame. */}
        <div className="relative h-px w-full">
          <BorderBeam />
        </div>
        <Copyright year={year} />
      </div>
    </motion.footer>
  );
}

const Footer = memo(FooterImpl);
Footer.displayName = "Footer";
export default Footer;

/* ========================================================================== */
/*  Executive grid — sign-off · socials · status                              */
/* ========================================================================== */

const ExecutiveGrid = memo(function ExecutiveGrid({ year }: { year: number }) {
  return (
    <div className="grid grid-cols-1 items-center gap-8 md:grid-cols-3">
      <SignOff year={year} />
      <SocialRow />
      <StatusIndicator />
    </div>
  );
});

/* ── Sign-off (left) ──────────────────────────────────────────────────────── */

const SignOff = memo(function SignOff({ year }: { year: number }) {
  return (
    <div className="text-center md:text-left">
      <p className="font-mono text-[10px] uppercase tracking-[0.28em] text-subtle">
        Sign-off
      </p>
      <p
        className="mt-1.5 text-sm font-medium leading-relaxed md:text-base"
        style={{
          backgroundImage:
            "linear-gradient(110deg, #FFFFFF 0%, #E2E8F0 38%, #94A3B8 70%, #E2E8F0 100%)",
          backgroundClip: "text",
          WebkitBackgroundClip: "text",
          color: "transparent",
          textShadow: "0 1px 24px rgba(226,232,240,0.18)",
        }}
      >
        Architected &amp; Engineered by Rakib Hasan — {year}
      </p>
    </div>
  );
});

/* ── Social row (center) ──────────────────────────────────────────────────── */

const SocialRow = memo(function SocialRow() {
  return (
    <ul className="flex items-center justify-center gap-4">
      {SOCIALS.map((s) => (
        <li key={s.name}>
          <MagneticIcon social={s} />
        </li>
      ))}
    </ul>
  );
});

const MAGNET_SPRING = { stiffness: 280, damping: 22, mass: 0.5 } as const;

function MagneticIconImpl({ social }: { social: SocialLink }) {
  const ref = useRef<HTMLAnchorElement>(null);
  const prefersReducedMotion = useReducedMotion();

  const x = useMotionValue(0);
  const y = useMotionValue(0);
  const sx = useSpring(x, MAGNET_SPRING);
  const sy = useSpring(y, MAGNET_SPRING);
  const innerX = useTransform(sx, (v) => v * 0.4);
  const innerY = useTransform(sy, (v) => v * 0.4);

  const handleMove = useCallback(
    (e: ReactMouseEvent<HTMLAnchorElement>) => {
      if (prefersReducedMotion || !ref.current) return;
      const rect = ref.current.getBoundingClientRect();
      const cx = rect.left + rect.width / 2;
      const cy = rect.top + rect.height / 2;
      x.set((e.clientX - cx) * 0.45);
      y.set((e.clientY - cy) * 0.45);
    },
    [prefersReducedMotion, x, y],
  );

  const handleLeave = useCallback(() => {
    x.set(0);
    y.set(0);
  }, [x, y]);

  return (
    <motion.a
      ref={ref}
      href={social.href}
      target="_blank"
      rel="noopener noreferrer"
      aria-label={social.name}
      onMouseMove={handleMove}
      onMouseLeave={handleLeave}
      style={{ x: sx, y: sy }}
      className={[
        "group/icon relative inline-flex h-11 w-11 items-center justify-center",
        "rounded-full border border-white/10 bg-black/40 backdrop-blur-md",
        "text-foreground/80 transition-[border-color,color,box-shadow] duration-300",
        "hover:border-white/30 hover:text-white",
        "focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-gold/60",
      ].join(" ")}
    >
      {/* Brand-color radial glow on hover. */}
      <span
        aria-hidden
        className="pointer-events-none absolute -inset-2 rounded-full opacity-0 blur-md transition-opacity duration-300 group-hover/icon:opacity-100"
        style={{
          background: `radial-gradient(60% 60% at 50% 50%, ${social.glow}66, transparent 70%)`,
        }}
      />
      <motion.span style={{ x: innerX, y: innerY }} className="inline-flex">
        <social.Icon className="h-4 w-4 md:h-5 md:w-5" />
      </motion.span>
    </motion.a>
  );
}

const MagneticIcon = memo(MagneticIconImpl);
MagneticIcon.displayName = "MagneticIcon";

/* ── Status indicator (right) ─────────────────────────────────────────────── */

const StatusIndicator = memo(function StatusIndicator() {
  const prefersReducedMotion = useReducedMotion();

  return (
    <div className="flex items-center justify-center gap-2.5 md:justify-end">
      <span className="relative inline-flex h-2.5 w-2.5">
        {/* Outer halo — fades outward on each beat. */}
        {prefersReducedMotion ? null : (
          <motion.span
            aria-hidden
            className="absolute inset-0 rounded-full"
            style={{ backgroundColor: NEON_GREEN }}
            animate={{ scale: [1, 2.1, 1], opacity: [0.55, 0, 0.55] }}
            transition={{ duration: 1.8, ease: "easeOut", repeat: Infinity }}
          />
        )}
        {/* Inner heartbeat — true spring physics with reverse repeat. */}
        <motion.span
          className="relative inline-flex h-2.5 w-2.5 rounded-full"
          style={{
            backgroundColor: NEON_GREEN,
            boxShadow: `0 0 12px ${NEON_GREEN}, 0 0 4px ${NEON_GREEN}`,
          }}
          animate={prefersReducedMotion ? undefined : { scale: 1.18 }}
          transition={{
            type: "spring",
            stiffness: 200,
            damping: 7,
            mass: 0.6,
            repeat: Infinity,
            repeatType: "reverse",
          }}
        />
      </span>
      <span
        className="font-mono text-[11px] uppercase tracking-[0.22em]"
        style={{ color: SILVER }}
      >
        Available for Work
      </span>
    </div>
  );
});

/* ========================================================================== */
/*  Tech Orbit — grayscale → brand-color on hover, springy scale              */
/* ========================================================================== */

const TechOrbit = memo(function TechOrbit() {
  return (
    <div className="flex flex-col items-center gap-4">
      <span className="font-mono text-[10px] uppercase tracking-[0.28em] text-subtle">
        Engineering Pedigree
      </span>
      <ul className="flex flex-wrap items-center justify-center gap-x-8 gap-y-5 sm:gap-x-10">
        {TECH.map((t) => (
          <li key={t.name}>
            <TechBadge item={t} />
          </li>
        ))}
      </ul>
    </div>
  );
});

const TECH_HOVER_SPRING = { type: "spring", stiffness: 320, damping: 18, mass: 0.6 } as const;

function TechBadgeImpl({ item }: { item: TechItem }) {
  return (
    <motion.div
      whileHover={{ scale: 1.18 }}
      transition={TECH_HOVER_SPRING}
      className="group/tech relative flex flex-col items-center gap-1.5"
    >
      {/* Icon — grayscale at rest, full brand color on hover. */}
      <span
        className={[
          "inline-flex h-6 w-6 items-center justify-center text-2xl",
          "grayscale transition-[filter] duration-500 ease-out",
          "group-hover/tech:grayscale-0",
        ].join(" ")}
        style={{ color: item.color, willChange: "filter" }}
        aria-hidden
      >
        <item.Icon />
      </span>
      <span className="font-mono text-[9.5px] uppercase tracking-[0.18em] text-subtle opacity-0 transition-opacity duration-300 group-hover/tech:opacity-100">
        {item.name}
      </span>
    </motion.div>
  );
}

const TechBadge = memo(TechBadgeImpl);
TechBadge.displayName = "TechBadge";

/* ========================================================================== */
/*  Border Beam — semi-transparent metallic line + travelling light streak    */
/* ========================================================================== */

const BorderBeam = memo(function BorderBeam() {
  const prefersReducedMotion = useReducedMotion();
  const beamAngle = useMotionValue(0);

  // Continuously rotating conic gradient — matches ProjectCard's border-beam.
  useEffect(() => {
    if (prefersReducedMotion) return;
    const controls = animate(beamAngle, 360, {
      duration: 8,
      ease: "linear",
      repeat: Infinity,
    });
    return () => controls.stop();
  }, [beamAngle, prefersReducedMotion]);

  const beam = useMotionTemplate`conic-gradient(from ${beamAngle}deg at 50% 50%, transparent 0deg, ${SILVER} 80deg, ${NEON_GOLD} 160deg, transparent 200deg, ${SILVER} 280deg, transparent 360deg)`;

  return (
    <div className="relative h-px w-full overflow-hidden" aria-hidden>
      {/* Static metallic edge — base separator. */}
      <div
        className="absolute inset-0"
        style={{
          background:
            "linear-gradient(90deg, transparent 0%, rgba(226,232,240,0.18) 35%, rgba(226,232,240,0.22) 50%, rgba(226,232,240,0.18) 65%, transparent 100%)",
        }}
      />
      {/* Travelling light streak — conic gradient masked to a 1px ring. */}
      {prefersReducedMotion ? null : (
        <motion.span
          aria-hidden
          style={{
            background: beam,
            WebkitMask:
              "linear-gradient(#000 0 0) content-box, linear-gradient(#000 0 0)",
            mask: "linear-gradient(#000 0 0) content-box, linear-gradient(#000 0 0)",
            WebkitMaskComposite: "xor",
            maskComposite: "exclude",
            padding: "1px",
          }}
          className="pointer-events-none absolute inset-0 rounded-none opacity-70"
        />
      )}
    </div>
  );
});

/* ========================================================================== */
/*  Copyright                                                                 */
/* ========================================================================== */

const Copyright = memo(function Copyright({ year }: { year: number }) {
  return (
    <div className="flex flex-col items-center justify-between gap-2 sm:flex-row">
      <p className="font-mono text-[11px] tracking-[0.18em] text-subtle">
        © {year} Rakib Hasan. All rights reserved.
      </p>
      <p className="font-mono text-[10px] uppercase tracking-[0.22em] text-subtle/80">
        Built with Next.js · TypeScript · Motion
      </p>
    </div>
  );
});
