"use client";

import {
  memo,
  useCallback,
  useEffect,
  useMemo,
  useRef,
  useState,
  type ChangeEvent,
  type FocusEvent,
  type FormEvent,
} from "react";
import {
  AnimatePresence,
  motion,
  useInView,
  useReducedMotion,
  type Variants,
} from "motion/react";

/* -------------------------------------------------------------------------- */
/*  Types                                                                     */
/* -------------------------------------------------------------------------- */

type FieldName = "name" | "email" | "message";
type FormState = Record<FieldName, string>;
type Phase =
  | "idle"
  | "booting"
  | "ready"
  | "transmitting"
  | "success"
  | "error";
type LogTone = "info" | "ok" | "warn" | "error";

interface LogEntry {
  readonly id: number;
  readonly tone: LogTone;
  readonly text: string;
}

interface FieldDef {
  readonly name: FieldName;
  readonly command: string;
  readonly placeholder: string;
  readonly multiline: boolean;
}

/* -------------------------------------------------------------------------- */
/*  Constants                                                                 */
/* -------------------------------------------------------------------------- */

const SILVER = "#E2E8F0";
const NEON_GOLD = "#D4AF37";
const NEON_GREEN = "#10B981";
const NEON_RED = "#ff5f57";

const EMAIL_RE = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;

const FIELDS: readonly FieldDef[] = [
  { name: "name",    command: "identify --name",     placeholder: "Your name…",         multiline: false },
  { name: "email",   command: "route --reply-to",    placeholder: "you@domain.tld",     multiline: false },
  { name: "message", command: "compose --payload",   placeholder: "Type your signal…",  multiline: true  },
];

const BOOT_LINES: readonly string[] = [
  "System Initializing...",
  "Loading Modules: [auth, crypto, transport]...",
  "READY. Awaiting operator input.",
];

const TRANSMIT_STEPS: readonly { readonly delay: number; readonly tone: LogTone; readonly text: string }[] = [
  { delay:    0, tone: "info", text: "Initiating handshake..." },
  { delay:  650, tone: "info", text: "Payload encrypted (AES-256-GCM)..." },
  { delay: 1300, tone: "info", text: "Routing through secure proxy..." },
  { delay: 2050, tone: "ok",   text: "STATUS: 200 OK — Signal delivered." },
];

const TONE_CLASS: Readonly<Record<LogTone, string>> = {
  info:  "text-[#9aa6b2]",
  ok:    "text-accent",
  warn:  "text-gold",
  error: "text-[#ff5f57]",
};

const TONE_PREFIX: Readonly<Record<LogTone, string>> = {
  info:  "[ INFO ]",
  ok:    "[  OK  ]",
  warn:  "[ WARN ]",
  error: "[ FAIL ]",
};

/* -------------------------------------------------------------------------- */
/*  Variants                                                                  */
/* -------------------------------------------------------------------------- */

const formReveal: Variants = {
  hidden:  { opacity: 0, y: 14, filter: "blur(6px)" },
  visible: {
    opacity: 1,
    y: 0,
    filter: "blur(0px)",
    transition: { type: "spring", stiffness: 180, damping: 24, mass: 0.8 },
  },
};

const fieldStagger: Variants = {
  hidden:  {},
  visible: { transition: { staggerChildren: 0.08, delayChildren: 0.1 } },
};

/* -------------------------------------------------------------------------- */
/*  Root component                                                            */
/* -------------------------------------------------------------------------- */

