// This file contains the missing helper components and completion
// Append this to the truncated file

/* Helper Components */

interface ProgressPipsProps {
  total: number;
  index: number;
  maxVisited: number;
  onJump: (index: number) => void;
}

function ProgressPips({ total, index, maxVisited, onJump }: ProgressPipsProps) {
  return (
    <div className="flex items-center justify-center gap-1.5 sm:gap-2 mb-3 sm:mb-4">
      {Array.from({ length: total }, (_, i) => (
        <button
          key={i}
          onClick={() => onJump(i)}
          disabled={i > maxVisited}
          className={[
            "h-1.5 sm:h-2 rounded-full transition-all duration-300",
            i === index
              ? "w-8 sm:w-10 bg-blue-500"
              : i <= maxVisited
              ? "w-1.5 sm:w-2 bg-blue-300 hover:bg-blue-400 cursor-pointer"
              : "w-1.5 sm:w-2 bg-zinc-700",
          ].join(" ")}
          aria-label={`Step ${i + 1} of ${total}`}
        />
      ))}
    </div>
  );
}

interface StepShellProps {
  title: string;
  children: React.ReactNode;
}

function StepShell({ title, children }: StepShellProps) {
  return (
    <div className="space-y-3 sm:space-y-4">
      <h3 className="text-lg sm:text-xl md:text-2xl font-bold text-zinc-100">
        {title}
      </h3>
      <div className="space-y-3">{children}</div>
    </div>
  );
}

interface LabeledProps {
  field: string;
  label: string;
  children: React.ReactNode;
}

function Labeled({ field, label, children }: LabeledProps) {
  return (
    <div className="space-y-1.5">
      <label htmlFor={field} className="block text-sm font-medium text-zinc-300">
        {label}
      </label>
      {children}
    </div>
  );
}

interface ChoiceGridProps {
  options: ReadonlyArray<string>;
  value?: string;
  onChange: (value: string) => void;
}

function ChoiceGrid({ options, value, onChange }: ChoiceGridProps) {
  return (
    <div className="grid grid-cols-1 sm:grid-cols-2 gap-2">
      {options.map((option) => (
        <button
          key={option}
          onClick={() => onChange(option)}
          className={[
            "px-4 py-3 rounded-lg border text-left transition-all",
            value === option
              ? "border-blue-500 bg-blue-500/20 text-blue-100"
              : "border-white/10 bg-white/5 text-zinc-300 hover:border-white/20 hover:bg-white/10",
          ].join(" ")}
        >
          {option}
        </button>
      ))}
    </div>
  );
}
