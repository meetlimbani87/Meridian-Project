interface DividerProps {
  label: string;
}

export default function Divider({ label }: DividerProps) {
  return (
    <div className="mx-auto flex max-w-7xl items-center gap-6 px-6 py-20 lg:px-10">
      <span className="h-px flex-1 bg-charcoal/10" />
      <span className="font-display text-xl italic text-taupe sm:text-2xl">{label}</span>
      <span className="h-px flex-1 bg-charcoal/10" />
    </div>
  );
}
