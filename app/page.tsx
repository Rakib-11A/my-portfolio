"use client";

import dynamic from "next/dynamic";
import { motion, type Variants } from "motion/react";
import { ArrowDownToLine } from "lucide-react";
import MagneticButton from "@/components/Hero/MagneticButton";
import Timeline from "@/components/Journey/Timeline";
import FloatingSkills from "@/components/Skills/FloatingSkills";
import ProjectRow from "@/components/projects/ProjectRow";
import ContactTerminal from "@/components/Contact/ContactTerminal";

const ParticleBackground = dynamic(
  () => import("@/components/Hero/ParticleBackground"),
  { ssr: false },
);

const NAME = "Rakib Hasan";
const EASE_OUT_EXPO = [0.22, 1, 0.36, 1] as const;

const nameContainer: Variants = {
  hidden: {},
  show: {
    transition: { staggerChildren: 0.055, delayChildren: 0.35 },
  },
};

const nameLetter: Variants = {
  hidden: { y: "110%" },
  show: {
    y: "0%",
    transition: { duration: 0.85, ease: EASE_OUT_EXPO },
  },
};

export default function Home() {
  return (
    <main>
      <section
        id="home"
        className="relative h-screen w-full overflow-hidden bg-background"
      >
      <div className="absolute inset-0 z-0">
        <ParticleBackground />
      </div>

      {/* Vignette to keep typography legible against the particles */}
      <div
        aria-hidden
        className="pointer-events-none absolute inset-0 z-5 bg-[radial-gradient(ellipse_at_center,transparent_30%,rgba(5,5,5,0.85)_85%)]"
      />

      <div className="pointer-events-none relative z-10 flex h-full flex-col items-center justify-center px-6 text-center">
        <motion.p
          initial={{ opacity: 0, y: 12 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.6, delay: 0.15 }}
          className="mb-7 inline-flex items-center gap-2 rounded-full border border-border bg-white/3 px-4 py-1.5 text-xs uppercase tracking-[0.22em] text-muted backdrop-blur-md"
        >
          <span className="relative flex h-1.5 w-1.5">
            <span className="absolute inline-flex h-full w-full animate-ping rounded-full bg-accent opacity-70" />
            <span className="relative inline-flex h-1.5 w-1.5 rounded-full bg-accent" />
          </span>
          Available for new projects
        </motion.p>

        <motion.h1
          variants={nameContainer}
          initial="hidden"
          animate="show"
          aria-label={NAME}
          className="font-display text-5xl font-bold leading-[0.95] tracking-tight sm:text-7xl md:text-8xl lg:text-[8rem]"
        >
          {NAME.split(" ").map((word, wi) => (
            <span
              key={wi}
              className="mx-2 inline-block whitespace-nowrap align-bottom"
            >
              {word.split("").map((char, ci) => (
                <span
                  key={ci}
                  className="inline-block overflow-hidden align-bottom"
                >
                  <motion.span
                    variants={nameLetter}
                    className="inline-block bg-linear-to-b from-foreground via-foreground to-muted bg-clip-text pb-1 text-transparent"
                  >
                    {char}
                  </motion.span>
                </span>
              ))}
            </span>
          ))}
        </motion.h1>

        <motion.p
          initial={{ opacity: 0, y: 18 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.7, delay: 1.0, ease: EASE_OUT_EXPO }}
          className="mt-6 max-w-2xl text-base text-muted sm:text-lg"
        >
          Software Engineer{" "}
          <span aria-hidden className="mx-2 text-subtle">
            ·
          </span>
          <span className="text-foreground">
            Backend &amp; Cloud Architecture
          </span>
        </motion.p>

        <motion.div
          initial={{ opacity: 0, y: 18 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.7, delay: 1.15, ease: EASE_OUT_EXPO }}
          className="pointer-events-auto mt-10 flex flex-col items-center gap-6"
        >
          <MagneticButton
            href="/resume.pdf"
            download="Rakib-Hasan-Resume.pdf"
            glow="gold"
            ariaLabel="Download resume PDF"
          >
            <ArrowDownToLine className="h-4 w-4" />
            Download Resume
          </MagneticButton>

          <div className="flex items-center gap-3">
            <SocialIcon href="https://github.com/Rakib-11A" label="GitHub">
              <GithubGlyph />
            </SocialIcon>
            <SocialIcon href="https://www.linkedin.com/" label="LinkedIn">
              <LinkedinGlyph />
            </SocialIcon>
          </div>
        </motion.div>
      </div>

      <motion.div
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        transition={{ duration: 0.8, delay: 1.6 }}
        className="pointer-events-none absolute inset-x-0 bottom-8 z-10 flex justify-center"
        aria-hidden
      >
        <div className="flex h-9 w-5 items-start justify-center rounded-full border border-border-strong p-1">
          <motion.span
            animate={{ y: [0, 10, 0] }}
            transition={{ duration: 1.6, repeat: Infinity, ease: "easeInOut" }}
            className="h-1.5 w-0.5 rounded-full bg-foreground/60"
          />
        </div>
      </motion.div>
      </section>

      <Timeline />
      <FloatingSkills />

      <section
        id="archive"
        aria-label="The Technical Archive"
        className="relative px-6 py-24 md:py-32"
      >
        <div className="mx-auto max-w-6xl">
          <header className="mb-16 flex flex-col items-center gap-3">
            <span className="mb-3 text-xs uppercase tracking-[0.28em] text-gold/80">
              The Technical Archive
            </span>
            <h2 className="font-display text-4xl font-bold leading-tight tracking-tight text-foreground sm:text-5xl lg:text-6xl">
              Production systems, dissected.
            </h2>
            <p className="max-w-2xl text-center mb-8 text-sm text-muted md:text-base">
              Curated case studies — three per page. Each card opens a deep
              dive into the architecture, trade-offs, and operating posture.
            </p>
          </header>

          <ProjectRow />
          <ContactTerminal />
        </div>
      </section>
    </main>
  );
}

