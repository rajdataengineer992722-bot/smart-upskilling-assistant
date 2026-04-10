import { api } from "@/api/client";

type AuthPayload = {
  name?: string;
  email: string;
  password: string;
  role?: string;
  skills?: string[];
  goals?: string[];
};

export async function signup(payload: AuthPayload) {
  const { data } = await api.post("/signup", payload);
  return data;
}

export async function login(payload: AuthPayload) {
  const { data } = await api.post("/login", payload);
  return data;
}
