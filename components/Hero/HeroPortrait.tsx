"use client";

import {
  memo,
  useCallback,
  useId,
  useMemo,
  useState,
  type PointerEvent,
} from "react";
import Image from "next/image";
import {
  motion,
  useMotionTemplate,
  useMotionValue,
  useSpring,
  useTransform,
} from "motion/react";

interface HeroPortraitProps {
  readonly imageSrc?: string;
  readonly alt?: string;
}

interface SystemTag {
  readonly label: string;
  readonly className: string;
  readonly delay: number;
  readonly float: [number, number, number];
}

const SILVER = "#E2E8F0";
const GOLD = "#D4AF37";
const GREEN = "#10B981";
const VESSEL_PATH =
  "M137 10C171 10 201 24 222 48L291 127C306 144 314 166 312 189L302 287C299 317 278 342 249 351L162 379C143 385 122 383 105 372L37 330C16 317 4 293 8 268L24 173C27 153 24 132 16 113L12 103C4 82 10 58 28 44L72 20C91 13 113 10 137 10Z";

const TAGS: readonly SystemTag[] = [
  {
    label: "[STATUS: ACTIVE]",
    className: "left-1 top-8 sm:-left-8 md:-left-16 md:top-16",
    delay: 1.25,
    float: [0, -7, 0],
  },
  {
    label: "[ROLE: FULLSTACK_ENG]",
    className: "right-0 top-2 sm:-right-10 md:-right-16 md:top-12",
    delay: 1.38,
    float: [0, 6, 0],
  },
  {
    label: "[LOC: DHAKA_BD]",
    className: "bottom-10 left-0 sm:-left-10 md:-left-14 md:bottom-16",
    delay: 1.51,
    float: [0, 5, 0],
  },
  {
    label: "[LINK: SECURE]",
    className: "bottom-1 right-5 sm:-right-4 md:-right-10 md:bottom-12",
    delay: 1.64,
    float: [0, -6, 0],
  },
];