function ContactTerminalImpl() {
  const sectionRef = useRef<HTMLElement | null>(null);
  const inView = useInView(sectionRef, { once: true, amount: 0.35 });
  const prefersReducedMotion = useReducedMotion();

  const [phase, setPhase] = useState<Phase>("idle");
  const [bootTyped, setBootTyped] = useState<readonly string[]>(["", "", ""]);
  const [logs, setLogs] = useState<readonly LogEntry[]>([]);
  const [active, setActive] = useState<FieldName>("name");
  const [form, setForm] = useState<FormState>({ name: "", email: "", message: "" });

  /* ── Boot trigger via whileInView ─────────────────────────────────────── */
  useEffect(() => {
    if (inView && phase === "idle") setPhase(prefersReducedMotion ? "ready" : "booting");
  }, [inView, phase, prefersReducedMotion]);

  /* ── Typed boot sequence ──────────────────────────────────────────────── */
  useEffect(() => {
    if (phase !== "booting") return;
    let lineIdx = 0;
    let charIdx = 0;
    const buffer: string[] = ["", "", ""];
    let timer = 0;

    const tick = (): void => {
      if (lineIdx >= BOOT_LINES.length) {
        setPhase("ready");
        return;
      }
      const line = BOOT_LINES[lineIdx];
      if (charIdx <= line.length) {
        buffer[lineIdx] = line.slice(0, charIdx);
        setBootTyped([...buffer]);
        charIdx += 1;
        timer = window.setTimeout(tick, 22);
      } else {
        lineIdx += 1;
        charIdx = 0;
        timer = window.setTimeout(tick, 240);
      }
    };

    timer = window.setTimeout(tick, 240);
    return () => window.clearTimeout(timer);
  }, [phase]);

  /* ── Field handlers ───────────────────────────────────────────────────── */
  const handleChange = useCallback(
    (e: ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) => {
      const target = e.currentTarget;
      const name = target.name as FieldName;
      setForm((prev) => ({ ...prev, [name]: target.value }));
    },
    [],
  );

  const handleFocus = useCallback(
    (e: FocusEvent<HTMLInputElement | HTMLTextAreaElement>) => {
      setActive(e.currentTarget.name as FieldName);
    },
    [],
  );

  const pushLog = useCallback((tone: LogTone, text: string) => {
    setLogs((prev) => [...prev, { id: prev.length + 1, tone, text }]);
  }, []);

  /* ── Validation ───────────────────────────────────────────────────────── */
  const validate = useCallback((state: FormState): string | null => {
    if (!state.name.trim())    return "Missing operator identity. System cannot route signal.";
    if (!EMAIL_RE.test(state.email)) return "Invalid Email Format. System cannot route signal.";
    if (state.message.trim().length < 8)
      return "Payload too short (< 8 bytes). System cannot route signal.";
    return null;
  }, []);

  /* ── Submit / transmission ────────────────────────────────────────────── */
  const handleSubmit = useCallback(
    (e: FormEvent<HTMLFormElement>) => {
      e.preventDefault();
      if (phase === "transmitting") return;

      const failure = validate(form);
      if (failure) {
        setPhase("error");
        setLogs((prev) => [
          ...prev,
          { id: prev.length + 1, tone: "error", text: `[CRITICAL_ERROR] ${failure}` },
        ]);
        return;
      }

      setPhase("transmitting");
      setLogs([]);

      const timers = TRANSMIT_STEPS.map((step, i) =>
        window.setTimeout(() => {
          setLogs((prev) => [
            ...prev,
            { id: prev.length + 1, tone: step.tone, text: step.text },
          ]);
          if (i === TRANSMIT_STEPS.length - 1) {
            window.setTimeout(() => {
              setPhase("success");
              setForm({ name: "", email: "", message: "" });
            }, 400);
          }
        }, step.delay),
      );

      // Cleanup if component unmounts mid-transmission
      return () => timers.forEach((t) => window.clearTimeout(t));
    },
    [form, phase, validate],
  );

  const handleReset = useCallback(() => {
    setPhase("ready");
    setLogs([]);
  }, []);

  /* ── Memoised view fragments ──────────────────────────────────────────── */
  const showForm = phase === "ready" || phase === "transmitting" || phase === "error";
  const buttonLabel = useMemo<string>(() => {
    switch (phase) {
      case "transmitting": return "TRANSMITTING_DATA…";
      case "success":      return "SIGNAL_DELIVERED ✓";
      case "error":        return "RETRY_TRANSMISSION";
      default:             return "SEND_SIGNAL";
    }
  }, [phase]);

  /* ── Render ───────────────────────────────────────────────────────────── */
  return (
    <section
      id="contact"
      ref={sectionRef}
      className="relative isolate w-full overflow-hidden bg-black px-4 py-24 sm:px-6 md:py-32"
    >
      <MeshGradientBackground />

      <div className="relative z-10 mx-auto max-w-5xl">
        <Eyebrow />

        <motion.div
          initial={{ opacity: 0, y: 24, scale: 0.985 }}
          animate={inView ? { opacity: 1, y: 0, scale: 1 } : undefined}
          transition={{ type: "spring", stiffness: 160, damping: 22, mass: 0.85 }}
          className={[
            "relative overflow-hidden rounded-2xl",
            "border border-[#E2E8F0]/15",
            "bg-[rgba(6,6,8,0.75)] backdrop-blur-2xl",
            "shadow-[0_40px_120px_-30px_rgba(0,0,0,0.95),inset_0_1px_0_rgba(226,232,240,0.08)]",
            "will-change-transform",
          ].join(" ")}
          style={{
            backgroundImage:
              "linear-gradient(180deg, rgba(20,20,28,0.55) 0%, rgba(6,6,8,0.85) 100%)",
          }}
        >
          {/* Metallic top edge */}
          <span
            aria-hidden
            className="pointer-events-none absolute inset-x-0 top-0 h-px"
            style={{
              background:
                "linear-gradient(90deg, transparent, rgba(226,232,240,0.55), transparent)",
            }}
          />

          <MacWindowChrome onClose={handleReset} />

          <div className="relative px-5 pb-8 pt-6 font-mono text-[13px] leading-[1.65] sm:px-8 md:text-sm">
            <BootConsole lines={bootTyped} active={phase === "booting"} />

            <AnimatePresence>
              {showForm ? (
                <motion.form
                  key="form"
                  variants={formReveal}
                  initial="hidden"
                  animate="visible"
                  onSubmit={handleSubmit}
                  className="mt-6 flex flex-col gap-5"
                >
                  <motion.div
                    variants={fieldStagger}
                    initial="hidden"
                    animate="visible"
                    className="flex flex-col gap-4"
                  >
                    {FIELDS.map((f) => (
                      <CommandLine
                        key={f.name}
                        field={f}
                        value={form[f.name]}
                        active={active === f.name}
                        disabled={phase === "transmitting"}
                        onChange={handleChange}
                        onFocus={handleFocus}
                      />
                    ))}
                  </motion.div>

                  <SubmitRow
                    phase={phase}
                    label={buttonLabel}
                    disabled={phase === "transmitting"}
                  />
                </motion.form>
              ) : null}
            </AnimatePresence>

            <AnimatePresence>
              {phase === "transmitting" ? <TransmissionTheatre /> : null}
            </AnimatePresence>

            <LogConsole logs={logs} phase={phase} />
          </div>

          <CRTOverlay />
        </motion.div>
      </div>
    </section>
  );
}

