import { api } from "@/api/client";
import type {
  ChatMessage,
  ChatResponse,
  RecommendationResponse,
  SkillGapResponse,
  WeeklyPlanResponse,
} from "@/types";

type RecommendationPayload = {
  role?: string;
  skills?: string[];
  goals?: string[];
};

export async function getRecommendations(payload: RecommendationPayload) {
  const { data } = await api.post<RecommendationResponse>("/recommend-learning", payload);
  return data;
}

export async function getSkillGapAnalysis(payload: RecommendationPayload) {
  const { data } = await api.post<SkillGapResponse>("/skill-gap-analysis", payload);
  return data;
}

export async function getWeeklyPlan(payload: RecommendationPayload & { available_hours: number }) {
  const { data } = await api.post<WeeklyPlanResponse>("/generate-weekly-plan", payload);
  return data;
}

export async function sendChat(messages: ChatMessage[]) {
  const { data } = await api.post<ChatResponse>("/chat", { messages, use_rag: true });
  return data;
}
