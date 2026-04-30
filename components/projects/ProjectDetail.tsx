"use client";

import Image from "next/image";
import {
  memo,
  useCallback,
  useEffect,
  useMemo,
  useRef,
  type MouseEvent as ReactMouseEvent,
  type ReactNode,
} from "react";
import {
  AnimatePresence,
  animate,
  motion,
  useInView,
  useMotionValue,
  useReducedMotion,
  useSpring,
  useTransform,
  type Variants,
} from "motion/react";
import {
  X,
  ArrowRight,
  GitBranch,
  ExternalLink,
  Cpu,
  Database,
  Layers3,
  Sparkles,
} from "lucide-react";

import type { Project, ProjectMetric } from "@/constants/projects";

/* -------------------------------------------------------------------------- */
/*  Public API                                                                */
/* -------------------------------------------------------------------------- */

export interface ProjectDetailProps {
  readonly project: Project;
  readonly onClose: () => void;
}

/* -------------------------------------------------------------------------- */
/*  Tunables / constants                                                      */
/* -------------------------------------------------------------------------- */

const MORPH_SPRING = { type: "spring", stiffness: 220, damping: 30, mass: 0.9 } as const;
const SILVER = "#E2E8F0";

/** Stagger root: children enter only after the morph settles. */
const stageVariants: Variants = {
  hidden: {},
  visible: {
    transition: { delayChildren: 0.45, staggerChildren: 0.1 },
  },
};

const sectionVariants: Variants = {
  hidden: { opacity: 0, y: 28, filter: "blur(8px)" },
  visible: {
    opacity: 1,
    y: 0,
    filter: "blur(0px)",
    transition: { type: "spring", stiffness: 130, damping: 20, mass: 0.7 },
  },
};

/* -------------------------------------------------------------------------- */
/*  ProjectDetail                                                             */
/* -------------------------------------------------------------------------- */

function ProjectDetailImpl({ project, onClose }: ProjectDetailProps) {
  /* ── Scroll lock ─────────────────────────────────────────────────────── */
  useEffect(() => {
    const previous = document.body.style.overflow;
    document.body.style.overflow = "hidden";
    return () => {
      document.body.style.overflow = previous;
    };
  }, []);

  /* ── ESC to close ────────────────────────────────────────────────────── */
  useEffect(() => {
    const onKey = (e: KeyboardEvent) => {
      if (e.key === "Escape") onClose();
    };
    window.addEventListener("keydown", onKey);
    return () => window.removeEventListener("keydown", onKey);
  }, [onClose]);

  return (
    <motion.div
      key={`detail-${project.id}`}
      role="dialog"
      aria-modal="true"
      aria-labelledby={`project-detail-${project.id}-title`}
      className="fixed inset-0 z-50 flex items-start justify-center p-4 sm:p-6 md:p-10"
    >
      {/* ── Focus-mode backdrop ─────────────────────────────────────────── */}
      <motion.button
        type="button"
        aria-label="Close project detail"
        onClick={onClose}
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        exit={{ opacity: 0 }}
        transition={{ duration: 0.35 }}
        className="absolute inset-0 cursor-default bg-black/70 backdrop-blur-3xl"
      />

      {/* ── Morphing shell (shares layoutId with the ProjectCard) ──────── */}
      <motion.article
        layoutId={`project-${project.id}`}
        transition={MORPH_SPRING}
        style={{ backgroundColor: "rgba(8, 8, 10, 0.85)" }}
        className={[
          "relative z-10 flex w-full max-w-6xl flex-col overflow-hidden",
          "rounded-3xl border border-white/10 backdrop-blur-2xl",
          "shadow-[0_40px_120px_-30px_rgba(0,0,0,0.9),0_0_0_1px_rgba(226,232,240,0.06)]",
          "max-h-[calc(100vh-2rem)] sm:max-h-[calc(100vh-3rem)] md:max-h-[calc(100vh-5rem)]",
          "will-change-transform",
        ].join(" ")}
      >
        {/* Ambient nebula glow inside the shell */}
        <div
          aria-hidden
          className="pointer-events-none absolute inset-0 opacity-60"
          style={{
            background:
              "radial-gradient(800px 400px at 80% -10%, rgba(212,175,55,0.10), transparent 60%), radial-gradient(600px 300px at 0% 100%, rgba(16,185,129,0.08), transparent 60%)",
          }}
        />

        <MagneticCloseButton onClose={onClose} />

        {/* Internal scroll region — kept inside the layoutId shell so the
            morph animates bounds, not scroll position. */}
        <div className="relative flex-1 overflow-y-auto overscroll-contain">
          <motion.div
            variants={stageVariants}
            initial="hidden"
            animate="visible"
            className="flex flex-col gap-12 px-6 pt-10 pb-16 sm:px-10 md:px-14 md:pt-14 md:pb-20"
          >
            <DetailHeader project={project} />
            <NarrativeTimeline project={project} />
            <VisualCore project={project} />
            <CodeLens project={project} />
            <TechFlex project={project} />
            <PowerStats metrics={project.metrics} />
          </motion.div>
        </div>
      </motion.article>
    </motion.div>
  );
}