const ContactTerminal = memo(ContactTerminalImpl);
ContactTerminal.displayName = "ContactTerminal";
export default ContactTerminal;

/* ========================================================================== */
/*  Eyebrow / heading                                                         */
/* ========================================================================== */

const Eyebrow = memo(function Eyebrow() {
  return (
    <header className="mb-8 flex flex-col items-center gap-3 text-center">
      <span className="text-[11px] uppercase tracking-[0.32em] text-gold/80">
         The Communication Terminal
      </span>
      <h2
        className="font-display text-3xl font-bold tracking-tight md:text-5xl"
        style={{ color: SILVER, textShadow: "0 1px 40px rgba(226,232,240,0.18)" }}
      >
        Open a secure channel.
      </h2>
      <p className="max-w-xl text-sm text-muted md:text-base">
        Authenticated request, end-to-end encrypted in transit. Submit the form
        and a signal will be routed to my inbox within seconds.
      </p>
    </header>
  );
});

/* ========================================================================== */
/*  Mac window chrome                                                         */
/* ========================================================================== */

const MacWindowChrome = memo(function MacWindowChrome({
  onClose,
}: {
  onClose: () => void;
}) {
  return (
    <div className="relative flex items-center gap-3 border-b border-white/6 bg-[rgba(20,20,24,0.85)] px-4 py-2.5">
      <div className="flex items-center gap-2">
        <button
          type="button"
          aria-label="Reset terminal"
          onClick={onClose}
          className="h-3 w-3 rounded-full bg-[#ff5f57] shadow-[0_0_8px_rgba(255,95,87,0.55)] transition-transform hover:scale-110"
        />
        <span className="h-3 w-3 rounded-full bg-[#febc2e] shadow-[0_0_8px_rgba(254,188,46,0.5)]" />
        <span className="h-3 w-3 rounded-full bg-[#28c840] shadow-[0_0_8px_rgba(40,200,64,0.5)]" />
      </div>
      <div className="ml-2 flex-1 truncate text-center font-mono text-[11px] uppercase tracking-[0.18em] text-[#6b727f]">
        communication_console.exe
      </div>
      <span className="font-mono text-[10px] uppercase tracking-[0.2em] text-[#6b727f]">
        TTY/0
      </span>
    </div>
  );
});

