import { api } from "@/api/client";
import type { KnowledgeDocumentSummary, KnowledgeSource } from "@/types";

type KnowledgeDocumentPayload = {
  title: string;
  source: string;
  content: string;
  tags: string[];
  roles: string[];
};

export async function getKnowledgeDocuments() {
  const { data } = await api.get<{ documents: KnowledgeDocumentSummary[] }>("/knowledge/documents");
  return data.documents;
}

export async function createKnowledgeDocument(payload: KnowledgeDocumentPayload) {
  const { data } = await api.post<KnowledgeDocumentSummary>("/knowledge/documents", payload);
  return data;
}

export async function searchKnowledge(payload: {
  query: string;
  role?: string;
  tags?: string[];
  top_k?: number;
}) {
  const { data } = await api.post<{ query: string; sources: KnowledgeSource[] }>("/knowledge/search", payload);
  return data;
}