const ProjectDetail = memo(ProjectDetailImpl);
ProjectDetail.displayName = "ProjectDetail";
export default ProjectDetail;

/* ========================================================================== */
/*  Header                                                                    */
/* ========================================================================== */

function DetailHeader({ project }: { project: Project }) {
  return (
    <motion.header variants={sectionVariants} className="flex flex-col gap-5">
      <div className="flex flex-wrap items-center gap-3">
        <span className="rounded-full border border-white/10 bg-white/[0.04] px-3 py-1 text-[11px] uppercase tracking-[0.2em] text-subtle">
          {project.category}
        </span>
        <span className="rounded-full border border-gold/30 bg-gold/[0.06] px-3 py-1 text-[11px] uppercase tracking-[0.2em] text-gold">
          {project.role}
        </span>
        <span className="rounded-full border border-accent/30 bg-accent/[0.06] px-3 py-1 text-[11px] uppercase tracking-[0.2em] text-accent">
          Complexity {project.complexity}/10
        </span>
      </div>

      <h2
        id={`project-detail-${project.id}-title`}
        className="font-display text-3xl font-semibold tracking-tight md:text-5xl"
        style={{ color: SILVER, textShadow: "0 1px 40px rgba(226,232,240,0.18)" }}
      >
        {project.title}
      </h2>

      <p className="max-w-3xl text-base leading-relaxed text-muted md:text-lg">
        {project.tagline}
      </p>

      <p className="max-w-3xl text-sm leading-relaxed text-subtle md:text-base">
        {project.description}
      </p>

      <div className="flex flex-wrap items-center gap-3 pt-1">
        {project.links.github ? (
          <ExternalChip href={project.links.github} icon={<GitBranch className="h-3.5 w-3.5" />}>
            Source
          </ExternalChip>
        ) : null}
        {project.links.live ? (
          <ExternalChip href={project.links.live} icon={<ExternalLink className="h-3.5 w-3.5" />}>
            Live
          </ExternalChip>
        ) : null}
        {project.links.docs ? (
          <ExternalChip href={project.links.docs} icon={<Layers3 className="h-3.5 w-3.5" />}>
            Docs
          </ExternalChip>
        ) : null}
      </div>
    </motion.header>
  );
}

function ExternalChip({
  href,
  icon,
  children,
}: {
  href: string;
  icon: ReactNode;
  children: ReactNode;
}) {
  return (
    <a
      href={href}
      target="_blank"
      rel="noopener noreferrer"
      className="group inline-flex items-center gap-2 rounded-full border border-white/10 bg-white/[0.03] px-3.5 py-1.5 text-xs font-medium text-muted transition-colors duration-300 hover:border-gold/40 hover:text-gold"
    >
      {icon}
      {children}
      <ArrowRight className="h-3 w-3 transition-transform duration-300 group-hover:translate-x-0.5" />
    </a>
  );
}

