"use client";

import {
  memo,
  useCallback,
  useEffect,
  useMemo,
  useState,
  type KeyboardEvent as ReactKeyboardEvent,
} from "react";
import {
  AnimatePresence,
  motion,
  type Transition,
  type Variants,
} from "motion/react";

import { PROJECTS, type Project } from "@/constants/projects";
import ProjectCard from "@/components/projects/ProjectCard";
import ProjectDetail from "@/components/projects/ProjectDetail";
import BeastPagination from "@/components/projects/BeastPagination";

const PAGE_SIZE = 3;

/**
 * Direction is signed so the slide animation can pull from the correct edge.
 *  +1 → user paged forward (new row enters from the right).
 *  -1 → user paged backward (new row enters from the left).
 */
type Direction = 1 | -1;

const SPRING: Transition = {
  type: "spring",
  stiffness: 220,
  damping: 28,
  mass: 0.85,
};

/**
 * Whole-row slide. Each row is a single keyed motion.div, so the Bento of
 * three cards moves as one slab — feels cinematic, not "card-by-card".
 */
const rowVariants: Variants = {
  enter: (dir: Direction) => ({
    x: dir > 0 ? "100%" : "-100%",
    opacity: 0,
    filter: "blur(8px)",
  }),
  center: {
    x: "0%",
    opacity: 1,
    filter: "blur(0px)",
    transition: SPRING,
  },
  exit: (dir: Direction) => ({
    x: dir > 0 ? "-100%" : "100%",
    opacity: 0,
    filter: "blur(8px)",
    transition: { ...SPRING, stiffness: 260, damping: 30 },
  }),
};

/** Stagger the three cards inside the row so they pop in sequence. */
const innerVariants: Variants = {
  hidden: {},
  visible: {
    transition: { staggerChildren: 0.08, delayChildren: 0.04 },
  },
};

export interface ProjectRowProps {
  readonly projects?: readonly Project[];
}

function ProjectRowImpl({ projects = PROJECTS }: ProjectRowProps) {
  const [page, setPage] = useState(0);
  const [direction, setDirection] = useState<Direction>(1);
  const [selected, setSelected] = useState<Project | null>(null);

  const totalPages = useMemo(
    () => Math.max(1, Math.ceil(projects.length / PAGE_SIZE)),
    [projects.length],
  );

  const visible = useMemo(
    () => projects.slice(page * PAGE_SIZE, page * PAGE_SIZE + PAGE_SIZE),
    [projects, page],
  );

  const goTo = useCallback(
    (next: number) => {
      const clamped = Math.max(0, Math.min(totalPages - 1, next));
      setPage((prev) => {
        if (clamped === prev) return prev;
        setDirection(clamped > prev ? 1 : -1);
        return clamped;
      });
    },
    [totalPages],
  );

  const handlePrev = useCallback(() => goTo(page - 1), [goTo, page]);
  const handleNext = useCallback(() => goTo(page + 1), [goTo, page]);

  const handleOpen = useCallback((project: Project) => {
    setSelected(project);
  }, []);

  const handleClose = useCallback(() => {
    setSelected(null);
  }, []);

  // Arrow-key navigation when no detail is open.
  useEffect(() => {
    if (selected) return;
    const onKey = (e: KeyboardEvent) => {
      if (e.key === "ArrowRight") handleNext();
      else if (e.key === "ArrowLeft") handlePrev();
    };
    window.addEventListener("keydown", onKey);
    return () => window.removeEventListener("keydown", onKey);
  }, [selected, handleNext, handlePrev]);

  const onContainerKey = useCallback(
    (e: ReactKeyboardEvent<HTMLDivElement>) => {
      if (e.key === "ArrowRight") {
        e.preventDefault();
        handleNext();
      } else if (e.key === "ArrowLeft") {
        e.preventDefault();
        handlePrev();
      }
    },
    [handleNext, handlePrev],
  );

  return (
    <>
      <div
        role="region"
        aria-label="The Technical Archive — paginated project showcase"
        onKeyDown={onContainerKey}
        className="relative flex w-full flex-col gap-10"
      >
        {/* Ambient field behind the row — pitch black with two soft halos. */}
        <div
          aria-hidden
          className="pointer-events-none absolute inset-0 -z-10"
          style={{
            background:
              "radial-gradient(60% 50% at 25% 15%, rgba(212,175,55,0.05) 0%, transparent 70%), radial-gradient(50% 40% at 80% 85%, rgba(16,185,129,0.05) 0%, transparent 70%)",
          }}
        />

        {/* Slide stage — fixed-height shell so the row swap doesn't reflow the page. */}
        <div className="relative w-full overflow-hidden">
          <AnimatePresence mode="wait" custom={direction} initial={false}>
            <motion.div
              key={page}
              custom={direction}
              variants={rowVariants}
              initial="enter"
              animate="center"
              exit="exit"
              className="will-change-transform"
            >
              <motion.div
                variants={innerVariants}
                initial="hidden"
                animate="visible"
                className="grid grid-cols-1 gap-6 md:grid-cols-2 lg:grid-cols-3 lg:gap-7"
              >
                {visible.map((project) => (
                  <ProjectCard
                    key={project.id}
                    project={project}
                    onOpen={handleOpen}
                  />
                ))}
              </motion.div>
            </motion.div>
          </AnimatePresence>
        </div>

        <BeastPagination
          page={page}
          totalPages={totalPages}
          direction={direction}
          onPrev={handlePrev}
          onNext={handleNext}
        />
      </div>

      {/* In-place detail — shares layoutId with the card for the morph transition. */}
      <AnimatePresence mode="wait">
        {selected ? (
          <ProjectDetail
            key={selected.id}
            project={selected}
            onClose={handleClose}
          />
        ) : null}
      </AnimatePresence>
    </>
  );
}

const ProjectRow = memo(ProjectRowImpl);
ProjectRow.displayName = "ProjectRow";
export default ProjectRow;
