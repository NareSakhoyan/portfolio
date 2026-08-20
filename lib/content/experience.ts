import experienceJson from "@/content/experience.json";
import type { ExperienceEntry } from "./types";

const MONTHS = ["Jan", "Feb", "Mar", "Apr", "May", "Jun", "Jul", "Aug", "Sep", "Oct", "Nov", "Dec"];

export function getExperience(): ExperienceEntry[] {
  return experienceJson as ExperienceEntry[];
}

/** "2025-11" → "Nov 2025". Year-only strings pass through. */
export function formatYearMonth(value: string): string {
  const [year, month] = value.split("-");
  if (!month) return year;
  const idx = Number(month) - 1;
  return `${MONTHS[idx] ?? month} ${year}`;
}