/* ========================================================================== */
/*  Narrative — Challenge → Strategy → Result timeline                        */
/* ========================================================================== */

function NarrativeTimeline({ project }: { project: Project }) {
  const steps = useMemo(
    () => [
      { label: "Challenge", body: project.engineeringNarrative.challenge, accent: "#ef4444" },
      { label: "Strategy",  body: project.engineeringNarrative.strategy,  accent: "#d4af37" },
      { label: "Result",    body: project.engineeringNarrative.result,    accent: "#10b981" },
    ],
    [project],
  );

  return (
    <motion.section variants={sectionVariants} className="flex flex-col gap-6">
      <SectionTitle icon={<Sparkles className="h-4 w-4" />}>Engineering Narrative</SectionTitle>

      <div className="relative pl-6 md:pl-8">
        {/* Vertical glow line */}
        <span
          aria-hidden
          className="absolute left-2 top-2 bottom-2 w-px md:left-3"
          style={{
            background:
              "linear-gradient(to bottom, transparent, rgba(226,232,240,0.4), rgba(212,175,55,0.5), rgba(16,185,129,0.5), transparent)",
          }}
        />

        <ol className="flex flex-col gap-6">
          {steps.map((step) => (
            <li key={step.label} className="relative">
              {/* Glowing node */}
              <span
                aria-hidden
                className="absolute -left-[22px] top-1.5 h-3 w-3 rounded-full md:-left-[26px]"
                style={{
                  backgroundColor: step.accent,
                  boxShadow: `0 0 18px ${step.accent}, 0 0 4px ${step.accent}`,
                }}
              />
              <div className="text-[11px] uppercase tracking-[0.22em] text-subtle">
                {step.label}
              </div>
              <p className="mt-1.5 text-sm leading-relaxed text-foreground/90 md:text-base">
                {step.body}
              </p>
            </li>
          ))}
        </ol>
      </div>

      {/* Technical flex bullets */}
      <div className="mt-2 grid grid-cols-1 gap-3 sm:grid-cols-2">
        {project.engineeringNarrative.technicalFlex.map((flex) => (
          <div
            key={flex}
            className="flex gap-3 rounded-xl border border-white/[0.06] bg-white/[0.02] p-4 text-sm leading-relaxed text-muted"
          >
            <span
              aria-hidden
              className="mt-1 h-1.5 w-1.5 shrink-0 rounded-full bg-gold shadow-[0_0_10px_rgba(212,175,55,0.7)]"
            />
            {flex}
          </div>
        ))}
      </div>
    </motion.section>
  );
}

/* ========================================================================== */
/*  Visual Core — architecture + ERD in glass frames                          */
/* ========================================================================== */

function VisualCore({ project }: { project: Project }) {
  return (
    <motion.section variants={sectionVariants} className="flex flex-col gap-6">
      <SectionTitle icon={<Cpu className="h-4 w-4" />}>The Visual Core</SectionTitle>

      <div className="grid grid-cols-1 gap-5 lg:grid-cols-2">
        <GlassFrame label="System Architecture" src={project.visuals.architectureDiagram} />
        <GlassFrame label="Entity Relationship" src={project.visuals.erd} />
      </div>
    </motion.section>
  );
}