/* ========================================================================== */
/*  Boot console                                                              */
/* ========================================================================== */

const BootConsole = memo(function BootConsole({
  lines,
  active,
}: {
  lines: readonly string[];
  active: boolean;
}) {
  // Cursor sits on the last line that has any typed content.
  const cursorIdx = useMemo(() => {
    for (let i = lines.length - 1; i >= 0; i -= 1) {
      if (lines[i].length > 0) return i;
    }
    return 0;
  }, [lines]);

  return (
    <ul className="flex flex-col gap-1 text-[#9aa6b2]">
      {lines.map((line, i) => (
        <li key={i} className="flex items-baseline gap-2">
          <span className="text-gold">&gt;</span>
          <span>{line}</span>
          {active && i === cursorIdx && line.length > 0 ? <BlinkingCursor /> : null}
        </li>
      ))}
    </ul>
  );
});

/* ========================================================================== */
/*  Blinking block cursor                                                     */
/* ========================================================================== */

const BlinkingCursor = memo(function BlinkingCursor({
  color = NEON_GOLD,
}: {
  color?: string;
}) {
  return (
    <motion.span
      aria-hidden
      animate={{ opacity: [1, 0, 1] }}
      transition={{ duration: 1, repeat: Infinity, ease: "linear", times: [0, 0.5, 1] }}
      className="inline-block h-[1.05em] w-[0.55em] translate-y-0.5 align-middle"
      style={{ background: color, boxShadow: `0 0 10px ${color}aa` }}
    />
  );
});

/* ========================================================================== */
/*  Command line — single field                                               */
/* ========================================================================== */

interface CommandLineProps {
  readonly field: FieldDef;
  readonly value: string;
  readonly active: boolean;
  readonly disabled: boolean;
  readonly onChange: (e: ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) => void;
  readonly onFocus: (e: FocusEvent<HTMLInputElement | HTMLTextAreaElement>) => void;
}

const lineEnter: Variants = {
  hidden:  { opacity: 0, x: -10, filter: "blur(4px)" },
  visible: {
    opacity: 1,
    x: 0,
    filter: "blur(0px)",
    transition: { type: "spring", stiffness: 220, damping: 26 },
  },
};

const CommandLine = memo(function CommandLine({
  field,
  value,
  active,
  disabled,
  onChange,
  onFocus,
}: CommandLineProps) {
  const accent = active ? NEON_GOLD : "rgba(226,232,240,0.35)";
  return (
    <motion.label
      variants={lineEnter}
      htmlFor={`field-${field.name}`}
      className={[
        "relative block rounded-md px-3 py-2 transition-colors duration-300",
        "border",
        active
          ? "border-gold/60 bg-gold/4"
          : "border-white/6 bg-white/1.5 hover:border-white/12",
      ].join(" ")}
      style={{
        boxShadow: active
          ? `0 0 0 1px ${NEON_GOLD}33, 0 0 28px -6px ${NEON_GOLD}80, inset 0 0 24px -10px ${NEON_GOLD}55`
          : "none",
      }}
    >
      <div className="flex items-baseline gap-1.5 text-[11px]">
        <span className="text-accent">guest</span>
        <span className="text-subtle">@</span>
        <span className="text-gold">portfolio</span>
        <span className="text-subtle">:~$</span>
        <span className="ml-1 text-foreground/80">{field.command}</span>
      </div>

      <div className="mt-1.5 flex items-start gap-2">
        <span className="select-none pt-px text-accent">$</span>
        {field.multiline ? (
          <textarea
            id={`field-${field.name}`}
            name={field.name}
            value={value}
            onChange={onChange}
            onFocus={onFocus}
            disabled={disabled}
            rows={4}
            placeholder={field.placeholder}
            spellCheck={false}
            autoComplete="off"
            className={[
              "min-h-26 flex-1 resize-none bg-transparent outline-none",
              "text-[#E2E8F0] placeholder:text-subtle",
              "caret-transparent disabled:opacity-60",
            ].join(" ")}
            style={{ caretColor: "transparent" }}
          />
        ) : (
          <input
            id={`field-${field.name}`}
            name={field.name}
            type={field.name === "email" ? "email" : "text"}
            value={value}
            onChange={onChange}
            onFocus={onFocus}
            disabled={disabled}
            placeholder={field.placeholder}
            spellCheck={false}
            autoComplete="off"
            className={[
              "w-full flex-1 bg-transparent outline-none",
              "text-[#E2E8F0] placeholder:text-subtle",
              "caret-transparent disabled:opacity-60",
            ].join(" ")}
            style={{ caretColor: "transparent" }}
          />
        )}
        {active ? <BlinkingCursor color={accent} /> : null}
      </div>
    </motion.label>
  );
});