function HeroPortraitImpl({
  imageSrc,
  alt = "Rakib Hasan portrait",
}: HeroPortraitProps) {
  const rawId = useId();
  const clipId = useMemo(
    () => `hero-portrait-${rawId.replace(/[^a-zA-Z0-9_-]/g, "")}`,
    [rawId],
  );
  const maskId = `${clipId}-mask`;
  const [imageFailed, setImageFailed] = useState(false);

  const pointerX = useMotionValue(0);
  const pointerY = useMotionValue(0);
  const springX = useSpring(pointerX, { stiffness: 180, damping: 22, mass: 0.35 });
  const springY = useSpring(pointerY, { stiffness: 180, damping: 22, mass: 0.35 });

  const rotateY = useTransform(springX, [-1, 1], [-12, 12]);
  const rotateX = useTransform(springY, [-1, 1], [10, -10]);
  const imageX = useTransform(springX, [-1, 1], [-12, 12]);
  const imageY = useTransform(springY, [-1, 1], [-10, 10]);
  const glassX = useTransform(springX, [-1, 1], [-5, 5]);
  const glassY = useTransform(springY, [-1, 1], [-4, 4]);
  const auraX = useTransform(springX, [-1, 1], [38, 62]);
  const auraY = useTransform(springY, [-1, 1], [60, 40]);
  const auraBackground = useMotionTemplate`radial-gradient(circle at ${auraX}% ${auraY}%, rgba(212,175,55,0.22), rgba(16,185,129,0.10) 34%, rgba(0,0,0,0) 68%)`;
  const imageTransform = useMotionTemplate`translate3d(${imageX}px, ${imageY}px, 42px) scale(1.04)`;
  const glassTransform = useMotionTemplate`translate3d(${glassX}px, ${glassY}px, 72px)`;

  const handlePointerMove = useCallback(
    (event: PointerEvent<HTMLDivElement>) => {
      const rect = event.currentTarget.getBoundingClientRect();
      const x = ((event.clientX - rect.left) / rect.width - 0.5) * 2;
      const y = ((event.clientY - rect.top) / rect.height - 0.5) * 2;

      pointerX.set(Math.max(-1, Math.min(1, x)));
      pointerY.set(Math.max(-1, Math.min(1, y)));
    },
    [pointerX, pointerY],
  );

  const handlePointerLeave = useCallback(() => {
    pointerX.set(0);
    pointerY.set(0);
  }, [pointerX, pointerY]);

  const handleImageError = useCallback(() => {
    setImageFailed(true);
  }, []);

  return (
    <div className="pointer-events-none absolute inset-0 z-[8] flex items-center justify-center px-6 pt-24 sm:pt-20 md:justify-end md:px-12 lg:px-20">
      <div className="relative h-[min(54vw,19rem)] min-h-56 w-[min(64vw,23rem)] min-w-64 md:h-[25rem] md:w-[30rem] lg:h-[29rem] lg:w-[34rem]">
        <motion.div
          aria-hidden
          className="absolute inset-6 rounded-full blur-3xl will-change-transform"
          style={{ background: auraBackground, x: glassX, y: glassY }}
        />

        <motion.div
          initial={{ opacity: 0, y: 24, scale: 0.96, filter: "blur(10px)" }}
          animate={{ opacity: 1, y: 0, scale: 1, filter: "blur(0px)" }}
          transition={{ duration: 0.75, delay: 0.9, ease: [0.22, 1, 0.36, 1] }}
          onPointerMove={handlePointerMove}
          onPointerLeave={handlePointerLeave}
          className="pointer-events-auto absolute left-1/2 top-1/2 h-[21rem] w-[17.6rem] -translate-x-1/2 -translate-y-1/2 outline-none will-change-transform md:h-[25rem] md:w-[20.8rem] lg:h-[28rem] lg:w-[23.2rem]"
          style={{
            perspective: 900,
            transformStyle: "preserve-3d",
          }}
        >
          <motion.div
            className="group/portrait relative h-full w-full will-change-transform"
            style={{
              rotateX,
              rotateY,
              transformStyle: "preserve-3d",
            }}
          >
            <svg width="0" height="0" aria-hidden className="absolute">
              <defs>
                <mask id={maskId} maskContentUnits="objectBoundingBox">
                  <path
                    fill="white"
                    d="M0.431 0.026C0.538 0.026 0.628 0.063 0.694 0.124L0.909 0.329C0.956 0.373 0.981 0.43 0.975 0.49L0.944 0.744C0.934 0.821 0.869 0.886 0.778 0.909L0.506 0.982C0.447 0.997 0.381 0.992 0.328 0.964L0.116 0.855C0.05 0.821 0.013 0.759 0.025 0.694L0.075 0.448C0.084 0.396 0.075 0.342 0.05 0.293L0.038 0.267C0.013 0.213 0.031 0.15 0.088 0.114L0.225 0.052C0.284 0.034 0.353 0.026 0.431 0.026Z"
                  />
                </mask>
                <clipPath id={clipId} clipPathUnits="objectBoundingBox">
                  <path
                    d="M0.431 0.026C0.538 0.026 0.628 0.063 0.694 0.124L0.909 0.329C0.956 0.373 0.981 0.43 0.975 0.49L0.944 0.744C0.934 0.821 0.869 0.886 0.778 0.909L0.506 0.982C0.447 0.997 0.381 0.992 0.328 0.964L0.116 0.855C0.05 0.821 0.013 0.759 0.025 0.694L0.075 0.448C0.084 0.396 0.075 0.342 0.05 0.293L0.038 0.267C0.013 0.213 0.031 0.15 0.088 0.114L0.225 0.052C0.284 0.034 0.353 0.026 0.431 0.026Z"
                  />
                </clipPath>
              </defs>
            </svg>

            <motion.div
              className="absolute inset-0 overflow-hidden bg-zinc-950/45 backdrop-blur-xl"
              style={{
                mask: `url(#${maskId})`,
                WebkitMask: `url(#${maskId})`,
                clipPath: `url(#${clipId})`,
                WebkitClipPath: `url(#${clipId})`,
                transform: imageTransform,
              }}
            >
              {!imageSrc || imageFailed ? (
                <div className="flex h-full w-full items-center justify-center bg-[radial-gradient(circle_at_50%_35%,rgba(212,175,55,0.16),rgba(16,185,129,0.08)_32%,rgba(0,0,0,0.92)_74%)] font-display text-6xl font-bold tracking-tight text-[#E2E8F0]/80">
                  RH
                </div>
              ) : (
                <Image
                  src={imageSrc}
                  alt={alt}
                  fill
                  priority
                  sizes="(min-width: 1024px) 370px, (min-width: 768px) 333px, 282px"
                  onError={handleImageError}
                  className="object-cover object-center opacity-90 grayscale-[30%] contrast-110 transition-[filter,opacity,transform] duration-500 group-hover/portrait:scale-[1.015] group-hover/portrait:grayscale-0 group-hover/portrait:brightness-110"
                />
              )}
              <div className="pointer-events-none absolute inset-0 bg-[linear-gradient(180deg,rgba(226,232,240,0.10),transparent_24%,rgba(0,0,0,0.30)_100%)]" />
            </motion.div>

            <motion.div
              aria-hidden
              className="absolute inset-0 backdrop-blur-xl"
              style={{
                mask: `url(#${maskId})`,
                WebkitMask: `url(#${maskId})`,
                clipPath: `url(#${clipId})`,
                WebkitClipPath: `url(#${clipId})`,
                transform: glassTransform,
                background:
                  "linear-gradient(135deg, rgba(226,232,240,0.12), rgba(226,232,240,0.025) 34%, rgba(16,185,129,0.045) 100%)",
              }}
            />

            <svg
              viewBox="0 0 320 386"
              aria-hidden
              className="pointer-events-none absolute inset-0 h-full w-full overflow-visible"
              style={{ transform: "translateZ(96px)" }}
            >
              <path
                d={VESSEL_PATH}
                fill="none"
                stroke="rgba(113,113,122,0.5)"
                strokeWidth="1.2"
                vectorEffect="non-scaling-stroke"
              />
              <path
                d={VESSEL_PATH}
                fill="none"
                stroke="url(#portrait-edge)"
                strokeWidth="1.4"
                strokeDasharray="74 310"
                vectorEffect="non-scaling-stroke"
              />
              <defs>
                <linearGradient id="portrait-edge" x1="0" x2="1" y1="0" y2="1">
                  <stop offset="0%" stopColor={SILVER} stopOpacity="0" />
                  <stop offset="42%" stopColor={GOLD} stopOpacity="0.72" />
                  <stop offset="72%" stopColor={GREEN} stopOpacity="0.45" />
                  <stop offset="100%" stopColor={SILVER} stopOpacity="0" />
                </linearGradient>
              </defs>
            </svg>

            <div
              aria-hidden
              className="pointer-events-none absolute inset-0 opacity-[0.16] mix-blend-screen"
              style={{
                mask: `url(#${maskId})`,
                WebkitMask: `url(#${maskId})`,
                clipPath: `url(#${clipId})`,
                WebkitClipPath: `url(#${clipId})`,
                transform: "translateZ(112px)",
                backgroundImage:
                  "linear-gradient(to bottom, rgba(226,232,240,0.22) 0px, rgba(226,232,240,0.22) 1px, transparent 1px, transparent 4px)",
                backgroundSize: "100% 4px",
              }}
            />

            <motion.div
              aria-hidden
              className="pointer-events-none absolute inset-0 bg-white mix-blend-overlay"
              style={{
                mask: `url(#${maskId})`,
                WebkitMask: `url(#${maskId})`,
                clipPath: `url(#${clipId})`,
                WebkitClipPath: `url(#${clipId})`,
                transform: "translateZ(118px)",
              }}
              animate={{ opacity: [0.01, 0.035, 0.012, 0.026, 0.01] }}
              transition={{ duration: 4.4, ease: "linear", repeat: Infinity }}
            />
          </motion.div>
        </motion.div>

        {TAGS.map((tag) => (
          <motion.span
            key={tag.label}
            initial={{
              opacity: 0,
              x: -8,
              y: 0,
              filter: "blur(5px)",
              clipPath: "inset(0 100% 0 0)",
            }}
            animate={{
              opacity: 1,
              x: 0,
              y: tag.float,
              filter: ["blur(5px)", "blur(0px)", "blur(0.7px)", "blur(0px)"],
              clipPath: "inset(0 0% 0 0)",
            }}
            transition={{
              opacity: { delay: tag.delay, duration: 0.38 },
              x: { delay: tag.delay, duration: 0.42, ease: [0.22, 1, 0.36, 1] },
              clipPath: { delay: tag.delay, duration: 0.42, ease: [0.22, 1, 0.36, 1] },
              filter: {
                delay: tag.delay,
                duration: 0.92,
                times: [0, 0.48, 0.58, 1],
              },
              y: {
                delay: tag.delay + 0.45,
                duration: 4.8 + tag.delay,
                repeat: Infinity,
                ease: "easeInOut",
              },
            }}
            className={[
              "pointer-events-none absolute rounded border border-zinc-700/50 bg-black/45 px-2.5 py-1",
              "font-mono text-[9px] uppercase tracking-[0.2em] text-[#E2E8F0]/70 backdrop-blur-md",
              "shadow-[0_0_24px_-12px_rgba(212,175,55,0.55)] will-change-transform",
              tag.className,
            ].join(" ")}
            style={{ textShadow: "0 0 18px rgba(226,232,240,0.28)" }}
          >
            {tag.label}
          </motion.span>
        ))}
      </div>
    </div>
  );
}

const HeroPortrait = memo(HeroPortraitImpl);
HeroPortrait.displayName = "HeroPortrait";

export default HeroPortrait;