function GlassFrame({ label, src }: { label: string; src: string }) {
  return (
    <figure className="group/frame relative overflow-hidden rounded-2xl border border-white/10 bg-[rgba(10,10,10,0.6)] backdrop-blur-md">
      {/* Inner glow ring */}
      <span
        aria-hidden
        className="pointer-events-none absolute inset-0 rounded-2xl opacity-0 transition-opacity duration-500 group-hover/frame:opacity-100"
        style={{
          boxShadow:
            "inset 0 0 0 1px rgba(226,232,240,0.18), inset 0 0 60px rgba(212,175,55,0.10)",
        }}
      />
      <div className="relative aspect-[16/10] w-full overflow-hidden">
        <Image
          src={src}
          alt={label}
          fill
          sizes="(max-width: 1024px) 100vw, 50vw"
          className="object-contain transition-transform duration-700 ease-out group-hover/frame:scale-110"
        />
      </div>
      <figcaption className="flex items-center justify-between gap-2 border-t border-white/[0.06] px-4 py-3 text-[11px] uppercase tracking-[0.2em] text-subtle">
        <span>{label}</span>
        <span className="text-muted">hover to zoom</span>
      </figcaption>
    </figure>
  );
}

/* ========================================================================== */
/*  Code Lens — IDE-style panel + explanation                                 */
/* ========================================================================== */

function CodeLens({ project }: { project: Project }) {
  const { language, code, explanation } = project.codeSnippet;

  return (
    <motion.section variants={sectionVariants} className="flex flex-col gap-6">
      <SectionTitle icon={<Database className="h-4 w-4" />}>Code Lens</SectionTitle>

      <div className="grid grid-cols-1 gap-5 lg:grid-cols-[1.6fr_1fr]">
        {/* IDE window */}
        <div className="overflow-hidden rounded-2xl border border-white/10 bg-[#1e2127] shadow-[0_30px_80px_-30px_rgba(0,0,0,0.8)]">
          {/* Title bar */}
          <div className="flex items-center gap-3 border-b border-white/[0.06] bg-[#21252b] px-4 py-2.5">
            <div className="flex items-center gap-1.5">
              <span className="h-3 w-3 rounded-full bg-[#ff5f57] shadow-[0_0_8px_rgba(255,95,87,0.5)]" />
              <span className="h-3 w-3 rounded-full bg-[#febc2e] shadow-[0_0_8px_rgba(254,188,46,0.45)]" />
              <span className="h-3 w-3 rounded-full bg-[#28c840] shadow-[0_0_8px_rgba(40,200,64,0.45)]" />
            </div>
            <div className="ml-2 flex-1 truncate text-center text-[11px] font-medium uppercase tracking-[0.18em] text-[#6b727f]">
              {language} — snippet
            </div>
            <span className="rounded-md bg-white/[0.04] px-2 py-0.5 text-[10px] uppercase tracking-wider text-[#6b727f]">
              {language}
            </span>
          </div>

          {/* Code body */}
          <div className="overflow-x-auto bg-[#282c34] font-mono text-[12.5px] leading-[1.7] text-[#abb2bf]">
            <CodeBlock code={code} language={language} />
          </div>
        </div>

        {/* Explanation panel */}
        <aside className="flex flex-col gap-3 rounded-2xl border border-white/10 bg-white/[0.02] p-5">
          <div className="text-[11px] uppercase tracking-[0.22em] text-subtle">
            Why this matters
          </div>
          <p className="text-sm leading-relaxed text-muted">{explanation}</p>
          <div className="mt-auto flex items-center gap-2 pt-2 text-[11px] text-subtle">
            <span className="h-1.5 w-1.5 rounded-full bg-accent shadow-[0_0_8px_rgba(16,185,129,0.7)]" />
            Annotated by the engineer who wrote it
          </div>
        </aside>
      </div>
    </motion.section>
  );
}

/* ── Tiny One-Dark-Pro syntax tokenizer (ts / nginx / hcl) ────────────── */

type TokenType = "comment" | "string" | "number" | "keyword" | "function" | "punct" | "text";