/* ========================================================================== */
/*  Submit row                                                                */
/* ========================================================================== */

const SubmitRow = memo(function SubmitRow({
  phase,
  label,
  disabled,
}: {
  phase: Phase;
  label: string;
  disabled: boolean;
}) {
  const isOk    = phase === "success";
  const isErr   = phase === "error";
  const isBusy  = phase === "transmitting";

  const tone = isOk ? NEON_GREEN : isErr ? NEON_RED : NEON_GOLD;

  return (
    <div className="mt-3 flex flex-wrap items-center gap-3">
      <button
        type="submit"
        disabled={disabled}
        className={[
          "group relative inline-flex items-center gap-2 overflow-hidden rounded-md px-5 py-2.5",
          "font-mono text-xs uppercase tracking-[0.22em]",
          "border border-white/10 bg-black/60 backdrop-blur-md",
          "transition-[box-shadow,border-color,color] duration-300",
          "disabled:cursor-wait",
          "focus-visible:outline-none focus-visible:ring-2",
        ].join(" ")}
        style={{
          color: tone,
          borderColor: `${tone}55`,
          boxShadow: `0 0 24px -6px ${tone}88, inset 0 0 14px -8px ${tone}88`,
        }}
      >
        {isBusy ? <Spinner color={tone} /> : <CaretGlyph color={tone} />}
        <span>{label}</span>
        <span
          aria-hidden
          className="absolute inset-0 -z-10 opacity-0 transition-opacity duration-300 group-hover:opacity-100"
          style={{ background: `radial-gradient(60% 100% at 50% 50%, ${tone}26, transparent 70%)` }}
        />
      </button>

      <span className="font-mono text-[11px] tracking-[0.2em] text-subtle">
        ENTER ⏎ to transmit
      </span>
    </div>
  );
});

const CaretGlyph = memo(function CaretGlyph({ color }: { color: string }) {
  return (
    <span
      aria-hidden
      className="inline-block h-2 w-2 rotate-45"
      style={{ borderRight: `2px solid ${color}`, borderTop: `2px solid ${color}` }}
    />
  );
});

const Spinner = memo(function Spinner({ color }: { color: string }) {
  return (
    <motion.span
      aria-hidden
      className="inline-block h-3 w-3 rounded-full border-2 border-transparent"
      style={{ borderTopColor: color, borderRightColor: color }}
      animate={{ rotate: 360 }}
      transition={{ duration: 0.7, ease: "linear", repeat: Infinity }}
    />
  );
});

/* ========================================================================== */
/*  Transmission Theatre — packets flying along motion paths                  */
/* ========================================================================== */

const PACKET_PATHS: readonly { from: { x: number; y: number }; mid: { x: number; y: number }; to: { x: number; y: number } }[] = [
  { from: { x:  30, y:  30 }, mid: { x: 320, y:  60 }, to: { x: 560, y: 100 } },
  { from: { x:  30, y: 100 }, mid: { x: 320, y: 100 }, to: { x: 560, y: 100 } },
  { from: { x:  30, y: 170 }, mid: { x: 320, y: 140 }, to: { x: 560, y: 100 } },
];

