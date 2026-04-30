"use client";

import { ReactNode, useRef } from "react";
import { motion, useScroll, useSpring, useTransform } from "motion/react";
import { Code2, GraduationCap, Sparkles, Briefcase } from "lucide-react";

type Item = {
  badge: string;
  title: string;
  subtitle?: string;
  description: string;
  icon: ReactNode;
  highlight?: boolean;
};

const EASE_OUT_EXPO = [0.22, 1, 0.36, 1] as const;

const ITEMS: Item[] = [
  {
    badge: "Origins",
    title: "From Rails to Cloud-Native",
    subtitle: "The pivot",
    description:
      "Started shipping with Ruby on Rails, then steadily evolved into modern full-stack and cloud-native ecosystems — TypeScript, Go, Docker, and AWS. The rails-grade conventions still shape how I think about ergonomic backends today.",
    icon: <Code2 className="h-4 w-4" />,
  },
  {
    badge: "2024 — Present",
    title: "Junior Backend Engineer",
    subtitle: "Syftet Limited",
    description:
      "Building live e-commerce APIs that serve real customers in production. Focus: clean service boundaries, correctness under concurrency, and database performance you can defend in a 1:1.",
    icon: <Briefcase className="h-4 w-4" />,
  },
  {
    badge: "Foundation",
    title: "800+ DSA Problems Solved",
    subtitle: "Codeforces · LeetCode · AtCoder",
    description:
      "Years of disciplined practice across competitive programming platforms. The result: an instinct for complexity, a vocabulary of patterns, and the patience to debug without flinching.",
    icon: <Sparkles className="h-4 w-4" />,
    highlight: true,
  },
  {
    badge: "2020 — 2024",
    title: "BSc in Computer Science & Engineering",
    subtitle: "Pabna University of Science & Technology",
    description:
      "Rigorous foundation in algorithms, operating systems, networks, databases, and software engineering — the layer underneath everything else.",
    icon: <GraduationCap className="h-4 w-4" />,
  },
];

export default function Timeline() {
  const containerRef = useRef<HTMLDivElement>(null);

  const { scrollYProgress } = useScroll({
    target: containerRef,
    offset: ["start 75%", "end 35%"],
  });
  const lineProgress = useSpring(scrollYProgress, {
    stiffness: 90,
    damping: 28,
    restDelta: 0.001,
  });
  const lineOpacity = useTransform(scrollYProgress, [0, 0.05, 1], [0, 1, 1]);

  return (
    <section
      id="about"
      className="relative px-6 py-24 sm:py-32"
      aria-labelledby="journey-heading"
    >
      <div className="mx-auto max-w-6xl">
        <header className="mb-16 max-w-2xl sm:mb-20 lg:mx-auto lg:text-center">
          <p className="mb-3 text-xs uppercase tracking-[0.28em] text-gold/80">
            The journey
          </p>
          <h2
            id="journey-heading"
            className="font-display text-4xl font-bold leading-tight tracking-tight text-foreground sm:text-5xl lg:text-6xl"
          >
            Engineered through{" "}
            <span className="bg-linear-to-r from-foreground to-muted bg-clip-text text-transparent">
              practice, pressure, and patience
            </span>
            .
          </h2>
        </header>

        <div ref={containerRef} className="relative">
          {/* Static rail */}
          <div className="pointer-events-none absolute inset-y-0 left-5 w-px bg-border lg:left-1/2 lg:-translate-x-px" />

          {/* Animated fill */}
          <motion.div
            aria-hidden
            style={{ scaleY: lineProgress, opacity: lineOpacity }}
            className="pointer-events-none absolute inset-y-0 left-5 w-px origin-top bg-linear-to-b from-gold via-accent to-transparent shadow-[0_0_10px_rgba(212,175,55,0.55)] lg:left-1/2 lg:-translate-x-px"
          />

          <ul className="space-y-14 sm:space-y-20">
            {ITEMS.map((item, i) => (
              <TimelineRow key={item.title} item={item} index={i} />
            ))}
          </ul>
        </div>
      </div>
    </section>
  );
}

