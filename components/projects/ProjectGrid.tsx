"use client";

import { memo } from "react";
import { motion, type Variants } from "motion/react";

import { PROJECTS, type Project } from "@/constants/projects";
import ProjectCard, {
  type ProjectCardLayout,
} from "@/components/projects/ProjectCard";

/* -------------------------------------------------------------------------- */
/*  Bento layout assignments                                                  */
/* -------------------------------------------------------------------------- */

/**
 * Layout intent per project — kept here (not on the Project type) so the
 * editorial decision of "which card is the hero" stays in the presentation
 * layer, where it belongs. Falls back to "small" for unmapped IDs.
 */
const LAYOUT_BY_ID: Readonly<Record<string, ProjectCardLayout>> = {
  planora: "large",
  "nexus-med": "tall",
  "nagad-auto-lifting": "wide",
  syfmart: "small",
};

const layoutFor = (project: Project): ProjectCardLayout =>
  LAYOUT_BY_ID[project.id] ?? "small";

/* -------------------------------------------------------------------------- */
/*  Motion variants                                                           */
/* -------------------------------------------------------------------------- */

/** Parent orchestrates the staggered "Nebula" entrance. */
const gridVariants: Variants = {
  hidden: {},
  visible: {
    transition: {
      staggerChildren: 0.1,
      delayChildren: 0.05,
    },
  },
};

/* -------------------------------------------------------------------------- */
/*  Component                                                                 */
/* -------------------------------------------------------------------------- */

export interface ProjectGridProps {
  /** Override the default project list (e.g. for filtered views). */
  readonly projects?: readonly Project[];
}

function ProjectGridImpl({ projects = PROJECTS }: ProjectGridProps) {
  return (
    <motion.section
      variants={gridVariants}
      initial="hidden"
      whileInView="visible"
      viewport={{ once: true, amount: 0.15 }}
      aria-label="Featured projects"
      className={[
        // Base grid — fluid responsive Bento.
        "grid w-full gap-4 md:gap-5 xl:gap-6",
        // Mobile: single column. Tablet: 2-col. Ultra-wide: 6-col Bento.
        "grid-cols-1 md:grid-cols-2 xl:grid-cols-6",
        // Dense flow eliminates holes when cards span unevenly.
        "[grid-auto-flow:dense]",
        // Equal-height rows on the xl Bento so row-spans line up cleanly.
        "xl:auto-rows-[minmax(220px,_1fr)]",
      ].join(" ")}
    >
      {projects.map((project) => (
        <ProjectCard
          key={project.id}
          project={project}
          layout={layoutFor(project)}
        />
      ))}
    </motion.section>
  );
}

const ProjectGrid = memo(ProjectGridImpl);
ProjectGrid.displayName = "ProjectGrid";
export default ProjectGrid;
