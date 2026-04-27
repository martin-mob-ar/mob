export type ChipColor = 'green' | 'red' | 'blue' | 'purple' | 'amber' | 'gray';

export interface StatChip {
  label: string;
  color: ChipColor;
}

const colorClasses: Record<ChipColor, string> = {
  green:  'bg-green-950 text-green-400',
  red:    'bg-red-950 text-red-300',
  blue:   'bg-sky-950 text-sky-300',
  purple: 'bg-purple-950 text-purple-300',
  amber:  'bg-amber-950 text-amber-300',
  gray:   'bg-muted text-muted-foreground border',
};

interface CronStatChipsProps {
  chips: StatChip[];
}

export function CronStatChips({ chips }: CronStatChipsProps) {
  if (chips.length === 0) return null;
  return (
    <div className="mb-3 flex flex-wrap gap-1.5">
      {chips.map((chip, i) => (
        <span
          key={i}
          className={`rounded-full px-2 py-0.5 text-[11px] font-medium ${colorClasses[chip.color]}`}
        >
          {chip.label}
        </span>
      ))}
    </div>
  );
}