function TimelineRow({ item, index }: { item: Item; index: number }) {
  const isRight = index % 2 === 1;

  return (
    <li className="relative grid grid-cols-[2.5rem_1fr] gap-4 lg:grid-cols-[1fr_3rem_1fr] lg:gap-8">
      {/* Node dot — mobile col 1, desktop col 2 */}
      <div className="row-start-1 flex justify-center pt-1 lg:col-start-2">
        <Node highlight={item.highlight} />
      </div>

      {/* Card — mobile col 2, desktop alternating col 1 / col 3 */}
      <motion.div
        initial={{ opacity: 0, x: 0, y: 24 }}
        whileInView={{
          opacity: 1,
          y: 0,
          transition: { duration: 0.7, ease: EASE_OUT_EXPO },
        }}
        viewport={{ once: true, margin: "-80px" }}
        className={[
          "row-start-1 col-start-2",
          isRight ? "lg:col-start-3 lg:text-left" : "lg:col-start-1 lg:text-right",
        ].join(" ")}
      >
        <Card item={item} />
      </motion.div>
    </li>
  );
}

function Node({ highlight }: { highlight?: boolean }) {
  return (
    <div className="relative grid h-10 w-10 place-items-center">
      {highlight && (
        <>
          <span className="absolute h-7 w-7 animate-ping rounded-full bg-gold/30" />
          <span className="absolute h-10 w-10 rounded-full bg-gold/15 blur-md" />
        </>
      )}
      <div
        className={[
          "relative h-3 w-3 rounded-full ring-4 ring-background transition-shadow",
          highlight
            ? "bg-gold shadow-[0_0_14px_rgba(212,175,55,0.9)]"
            : "bg-foreground/80",
        ].join(" ")}
      />
    </div>
  );
}

function Card({ item }: { item: Item }) {
  return (
    <article
      className={[
        "glass group relative inline-block w-full max-w-xl overflow-hidden p-6 sm:p-7",
        "transition-[border-color,box-shadow] duration-300",
        item.highlight
          ? "hover:border-gold/40 hover:shadow-[0_0_50px_-12px_rgba(212,175,55,0.55)]"
          : "hover:border-border-strong hover:shadow-[0_8px_40px_-16px_rgba(0,0,0,0.6)]",
      ].join(" ")}
    >
      {item.highlight && (
        <span
          aria-hidden
          className="pointer-events-none absolute -right-12 -top-12 h-40 w-40 rounded-full bg-gold/10 blur-3xl"
        />
      )}

      <header className="mb-3 flex items-center gap-2 text-xs uppercase tracking-[0.18em]">
        <span
          className={[
            "inline-flex h-6 w-6 items-center justify-center rounded-full",
            item.highlight
              ? "bg-gold/15 text-gold"
              : "bg-foreground/5 text-muted",
          ].join(" ")}
        >
          {item.icon}
        </span>
        <span
          className={item.highlight ? "text-gold/90" : "text-muted"}
        >
          {item.badge}
        </span>
      </header>

      <h3 className="font-display text-xl font-semibold tracking-tight text-foreground sm:text-2xl">
        {item.title}
      </h3>

      {item.subtitle && (
        <p
          className={[
            "mt-1 text-sm",
            item.highlight ? "text-gold/85" : "text-muted",
          ].join(" ")}
        >
          {item.subtitle}
        </p>
      )}

      <p className="mt-4 text-sm leading-relaxed text-muted sm:text-[0.95rem]">
        {item.description}
      </p>

      {item.highlight && (
        <p className="mt-5 inline-flex items-center gap-2 rounded-full border border-gold/30 bg-gold/5 px-3 py-1 text-xs font-medium text-gold">
          <Sparkles className="h-3 w-3" />
          A discipline I refuse to lose
        </p>
      )}
    </article>
  );
}
