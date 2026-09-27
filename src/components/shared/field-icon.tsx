import {
  Briefcase,
  Calculator,
  Camera,
  Cog,
  Database,
  GraduationCap,
  HeartPulse,
  Landmark,
  Leaf,
  Megaphone,
  Monitor,
  Palette,
  Scale,
  Users,
  type LucideIcon,
} from "lucide-react";

const ICONS: Record<string, LucideIcon> = {
  monitor: Monitor,
  cog: Cog,
  palette: Palette,
  megaphone: Megaphone,
  briefcase: Briefcase,
  landmark: Landmark,
  "graduation-cap": GraduationCap,
  "heart-pulse": HeartPulse,
  calculator: Calculator,
  database: Database,
  scale: Scale,
  leaf: Leaf,
  camera: Camera,
  users: Users,
};

export function FieldIcon({ name, className }: { name: string; className?: string }) {
  const Icon = ICONS[name] ?? Briefcase;
  return <Icon className={className} />;
}
