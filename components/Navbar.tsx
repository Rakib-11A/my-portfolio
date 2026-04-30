"use client";

import { useEffect, useState } from "react";
import {
  AnimatePresence,
  motion,
  useMotionValueEvent,
  useReducedMotion,
  useScroll,
} from "motion/react";

type NavLink = { label: string; href: string };

const NAV_LINKS: readonly NavLink[] = [
  { label: "Home", href: "#home" },
  { label: "About", href: "#about" },
  { label: "Skills", href: "#skills" },
  { label: "Projects", href: "#projects" },
  { label: "Contact", href: "#contact" },
] as const;

const EASE_OUT_EXPO = [0.22, 1, 0.36, 1] as const;
const HIDE_OFFSET_PX = 120;
const SCROLL_THRESHOLD_PX = 80;

export default function Navbar() {
  const [hidden, setHidden] = useState(false);
  const [open, setOpen] = useState(false);
  const { scrollY } = useScroll();
  const prefersReducedMotion = useReducedMotion();

  useMotionValueEvent(scrollY, "change", (current) => {
    const previous = scrollY.getPrevious() ?? 0;
    const goingDown = current > previous;

    if (goingDown && current > SCROLL_THRESHOLD_PX) {
      setHidden(true);
    } else {
      setHidden(false);
    }
  });

  useEffect(() => {
    if (!open) return;

    const onKey = (e: KeyboardEvent) => {
      if (e.key === "Escape") setOpen(false);
    };
    const { overflow } = document.body.style;
    document.body.style.overflow = "hidden";
    window.addEventListener("keydown", onKey);

    return () => {
      document.body.style.overflow = overflow;
      window.removeEventListener("keydown", onKey);
    };
  }, [open]);

  useEffect(() => {
    const onResize = () => {
      if (window.innerWidth >= 768) setOpen(false);
    };
    window.addEventListener("resize", onResize);
    return () => window.removeEventListener("resize", onResize);
  }, []);

  const linkHover = prefersReducedMotion
    ? undefined
    : { scale: 1.06, transition: { type: "spring" as const, stiffness: 420, damping: 22 } };

  return (
    <>
      <motion.header
        initial={{ y: -120, opacity: 0 }}
        animate={{ y: hidden ? -HIDE_OFFSET_PX : 0, opacity: 1 }}
        transition={{
          y: { duration: 0.35, ease: EASE_OUT_EXPO },
          opacity: { duration: 0.6, delay: 0.1 },
        }}
        className="fixed inset-x-0 top-4 z-50 flex justify-center px-4"
      >
        <nav
          aria-label="Primary"
          className="glass flex items-center gap-1 rounded-full px-2 py-2 shadow-[0_8px_40px_-12px_rgba(0,0,0,0.6)]"
        >
          <a
            href="#home"
            className="ml-2 mr-1 px-3 py-1.5 font-display text-sm font-semibold tracking-tight"
          >
            <span className="bg-gradient-to-r from-gold to-gold-soft bg-clip-text text-transparent">
              RH
            </span>
          </a>

          <ul className="hidden items-center gap-0.5 md:flex">
            {NAV_LINKS.map((link) => (
              <li key={link.href}>
                <motion.a
                  href={link.href}
                  whileHover={linkHover}
                  whileTap={prefersReducedMotion ? undefined : { scale: 0.96 }}
                  className="block rounded-full px-4 py-1.5 text-sm text-muted transition-colors duration-200 hover:text-gold focus-visible:text-gold"
                >
                  {link.label}
                </motion.a>
              </li>
            ))}
          </ul>

          <a
            href="#contact"
            className="ml-1 hidden rounded-full border border-[color:var(--color-border-strong)] px-4 py-1.5 text-sm text-foreground transition-colors duration-200 hover:border-accent hover:text-accent md:inline-block"
          >
            Let&apos;s talk
          </a>

          <button
            type="button"
            aria-label={open ? "Close menu" : "Open menu"}
            aria-expanded={open}
            aria-controls="mobile-menu"
            onClick={() => setOpen((v) => !v)}
            className="ml-1 inline-flex h-9 w-9 items-center justify-center rounded-full text-foreground transition-colors hover:text-gold md:hidden"
          >
            <Hamburger open={open} />
          </button>
        </nav>
      </motion.header>

      <AnimatePresence>
        {open && (
          <motion.div
            key="overlay"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            transition={{ duration: 0.2 }}
            onClick={() => setOpen(false)}
            className="fixed inset-0 z-40 bg-background/50 backdrop-blur-sm md:hidden"
            aria-hidden="true"
          />
        )}
      </AnimatePresence>

      <AnimatePresence>
        {open && (
          <motion.div
            key="sheet"
            id="mobile-menu"
            role="dialog"
            aria-modal="true"
            aria-label="Mobile navigation"
            initial={{ y: -16, opacity: 0 }}
            animate={{ y: 0, opacity: 1 }}
            exit={{ y: -16, opacity: 0 }}
            transition={{ duration: 0.28, ease: EASE_OUT_EXPO }}
            className="glass-strong fixed inset-x-4 top-20 z-50 rounded-2xl p-3 shadow-[0_24px_60px_-20px_rgba(0,0,0,0.7)] md:hidden"
          >
            <ul className="flex flex-col">
              {NAV_LINKS.map((link, i) => (
                <motion.li
                  key={link.href}
                  initial={{ x: -8, opacity: 0 }}
                  animate={{ x: 0, opacity: 1 }}
                  transition={{ delay: 0.04 + i * 0.04, duration: 0.25 }}
                >
                  <a
                    href={link.href}
                    onClick={() => setOpen(false)}
                    className="flex items-center justify-between rounded-xl px-4 py-3 text-base text-foreground transition-colors hover:bg-white/[0.04] hover:text-gold"
                  >
                    <span>{link.label}</span>
                    <span aria-hidden className="text-subtle">
                      ↗
                    </span>
                  </a>
                </motion.li>
              ))}
            </ul>
          </motion.div>
        )}
      </AnimatePresence>
    </>
  );
}

function Hamburger({ open }: { open: boolean }) {
  return (
    <svg
      width="22"
      height="22"
      viewBox="0 0 22 22"
      fill="none"
      aria-hidden="true"
    >
      <motion.path
        stroke="currentColor"
        strokeWidth={1.6}
        strokeLinecap="round"
        initial={false}
        animate={open ? { d: "M5 5 L17 17" } : { d: "M3 8 L19 8" }}
        transition={{ duration: 0.22, ease: EASE_OUT_EXPO }}
      />
      <motion.path
        stroke="currentColor"
        strokeWidth={1.6}
        strokeLinecap="round"
        initial={false}
        animate={open ? { d: "M5 17 L17 5" } : { d: "M3 14 L19 14" }}
        transition={{ duration: 0.22, ease: EASE_OUT_EXPO }}
      />
    </svg>
  );
}
