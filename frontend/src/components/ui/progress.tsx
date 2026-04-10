type ProgressProps = {
  value: number;
};

export function Progress({ value }: ProgressProps) {
  return (
    <div className="h-3 w-full overflow-hidden rounded-full bg-slate-200">
      <div
        className="h-full rounded-full bg-gradient-to-r from-primary via-sky-400 to-emerald-400 transition-all"
        style={{ width: `${value}%` }}
      />
    </div>
  );
}
