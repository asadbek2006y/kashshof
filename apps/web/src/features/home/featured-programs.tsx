'use client';

import { motion } from 'motion/react';
import { ProgramCard } from '@/components/hamroh/program-card';
import type { ProgramSummary } from '@/lib/api/client';
import { stagger } from '@/lib/motion';

/** A short preview of programs on the home page; the full list lives on /explore. */
export function FeaturedPrograms({ programs }: { programs: ProgramSummary[] }) {
  return (
    <motion.div variants={stagger} initial="hidden" animate="visible" className="grid gap-4 md:grid-cols-2" data-testid="home-programs">
      {programs.map((program) => (
        <ProgramCard key={program.id} program={program} />
      ))}
    </motion.div>
  );
}