function SocialIcon({
  href,
  label,
  children,
}: {
  href: string;
  label: string;
  children: React.ReactNode;
}) {
  return (
    <motion.a
      href={href}
      target="_blank"
      rel="noopener noreferrer"
      aria-label={label}
      whileHover={{ scale: 1.1, y: -2 }}
      whileTap={{ scale: 0.94 }}
      transition={{ type: "spring", stiffness: 400, damping: 18 }}
      className="inline-flex h-10 w-10 items-center justify-center rounded-full border border-border bg-white/2 text-muted backdrop-blur-md transition-colors duration-200 hover:border-gold/40 hover:text-gold"
    >
      {children}
    </motion.a>
  );
}

/* Brand icons — lucide v1 dropped all brand glyphs (trademark cleanup),
   so we inline minimalist marks here. Stroke uses currentColor so the
   parent's hover:text-gold cascades correctly. */
function GithubGlyph() {
  return (
    <svg
      width="16"
      height="16"
      viewBox="0 0 24 24"
      fill="currentColor"
      aria-hidden
    >
      <path d="M12 .5C5.65.5.5 5.65.5 12c0 5.08 3.29 9.39 7.86 10.91.58.1.79-.25.79-.56v-1.96c-3.2.7-3.87-1.54-3.87-1.54-.52-1.33-1.27-1.68-1.27-1.68-1.04-.71.08-.7.08-.7 1.15.08 1.76 1.18 1.76 1.18 1.02 1.76 2.69 1.25 3.34.96.1-.74.4-1.25.72-1.54-2.55-.29-5.24-1.28-5.24-5.69 0-1.26.45-2.29 1.18-3.1-.12-.29-.51-1.46.11-3.04 0 0 .97-.31 3.18 1.19a11 11 0 0 1 5.78 0c2.21-1.5 3.18-1.19 3.18-1.19.62 1.58.23 2.75.11 3.04.74.81 1.18 1.84 1.18 3.1 0 4.42-2.7 5.39-5.27 5.68.41.36.78 1.07.78 2.16v3.2c0 .31.21.67.8.56C20.21 21.39 23.5 17.07 23.5 12 23.5 5.65 18.35.5 12 .5Z" />
    </svg>
  );
}

function LinkedinGlyph() {
  return (
    <svg
      width="16"
      height="16"
      viewBox="0 0 24 24"
      fill="currentColor"
      aria-hidden
    >
      <path d="M20.45 20.45h-3.55v-5.57c0-1.33-.03-3.04-1.85-3.04-1.86 0-2.14 1.45-2.14 2.95v5.66H9.36V9h3.41v1.56h.05c.48-.9 1.64-1.85 3.37-1.85 3.6 0 4.27 2.37 4.27 5.46v6.28ZM5.34 7.43a2.06 2.06 0 1 1 0-4.13 2.06 2.06 0 0 1 0 4.13Zm1.78 13.02H3.56V9h3.56v11.45ZM22.22 0H1.77C.79 0 0 .77 0 1.72v20.56C0 23.23.79 24 1.77 24h20.45c.98 0 1.78-.77 1.78-1.72V1.72C24 .77 23.2 0 22.22 0Z" />
    </svg>
  );
}
