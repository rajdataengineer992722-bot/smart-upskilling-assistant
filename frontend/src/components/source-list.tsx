import type { KnowledgeSource } from "@/types";

type SourceListProps = {
  sources: KnowledgeSource[];
  title?: string;
};

export function SourceList({ sources, title = "Grounding sources" }: SourceListProps) {
  if (!sources.length) return null;

  return (
    <div className="space-y-3">
      <p className="text-sm font-semibold text-slate-700">{title}</p>
      {sources.map((source) => (
        <div key={`${source.document_id}-${source.title}`} className="rounded-3xl bg-slate-50 px-4 py-4 text-sm">
          <div className="flex items-center justify-between gap-3">
            <p className="font-semibold text-slate-800">{source.title}</p>
            <span className="text-xs font-medium text-muted-foreground">score {source.score.toFixed(2)}</span>
          </div>
          <p className="mt-1 text-xs uppercase tracking-[0.16em] text-primary">{source.source}</p>
          <p className="mt-3 text-slate-600">{source.snippet}</p>
        </div>
      ))}
    </div>
  );
}
