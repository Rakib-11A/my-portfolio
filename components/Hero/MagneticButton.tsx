"use client";

import {
  motion,
  useMotionValue,
  useReducedMotion,
  useSpring,
  useTransform,
} from "motion/react";
import {
  ReactNode,
  Ref,
  useRef,
  type MouseEvent as ReactMouseEvent,
} from "react";

type Glow = "gold" | "accent";

type CommonProps = {
  children: ReactNode;
  glow?: Glow;
  className?: string;
  ariaLabel?: string;
};

type AnchorProps = CommonProps & {
  href: string;
  download?: string;
  target?: string;
  rel?: string;
  onClick?: never;
  type?: never;
};

type ButtonProps = CommonProps & {
  href?: undefined;
  download?: never;
  target?: never;
  rel?: never;
  onClick?: () => void;
  type?: "button" | "submit" | "reset";
};

type Props = AnchorProps | ButtonProps;

const SPRING = { stiffness: 280, damping: 22, mass: 0.5 };
const PULL = 0.4;
const INNER_PARALLAX = 0.4;

const GLOW_STYLES: Record<Glow, string> = {
  gold: "hover:border-gold/50 hover:text-gold hover:shadow-[0_0_60px_-12px_rgba(212,175,55,0.55)]",
  accent: "hover:border-accent/50 hover:text-accent hover:shadow-[0_0_60px_-12px_rgba(16,185,129,0.55)]",
};

export default function MagneticButton(props: Props) {
  const {
    children,
    glow = "gold",
    className = "",
    ariaLabel,
  } = props;

  const ref = useRef<HTMLElement | null>(null);
  const prefersReducedMotion = useReducedMotion();

  const x = useMotionValue(0);
  const y = useMotionValue(0);
  const sx = useSpring(x, SPRING);
  const sy = useSpring(y, SPRING);
  const innerX = useTransform(sx, (v) => v * INNER_PARALLAX);
  const innerY = useTransform(sy, (v) => v * INNER_PARALLAX);

  const handleMove = (e: ReactMouseEvent<HTMLElement>) => {
    if (prefersReducedMotion || !ref.current) return;
    const rect = ref.current.getBoundingClientRect();
    const cx = rect.left + rect.width / 2;
    const cy = rect.top + rect.height / 2;
    x.set((e.clientX - cx) * PULL);
    y.set((e.clientY - cy) * PULL);
  };

  const handleLeave = () => {
    x.set(0);
    y.set(0);
  };

  const baseClassName = [
    "group relative inline-flex items-center justify-center gap-2",
    "rounded-full border border-[color:var(--color-border-strong)]",
    "bg-white/[0.03] backdrop-blur-md",
    "px-7 py-3.5 font-display text-sm font-medium tracking-wide text-foreground",
    "shadow-[0_0_0_0_rgba(0,0,0,0)]",
    "transition-[color,border-color,box-shadow] duration-300",
    "focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-gold/60 focus-visible:ring-offset-2 focus-visible:ring-offset-background",
    GLOW_STYLES[glow],
    className,
  ].join(" ");

  const inner = (
    <motion.span
      style={{ x: innerX, y: innerY }}
      className="relative z-10 inline-flex items-center gap-2"
    >
      {children}
    </motion.span>
  );

  if (props.href !== undefined) {
    return (
      <motion.a
        ref={ref as Ref<HTMLAnchorElement>}
        href={props.href}
        download={props.download}
        target={props.target}
        rel={props.rel ?? (props.target === "_blank" ? "noopener noreferrer" : undefined)}
        onMouseMove={handleMove}
        onMouseLeave={handleLeave}
        style={{ x: sx, y: sy }}
        className={baseClassName}
        aria-label={ariaLabel}
      >
        {inner}
      </motion.a>
    );
  }

  return (
    <motion.button
      ref={ref as Ref<HTMLButtonElement>}
      type={props.type ?? "button"}
      onClick={props.onClick}
      onMouseMove={handleMove}
      onMouseLeave={handleLeave}
      style={{ x: sx, y: sy }}
      className={baseClassName}
      aria-label={ariaLabel}
    >
      {inner}
    </motion.button>
  );
}