const TransmissionTheatre = memo(function TransmissionTheatre() {
  return (
    <motion.div
      key="theatre"
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      exit={{ opacity: 0 }}
      transition={{ duration: 0.3 }}
      className="relative my-6 h-44 w-full overflow-hidden rounded-lg border border-white/6 bg-black/40"
    >
      <div
        aria-hidden
        className="pointer-events-none absolute inset-0 opacity-50"
        style={{
          backgroundImage:
            "linear-gradient(rgba(226,232,240,0.05) 1px, transparent 1px), linear-gradient(90deg, rgba(226,232,240,0.05) 1px, transparent 1px)",
          backgroundSize: "24px 24px",
        }}
      />

      <svg
        viewBox="0 0 600 200"
        preserveAspectRatio="none"
        className="absolute inset-0 h-full w-full"
      >
        <defs>
          <filter id="packet-glow" x="-50%" y="-50%" width="200%" height="200%">
            <feGaussianBlur stdDeviation="2.5" result="b" />
            <feMerge>
              <feMergeNode in="b" />
              <feMergeNode in="SourceGraphic" />
            </feMerge>
          </filter>
          <linearGradient id="trail" x1="0" x2="1">
            <stop offset="0%"   stopColor={NEON_GOLD}  stopOpacity="0" />
            <stop offset="60%"  stopColor={NEON_GOLD}  stopOpacity="0.55" />
            <stop offset="100%" stopColor={NEON_GREEN} stopOpacity="0.9" />
          </linearGradient>
        </defs>

        {/* Source markers */}
        {PACKET_PATHS.map((p, i) => (
          <g key={`src-${i}`}>
            <circle cx={p.from.x} cy={p.from.y} r={4} fill={NEON_GOLD} filter="url(#packet-glow)" />
            <text
              x={p.from.x + 10}
              y={p.from.y + 4}
              fontFamily="ui-monospace, monospace"
              fontSize="10"
              fill="#9aa6b2"
            >
              {["NAME", "ADDR", "BODY"][i]}
            </text>
          </g>
        ))}

        {/* Connecting trails */}
        {PACKET_PATHS.map((p, i) => (
          <path
            key={`trail-${i}`}
            d={`M ${p.from.x},${p.from.y} Q ${p.mid.x},${p.mid.y} ${p.to.x},${p.to.y}`}
            stroke="url(#trail)"
            strokeWidth="1.2"
            fill="none"
            strokeDasharray="4 6"
            opacity={0.55}
          />
        ))}

        {/* Server node */}
        <ServerNode x={560} y={100} />

        {/* Animated packets */}
        {PACKET_PATHS.map((p, i) => (
          <motion.rect
            key={`pkt-${i}`}
            width={8}
            height={8}
            fill={NEON_GOLD}
            filter="url(#packet-glow)"
            initial={{ x: p.from.x - 4, y: p.from.y - 4, opacity: 0 }}
            animate={{
              x: [p.from.x - 4, p.mid.x - 4, p.to.x - 4],
              y: [p.from.y - 4, p.mid.y - 4, p.to.y - 4],
              opacity: [0, 1, 1, 0],
            }}
            transition={{
              duration: 1.4,
              ease: "easeInOut",
              times: [0, 0.5, 1],
              repeat: Infinity,
              repeatDelay: 0.2,
              delay: i * 0.18,
            }}
            rx={1.5}
          />
        ))}
      </svg>

      <span className="absolute bottom-2 left-3 font-mono text-[10px] uppercase tracking-[0.22em] text-subtle">
        live · packet flow
      </span>
    </motion.div>
  );
});

const ServerNode = memo(function ServerNode({ x, y }: { x: number; y: number }) {
  return (
    <g>
      {[18, 26, 34].map((r, i) => (
        <motion.circle
          key={r}
          cx={x}
          cy={y}
          r={r}
          fill="none"
          stroke={NEON_GREEN}
          strokeOpacity={0.4}
          strokeWidth={1}
          initial={{ scale: 0.85, opacity: 0 }}
          animate={{ scale: [0.85, 1.05, 0.85], opacity: [0, 0.5, 0] }}
          transition={{
            duration: 1.8,
            ease: "easeInOut",
            repeat: Infinity,
            delay: i * 0.45,
          }}
          style={{ transformOrigin: `${x}px ${y}px` }}
        />
      ))}
      <circle cx={x} cy={y} r={10} fill={NEON_GREEN} filter="url(#packet-glow)" />
      <text
        x={x}
        y={y + 28}
        textAnchor="middle"
        fontFamily="ui-monospace, monospace"
        fontSize="10"
        fill={NEON_GREEN}
      >
        SERVER_NODE
      </text>
    </g>
  );
});

