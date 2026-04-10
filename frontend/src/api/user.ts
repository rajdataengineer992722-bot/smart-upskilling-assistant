import { api } from "@/api/client";
import type { UserProfile } from "@/types";

export async function getProfile() {
  const { data } = await api.get<UserProfile>("/profile");
  return data;
}

export async function updateProfile(payload: Partial<UserProfile>) {
  const { data } = await api.post<UserProfile>("/update-profile", payload);
  return data;
}
