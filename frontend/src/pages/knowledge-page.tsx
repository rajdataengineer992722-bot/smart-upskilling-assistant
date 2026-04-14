import { useMemo, useState } from "react";
import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { BookMarked, DatabaseZap, Search } from "lucide-react";
import { createKnowledgeDocument, getKnowledgeDocuments, searchKnowledge } from "@/api/knowledge";
import { getProfile } from "@/api/user";
import { SourceList } from "@/components/source-list";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";

export function KnowledgePage() {
  const queryClient = useQueryClient();
  const profileQuery = useQuery({
    queryKey: ["profile"],
    queryFn: getProfile,
  });
  const documentsQuery = useQuery({
    queryKey: ["knowledge-documents"],
    queryFn: getKnowledgeDocuments,
  });

  const [form, setForm] = useState({
    title: "Backend Engineering Learning Path",
    source: "Internal L&D Playbook",
    tags: "system design, apis, testing",
    roles: "Software Engineer, Backend Engineer",
    content:
      "Backend engineers should build depth in API design, testing strategies, observability, and system design. Weekly practice should blend reading architecture notes, implementing one small endpoint, reviewing logs, and writing one realistic integration test. A strong plan includes one concept review, one practical build, one retrospective, and one peer feedback loop each week.",
  });
  const [searchTerm, setSearchTerm] = useState("What should a software engineer learn next for system design?");

  const createMutation = useMutation({
    mutationFn: createKnowledgeDocument,
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["knowledge-documents"] });
    },
  });

  const searchQuery = useQuery({
    queryKey: ["knowledge-search", searchTerm, profileQuery.data?.role],
    queryFn: () =>
      searchKnowledge({
        query: searchTerm,
        role: profileQuery.data?.role,
        tags: profileQuery.data?.goals,
        top_k: 5,
      }),
    enabled: searchTerm.trim().length > 2 && Boolean(profileQuery.data),
  });

  const knowledgeStats = useMemo(() => {
    const documents = documentsQuery.data ?? [];
    return {
      documents: documents.length,
      chunks: documents.reduce((sum, document) => sum + document.chunk_count, 0),
    };
  }, [documentsQuery.data]);

  return (
    <div className="space-y-6">
      <section className="glass-panel rounded-[32px] p-6 md:p-8">
        <p className="text-sm font-semibold uppercase tracking-[0.2em] text-emerald-700">Knowledge Base</p>
        <h1 className="mt-3 text-4xl font-semibold">Power the assistant with your own learning content</h1>
        <p className="mt-4 max-w-3xl text-base text-muted-foreground">
          Add role guides, course notes, competency matrices, and internal playbooks. The assistant will retrieve the most relevant chunks before generating recommendations, plans, and chat replies.
        </p>
      </section>

      <section className="grid gap-6 lg:grid-cols-[0.95fr_1.05fr]">
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <DatabaseZap className="h-5 w-5 text-primary" />
              Add a knowledge document
            </CardTitle>
            <CardDescription>Paste trusted content for the retrieval layer to search and ground responses.</CardDescription>
          </CardHeader>
          <CardContent className="space-y-4">
            <Input value={form.title} onChange={(event) => setForm((current) => ({ ...current, title: event.target.value }))} placeholder="Document title" />
            <Input value={form.source} onChange={(event) => setForm((current) => ({ ...current, source: event.target.value }))} placeholder="Document source" />
            <Input value={form.tags} onChange={(event) => setForm((current) => ({ ...current, tags: event.target.value }))} placeholder="Tags, comma separated" />
            <Input value={form.roles} onChange={(event) => setForm((current) => ({ ...current, roles: event.target.value }))} placeholder="Roles, comma separated" />
            <Textarea value={form.content} onChange={(event) => setForm((current) => ({ ...current, content: event.target.value }))} placeholder="Paste learning content here" />
            <Button
              className="rounded-2xl"
              onClick={() =>
                createMutation.mutate({
                  title: form.title,
                  source: form.source,
                  content: form.content,
                  tags: form.tags.split(",").map((item) => item.trim()).filter(Boolean),
                  roles: form.roles.split(",").map((item) => item.trim()).filter(Boolean),
                })
              }
              disabled={createMutation.isPending}
            >
              Add to knowledge base
            </Button>
          </CardContent>
        </Card>

        <div className="grid gap-6">
          <Card>
            <CardHeader>
              <CardTitle>Index health</CardTitle>
              <CardDescription>Quick visibility into what the assistant can retrieve.</CardDescription>
            </CardHeader>
            <CardContent className="grid gap-4 sm:grid-cols-2">
              <div className="rounded-3xl bg-slate-50 p-5">
                <p className="text-sm text-muted-foreground">Documents</p>
                <p className="mt-2 text-3xl font-semibold">{knowledgeStats.documents}</p>
              </div>
              <div className="rounded-3xl bg-slate-50 p-5">
                <p className="text-sm text-muted-foreground">Chunks</p>
                <p className="mt-2 text-3xl font-semibold">{knowledgeStats.chunks}</p>
              </div>
            </CardContent>
          </Card>

          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Search className="h-5 w-5 text-primary" />
                Retrieval preview
              </CardTitle>
              <CardDescription>See what the RAG layer would fetch for a representative query.</CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              <Input value={searchTerm} onChange={(event) => setSearchTerm(event.target.value)} placeholder="Search the knowledge base" />
              <SourceList sources={searchQuery.data?.sources ?? []} title="Retrieved chunks" />
            </CardContent>
          </Card>
        </div>
      </section>

      <section>
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <BookMarked className="h-5 w-5 text-primary" />
              Knowledge documents
            </CardTitle>
          </CardHeader>
          <CardContent className="grid gap-4 md:grid-cols-2 xl:grid-cols-3">
            {documentsQuery.data?.map((document) => (
              <div key={document.id} className="rounded-[28px] bg-slate-50 p-5">
                <p className="font-semibold text-slate-800">{document.title}</p>
                <p className="mt-1 text-sm text-muted-foreground">{document.source}</p>
                <p className="mt-4 text-sm text-slate-600">{document.chunk_count} chunks indexed</p>
                <p className="mt-2 text-xs uppercase tracking-[0.14em] text-primary">
                  {(document.roles.length ? document.roles : ["General"]).join(" • ")}
                </p>
              </div>
            ))}
          </CardContent>
        </Card>
      </section>
    </div>
  );
}
