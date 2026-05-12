"use client";

import { Badge } from "@/components/ui/badge";
import { GraduationCap, Compass, Sparkles } from "lucide-react";

export type LessonContext = "course" | "track" | "standalone";

const STYLES: Record<LessonContext, { label: string; tone: string; Icon: typeof GraduationCap }> = {
  course: {
    label: "Course",
    tone: "bg-emerald-500/15 text-emerald-600 border-emerald-500/30",
    Icon: GraduationCap,
  },
  track: {
    label: "Track",
    tone: "bg-blue-500/15 text-blue-600 border-blue-500/30",
    Icon: Compass,
  },
  standalone: {
    label: "Standalone",
    tone: "bg-orange-500/15 text-orange-600 border-orange-500/30",
    Icon: Sparkles,
  },
};

export function LessonTypeBadge({ context }: { context: LessonContext }) {
  const s = STYLES[context];
  const Icon = s.Icon;
  return (
    <Badge variant="outline" className={`rounded-full px-3 py-1 font-bold border-2 gap-1.5 ${s.tone}`}>
      <Icon className="w-3.5 h-3.5" />
      {s.label}
    </Badge>
  );
}
