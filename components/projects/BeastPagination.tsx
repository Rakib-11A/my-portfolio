"use client";

import {
  memo,
  useCallback,
  useRef,
  type MouseEvent as ReactMouseEvent,
} from "react";
import {
  AnimatePresence,
  motion,
  useMotionValue,
  useReducedMotion,
  useSpring,
  type Transition,
  type Variants,
} from "motion/react";
import { ChevronLeft, ChevronRight } from "lucide-react";

export interface BeastPaginationProps {
  /** Zero-based current page index. */
  readonly page: number;
  readonly totalPages: number;
  /** +1 = forward, -1 = backward. Drives the digit-roll direction. */
  readonly direction: 1 | -1;
  readonly onPrev: () => void;
  readonly onNext: () => void;
}

const ARROW_PULL = 0.45;
const MAGNET_SPRING = {
  stiffness: 220,
  damping: 18,
  mass: 0.4,
} as const;
const DIGIT_SPRING: Transition = {
  type: "spring",
  stiffness: 320,
  damping: 28,
  mass: 0.6,
};

const pad = (n: number): string => String(n).padStart(2, "0");

/* -------------------------------------------------------------------------- */
/*  Magnetic arrow                                                            */
/* -------------------------------------------------------------------------- */

interface MagneticArrowProps {
  readonly variant: "prev" | "next";
  readonly disabled: boolean;
  readonly onClick: () => void;
  readonly label: string;
}

function MagneticArrowImpl({
  variant,
  disabled,
  onClick,
  label,
}: MagneticArrowProps) {
  const ref = useRef<HTMLButtonElement | null>(null);
  const prefersReducedMotion = useReducedMotion();

  const mx = useMotionValue(0);
  const my = useMotionValue(0);
  const x = useSpring(mx, MAGNET_SPRING);
  const y = useSpring(my, MAGNET_SPRING);

  const handleMove = useCallback(
    (e: ReactMouseEvent<HTMLButtonElement>) => {
      if (prefersReducedMotion || disabled || !ref.current) return;
      const r = ref.current.getBoundingClientRect();
      const cx = r.left + r.width / 2;
      const cy = r.top + r.height / 2;
      mx.set((e.clientX - cx) * ARROW_PULL);
      my.set((e.clientY - cy) * ARROW_PULL);
    },
    [disabled, mx, my, prefersReducedMotion],
  );

  const handleLeave = useCallback(() => {
    mx.set(0);
    my.set(0);
  }, [mx, my]);

  const Icon = variant === "prev" ? ChevronLeft : ChevronRight;

  return (
    <motion.button
      ref={ref}
      type="button"
      onClick={onClick}
      onMouseMove={handleMove}
      onMouseLeave={handleLeave}
      whileTap={{ scale: 0.92 }}
      transition={MAGNET_SPRING}
      disabled={disabled}
      aria-label={label}
      className={[
        "group relative inline-flex h-12 w-12 items-center justify-center rounded-full",
        "border border-white/10 bg-black/60 backdrop-blur-xl",
        "shadow-[0_10px_30px_-12px_rgba(0,0,0,0.9),inset_0_1px_0_rgba(255,255,255,0.05)]",
        "transition-[border-color,box-shadow,opacity] duration-300 ease-out",
        "hover:border-gold/40 hover:shadow-[0_18px_50px_-12px_rgba(212,175,55,0.35)]",
        "focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-gold/60 focus-visible:ring-offset-2 focus-visible:ring-offset-background",
        "disabled:cursor-not-allowed disabled:opacity-30 disabled:hover:border-white/10 disabled:hover:shadow-none",
        "will-change-transform",
      ].join(" ")}
    >
      {/* Soft halo behind the arrow — tightens up the metallic feel. */}
      <span
        aria-hidden
        className="pointer-events-none absolute inset-0 rounded-full opacity-0 transition-opacity duration-300 group-hover:opacity-100 group-disabled:opacity-0"
        style={{
          background:
            "radial-gradient(50% 50% at 50% 50%, rgba(212,175,55,0.18) 0%, transparent 70%)",
        }}
      />
      <motion.span
        style={{ x, y }}
        className="relative inline-flex items-center justify-center will-change-transform"
      >
        <Icon
          className="h-5 w-5 text-muted transition-colors duration-200 group-hover:text-foreground group-disabled:text-subtle"
          strokeWidth={1.6}
          aria-hidden
        />
      </motion.span>
    </motion.button>
  );
}

const MagneticArrow = memo(MagneticArrowImpl);
MagneticArrow.displayName = "MagneticArrow";

/* -------------------------------------------------------------------------- */
/*  Sliding digit pair                                                        */
/* -------------------------------------------------------------------------- */

