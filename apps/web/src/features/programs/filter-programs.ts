import type { ProgramSummary } from '@/lib/api/client';
import { reviewStatus, type ReviewStatus } from '@/lib/review-status';

export interface BrowseFilters {
  q: string;
  type: string | null;
  region: string | null;
  org: string | null;
  group: string | null;
  onlyOpen: boolean;
  status: ReviewStatus | null;
}

/** Browse filtering. A program with no regions is available everywhere, so it matches any region. */
export function filterPrograms(
  programs: ProgramSummary[],
  f: BrowseFilters,
  text: (program: ProgramSummary) => string,
  now: Date = new Date(),
): ProgramSummary[] {
  const words = f.q.toLocaleLowerCase().split(/\s+/).filter(Boolean);
  return programs.filter((p) => {
    if (f.type && !p.supportTypes.includes(f.type)) return false;
    if (f.region && p.regions.length > 0 && !p.regions.includes(f.region)) return false;
    if (f.org && p.organization.slug !== f.org) return false;
    if (f.group && !p.targetCircumstances.includes(f.group)) return false;
    if (f.status && reviewStatus(p, now) !== f.status) return false;
    if (f.onlyOpen) {
      if (p.applicationStatus !== 'OPEN') return false;
      if (p.deadline && new Date(p.deadline).getTime() < now.getTime()) return false;
    }
    if (words.length > 0) {
      const haystack = text(p).toLocaleLowerCase();
      if (!words.every((w) => haystack.includes(w))) return false;
    }
    return true;
  });
}