/* ========================================================================== */
/*  Log console                                                               */
/* ========================================================================== */

const LogConsole = memo(function LogConsole({
  logs,
  phase,
}: {
  logs: readonly LogEntry[];
  phase: Phase;
}) {
  if (logs.length === 0 && phase !== "success") return null;

  return (
    <div className="mt-6 rounded-md border border-white/6 bg-black/60 p-3">
      <div className="mb-2 flex items-center justify-between">
        <span className="font-mono text-[10px] uppercase tracking-[0.22em] text-subtle">
          /var/log/transmission.log
        </span>
        <span
          className={[
            "font-mono text-[10px] uppercase tracking-[0.22em]",
            phase === "success" ? "text-accent" : phase === "error" ? "text-[#ff5f57]" : "text-gold",
          ].join(" ")}
        >
          {phase === "success" ? "delivered" : phase === "error" ? "halted" : "streaming"}
        </span>
      </div>
      <ul className="flex flex-col gap-1">
        <AnimatePresence initial={false}>
          {logs.map((l) => (
            <motion.li
              key={l.id}
              initial={{ opacity: 0, x: -8 }}
              animate={{ opacity: 1, x: 0 }}
              exit={{ opacity: 0 }}
              transition={{ duration: 0.25 }}
              className="font-mono text-[12px] leading-relaxed"
            >
              <span className={TONE_CLASS[l.tone]}>{TONE_PREFIX[l.tone]}</span>{" "}
              <span className={l.tone === "error" ? "text-[#ff8a85]" : "text-foreground/85"}>
                {l.text}
              </span>
            </motion.li>
          ))}
        </AnimatePresence>
      </ul>
    </div>
  );
});

/* ========================================================================== */
/*  Mesh-gradient background — slow, ambient                                  */
/* ========================================================================== */

const MeshGradientBackground = memo(function MeshGradientBackground() {
  const prefersReducedMotion = useReducedMotion();
  return (
    <div aria-hidden className="pointer-events-none absolute inset-0 z-0 overflow-hidden">
      <div className="absolute inset-0 mesh-gradient-base" />
      <motion.div
        className="absolute inset-[-20%] mesh-gradient-drift"
        animate={
          prefersReducedMotion
            ? undefined
            : { x: ["-3%", "3%", "-3%"], y: ["2%", "-2%", "2%"], rotate: [0, 8, 0] }
        }
        transition={{ duration: 32, ease: "easeInOut", repeat: Infinity }}
      />
      <motion.div
        className="absolute inset-[-25%] mesh-gradient-drift-alt"
        animate={
          prefersReducedMotion
            ? undefined
            : { x: ["4%", "-4%", "4%"], y: ["-2%", "3%", "-2%"], rotate: [0, -6, 0] }
        }
        transition={{ duration: 48, ease: "easeInOut", repeat: Infinity }}
      />
      {/* Vignette so the terminal sits on a darker base */}
      <div className="absolute inset-0 bg-[radial-gradient(ellipse_at_center,transparent_30%,rgba(0,0,0,0.85)_85%)]" />
    </div>
  );
});

/* ========================================================================== */
/*  CRT overlay — scanlines + flicker                                         */
/* ========================================================================== */

const CRTOverlay = memo(function CRTOverlay() {
  const prefersReducedMotion = useReducedMotion();
  return (
    <>
      {/* Fine scanlines */}
      <div
        aria-hidden
        className="pointer-events-none absolute inset-0 z-20 mix-blend-overlay scanlines"
      />
      {/* Soft flicker */}
      {prefersReducedMotion ? null : (
        <motion.div
          aria-hidden
          className="pointer-events-none absolute inset-0 z-20 bg-white"
          animate={{ opacity: [0, 0.02, 0, 0.015, 0] }}
          transition={{ duration: 4, ease: "linear", repeat: Infinity }}
        />
      )}
      {/* Curved edge vignette to mimic a CRT bulge */}
      <div
        aria-hidden
        className="pointer-events-none absolute inset-0 z-20"
        style={{
          background:
            "radial-gradient(120% 90% at 50% 50%, transparent 60%, rgba(0,0,0,0.55) 100%)",
        }}
      />
    </>
  );
});