const digitVariants: Variants = {
  enter: (dir: 1 | -1) => ({
    y: dir > 0 ? "100%" : "-100%",
    opacity: 0,
  }),
  center: {
    y: "0%",
    opacity: 1,
    transition: DIGIT_SPRING,
  },
  exit: (dir: 1 | -1) => ({
    y: dir > 0 ? "-100%" : "100%",
    opacity: 0,
    transition: DIGIT_SPRING,
  }),
};

interface SlidingNumberProps {
  readonly value: number;
  readonly direction: 1 | -1;
}

function SlidingNumberImpl({ value, direction }: SlidingNumberProps) {
  return (
    <span className="relative inline-flex h-7 w-9 overflow-hidden">
      <AnimatePresence mode="wait" custom={direction} initial={false}>
        <motion.span
          key={value}
          custom={direction}
          variants={digitVariants}
          initial="enter"
          animate="center"
          exit="exit"
          className={[
            "absolute inset-0 flex items-center justify-center",
            "font-display text-2xl font-semibold leading-none tracking-tight text-gold",
            "will-change-transform",
          ].join(" ")}
          style={{
            // Pulsing neon glow keyed off the gold accent.
            textShadow:
              "0 0 14px rgba(212,175,55,0.55), 0 0 28px rgba(212,175,55,0.25)",
          }}
        >
          {pad(value)}
        </motion.span>
      </AnimatePresence>
    </span>
  );
}

const SlidingNumber = memo(SlidingNumberImpl);
SlidingNumber.displayName = "SlidingNumber";

/* -------------------------------------------------------------------------- */
/*  Beast pagination — Navigation Command Center                              */
/* -------------------------------------------------------------------------- */

function BeastPaginationImpl({
  page,
  totalPages,
  direction,
  onPrev,
  onNext,
}: BeastPaginationProps) {
  const current = page + 1;
  const progress = totalPages > 1 ? page / (totalPages - 1) : 1;
  const atStart = page <= 0;
  const atEnd = page >= totalPages - 1;

  return (
    <nav
      aria-label="Project archive pagination"
      className="relative flex w-full items-center justify-center"
    >
      <div className="relative flex items-center gap-4 sm:gap-6">
        <MagneticArrow
          variant="prev"
          disabled={atStart}
          onClick={onPrev}
          label="Previous page"
        />

        {/* Pill indicator — pulsing gold for the active page, silver for the total. */}
        <div
          className={[
            "relative flex items-center gap-2 rounded-full",
            "border border-white/10 bg-black/60 px-5 py-2 backdrop-blur-xl",
            "shadow-[0_10px_30px_-12px_rgba(0,0,0,0.9),inset_0_1px_0_rgba(255,255,255,0.06)]",
          ].join(" ")}
          aria-live="polite"
          aria-atomic
        >
          {/* Pulsing neon ring behind the pill. */}
          <motion.span
            aria-hidden
            className="pointer-events-none absolute -inset-px rounded-full"
            initial={false}
            animate={{ opacity: [0.35, 0.7, 0.35] }}
            transition={{
              duration: 2.4,
              ease: "easeInOut",
              repeat: Infinity,
            }}
            style={{
              background:
                "radial-gradient(60% 100% at 50% 50%, rgba(212,175,55,0.18) 0%, transparent 70%)",
              filter: "blur(8px)",
            }}
          />

          <span className="relative flex items-center gap-2">
            <SlidingNumber value={current} direction={direction} />
            <span
              aria-hidden
              className="font-mono text-sm tracking-widest text-subtle"
            >
              /
            </span>
            <span
              className="font-display text-base font-medium leading-none tracking-tight text-muted"
              style={{ color: "#C0C8D0" }}
            >
              {pad(totalPages)}
            </span>
          </span>

          {/* Dynamic progress line — gold→green sweep, fills as the user pages. */}
          <span
            aria-hidden
            className="pointer-events-none absolute inset-x-3 -bottom-px h-px overflow-hidden rounded-full"
          >
            <span className="absolute inset-0 bg-white/10" />
            <motion.span
              className="absolute inset-y-0 left-0 origin-left rounded-full"
              initial={false}
              animate={{ scaleX: progress }}
              transition={{ type: "spring", stiffness: 200, damping: 28 }}
              style={{
                width: "100%",
                background:
                  "linear-gradient(90deg, var(--color-gold) 0%, var(--color-accent) 100%)",
                boxShadow:
                  "0 0 8px rgba(212,175,55,0.6), 0 0 14px rgba(16,185,129,0.4)",
                transformOrigin: "0% 50%",
                willChange: "transform",
              }}
            />
          </span>
        </div>

        <MagneticArrow
          variant="next"
          disabled={atEnd}
          onClick={onNext}
          label="Next page"
        />
      </div>
    </nav>
  );
}

const BeastPagination = memo(BeastPaginationImpl);
BeastPagination.displayName = "BeastPagination";
export default BeastPagination;