const LANG_KEYWORDS: Record<string, ReadonlySet<string>> = {
  ts: new Set([
    "const", "let", "var", "import", "from", "export", "default", "function",
    "return", "if", "else", "await", "async", "class", "private", "public",
    "protected", "readonly", "interface", "type", "null", "true", "false", "new",
    "this", "void", "never", "extends", "implements", "try", "catch", "throw",
    "for", "while", "do", "switch", "case", "break", "continue", "in", "of", "as",
    "typeof", "instanceof", "Promise", "string", "number", "boolean",
  ]),
  nginx: new Set([
    "server", "location", "upstream", "listen", "server_name", "proxy_pass",
    "proxy_http_version", "proxy_set_header", "proxy_read_timeout",
    "ssl_certificate", "ssl_certificate_key", "ssl_protocols",
    "ssl_prefer_server_ciphers", "add_header", "gzip", "gzip_types",
    "limit_req", "limit_req_zone", "return", "keepalive", "include", "root",
    "index", "try_files",
  ]),
  hcl: new Set([
    "resource", "variable", "module", "provider", "output", "data", "locals",
    "terraform", "true", "false", "null",
  ]),
};

const LINE_COMMENT: Record<string, string> = { ts: "//", nginx: "#", hcl: "#" };

function tokenize(code: string, lang: string): { type: TokenType; value: string }[] {
  const out: { type: TokenType; value: string }[] = [];
  const kws = LANG_KEYWORDS[lang] ?? new Set<string>();
  const lc = LINE_COMMENT[lang] ?? "//";
  let i = 0;

  const push = (type: TokenType, value: string) => {
    if (value) out.push({ type, value });
  };

  while (i < code.length) {
    const c = code[i];
    const rest = code.slice(i);

    // Line comment
    if (rest.startsWith(lc)) {
      const nl = code.indexOf("\n", i);
      const stop = nl === -1 ? code.length : nl;
      push("comment", code.slice(i, stop));
      i = stop;
      continue;
    }

    // Block comment (TS only)
    if (lang === "ts" && rest.startsWith("/*")) {
      const end = code.indexOf("*/", i + 2);
      const stop = end === -1 ? code.length : end + 2;
      push("comment", code.slice(i, stop));
      i = stop;
      continue;
    }

    // Strings: ", ', `
    if (c === '"' || c === "'" || c === "`") {
      const quote = c;
      let j = i + 1;
      while (j < code.length) {
        if (code[j] === "\\") { j += 2; continue; }
        if (code[j] === quote) { j += 1; break; }
        j += 1;
      }
      push("string", code.slice(i, j));
      i = j;
      continue;
    }

    // Number
    if (/\d/.test(c)) {
      let j = i;
      while (j < code.length && /[\d.]/.test(code[j])) j += 1;
      push("number", code.slice(i, j));
      i = j;
      continue;
    }

    // Identifier / keyword / function-call
    if (/[A-Za-z_$]/.test(c)) {
      let j = i;
      while (j < code.length && /[\w$]/.test(code[j])) j += 1;
      const word = code.slice(i, j);
      if (kws.has(word)) push("keyword", word);
      else if (code[j] === "(") push("function", word);
      else push("text", word);
      i = j;
      continue;
    }

    // Punctuation
    if (/[{}\[\]();,.:=<>+\-*/&|!?@]/.test(c)) {
      push("punct", c);
      i += 1;
      continue;
    }

    // Whitespace + everything else as plain text
    push("text", c);
    i += 1;
  }
  return out;
}

const TOKEN_CLASS: Record<TokenType, string> = {
  comment: "text-[#5c6370] italic",
  string: "text-[#98c379]",
  number: "text-[#d19a66]",
  keyword: "text-[#c678dd]",
  function: "text-[#61afef]",
  punct: "text-[#abb2bf]",
  text: "text-[#abb2bf]",
};

function CodeBlock({ code, language }: { code: string; language: string }) {
  const tokens = useMemo(() => tokenize(code, language), [code, language]);
  const lineCount = useMemo(() => code.split("\n").length, [code]);

  return (
    <div className="flex">
      <pre
        aria-hidden
        className="select-none border-r border-white/[0.05] px-4 py-4 text-right text-[#4b5263]"
      >
        {Array.from({ length: lineCount }, (_, i) => i + 1).join("\n")}
      </pre>
      <pre className="flex-1 overflow-x-auto px-5 py-4">
        <code>
          {tokens.map((t, idx) => (
            <span key={idx} className={TOKEN_CLASS[t.type]}>
              {t.value}
            </span>
          ))}
        </code>
      </pre>
    </div>
  );
}

/* ========================================================================== */
/*  Tech Flex — badges with hover-revealed reason                             */
/* ========================================================================== */

function TechFlex({ project }: { project: Project }) {
  return (
    <motion.section variants={sectionVariants} className="flex flex-col gap-6">
      <SectionTitle icon={<Layers3 className="h-4 w-4" />}>Tech Stack</SectionTitle>

      <div className="flex flex-wrap gap-3">
        {project.techStack.map((t) => (
          <div key={t.name} className="group/badge relative">
            <div
              className={[
                "relative cursor-default rounded-full border px-4 py-2 text-xs font-medium",
                "border-white/10 bg-white/[0.04] text-foreground/90",
                "shadow-[0_0_0_0_rgba(0,0,0,0)]",
                "transition-all duration-300",
                "group-hover/badge:border-gold/50 group-hover/badge:text-gold",
                "group-hover/badge:shadow-[0_0_24px_-4px_rgba(212,175,55,0.55)]",
              ].join(" ")}
            >
              {t.name}
            </div>

            {/* Hover reason tooltip */}
            <div
              role="tooltip"
              className={[
                "pointer-events-none absolute left-1/2 top-full z-20 mt-3 w-72 -translate-x-1/2",
                "origin-top scale-95 opacity-0 transition-all duration-200",
                "group-hover/badge:scale-100 group-hover/badge:opacity-100",
              ].join(" ")}
            >
              <div className="rounded-xl border border-white/10 bg-[rgba(10,10,10,0.95)] p-3.5 text-xs leading-relaxed text-muted shadow-[0_20px_60px_-20px_rgba(0,0,0,0.9)] backdrop-blur-xl">
                <div className="mb-1.5 text-[10px] uppercase tracking-[0.2em] text-gold">
                  Why this choice
                </div>
                {t.reason}
              </div>
            </div>
          </div>
        ))}
      </div>
    </motion.section>
  );
}

/* ========================================================================== */
/*  Power Stats — counting metrics                                            */
/* ========================================================================== */

function PowerStats({ metrics }: { metrics: readonly ProjectMetric[] }) {
  return (
    <motion.section variants={sectionVariants} className="flex flex-col gap-6">
      <SectionTitle icon={<Sparkles className="h-4 w-4" />}>Power Stats</SectionTitle>

      <div className="grid grid-cols-2 gap-3 md:grid-cols-4">
        {metrics.map((m) => (
          <PowerStat key={m.label} metric={m} />
        ))}
      </div>
    </motion.section>
  );
}

interface ParsedMetric {
  prefix: string;
  num: number;
  suffix: string;
  decimals: number;
}

function parseNumeric(value: string): ParsedMetric | null {
  const m = value.match(/^(\D*)(\d[\d,]*(?:\.\d+)?)([\s\S]*)$/);
  if (!m) return null;
  const raw = m[2].replace(/,/g, "");
  const num = Number(raw);
  if (!Number.isFinite(num)) return null;
  const dot = raw.indexOf(".");
  return {
    prefix: m[1],
    num,
    suffix: m[3],
    decimals: dot === -1 ? 0 : raw.length - dot - 1,
  };
}

function PowerStat({ metric }: { metric: ProjectMetric }) {
  const ref = useRef<HTMLDivElement>(null);
  const inView = useInView(ref, { once: true, amount: 0.6 });
  const prefersReducedMotion = useReducedMotion();
  const parsed = useMemo(() => parseNumeric(metric.value), [metric.value]);

  return (
    <div
      ref={ref}
      className="group/stat relative overflow-hidden rounded-2xl border border-white/[0.08] bg-white/[0.02] p-5 transition-colors duration-300 hover:border-gold/30"
    >
      <div
        aria-hidden
        className="pointer-events-none absolute -right-8 -top-8 h-24 w-24 rounded-full opacity-0 blur-2xl transition-opacity duration-500 group-hover/stat:opacity-100"
        style={{ background: "rgba(212,175,55,0.35)" }}
      />
      <div className="text-[10px] uppercase tracking-[0.22em] text-subtle">
        {metric.label}
      </div>
      <div
        className="mt-2 font-display text-2xl font-semibold tracking-tight md:text-3xl"
        style={{ color: SILVER, textShadow: "0 1px 24px rgba(226,232,240,0.18)" }}
      >
        {parsed && !prefersReducedMotion ? (
          <Counter parsed={parsed} active={inView} />
        ) : (
          <span>{metric.value}</span>
        )}
      </div>
    </div>
  );
}

function Counter({ parsed, active }: { parsed: ParsedMetric; active: boolean }) {
  const mv = useMotionValue(0);
  const display = useTransform(mv, (v) =>
    v.toLocaleString("en-US", {
      minimumFractionDigits: parsed.decimals,
      maximumFractionDigits: parsed.decimals,
    }),
  );

  useEffect(() => {
    if (!active) return;
    const controls = animate(mv, parsed.num, {
      duration: 1.6,
      ease: [0.16, 1, 0.3, 1],
    });
    return () => controls.stop();
  }, [active, mv, parsed.num]);

  return (
    <span>
      {parsed.prefix}
      <motion.span>{display}</motion.span>
      {parsed.suffix}
    </span>
  );
}

/* ========================================================================== */
/*  Magnetic close button                                                     */
/* ========================================================================== */

function MagneticCloseButton({ onClose }: { onClose: () => void }) {
  const ref = useRef<HTMLButtonElement>(null);
  const prefersReducedMotion = useReducedMotion();

  const x = useMotionValue(0);
  const y = useMotionValue(0);
  const sx = useSpring(x, { stiffness: 280, damping: 22, mass: 0.5 });
  const sy = useSpring(y, { stiffness: 280, damping: 22, mass: 0.5 });
  const innerX = useTransform(sx, (v) => v * 0.4);
  const innerY = useTransform(sy, (v) => v * 0.4);

  const handleMove = useCallback(
    (e: ReactMouseEvent<HTMLButtonElement>) => {
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
    <motion.button
      ref={ref}
      type="button"
      onClick={onClose}
      onMouseMove={handleMove}
      onMouseLeave={handleLeave}
      style={{ x: sx, y: sy }}
      aria-label="Close project detail"
      className={[
        "absolute right-4 top-4 z-30 flex h-10 w-10 items-center justify-center",
        "rounded-full border border-white/10 bg-black/60 backdrop-blur-md",
        "text-muted transition-[color,border-color,box-shadow] duration-300",
        "hover:border-gold/50 hover:text-gold",
        "hover:shadow-[0_0_30px_-4px_rgba(212,175,55,0.55)]",
        "focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-gold/60",
      ].join(" ")}
    >
      <motion.span style={{ x: innerX, y: innerY }} className="inline-flex">
        <X className="h-4 w-4" />
      </motion.span>
    </motion.button>
  );
}

/* ========================================================================== */
/*  Section title                                                             */
/* ========================================================================== */

function SectionTitle({ icon, children }: { icon: ReactNode; children: ReactNode }) {
  return (
    <div className="flex items-center gap-3">
      <span className="flex h-7 w-7 items-center justify-center rounded-lg border border-white/10 bg-white/3 text-gold">
        {icon}
      </span>
      <h3
        className="font-display text-sm font-medium uppercase tracking-[0.22em]"
        style={{ color: SILVER }}
      >
        {children}
      </h3>
      <span aria-hidden className="h-px flex-1 bg-linear-to-r from-white/10 to-transparent" />
    </div>
  );
}

/* ========================================================================== */
/*  Re-export: AnimatePresence wrapper for parents to compose                  */
/* ========================================================================== */

export { AnimatePresence };
