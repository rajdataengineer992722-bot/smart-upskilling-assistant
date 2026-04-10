import { useState } from "react";
import { useMutation } from "@tanstack/react-query";
import { Bot, SendHorizonal, Sparkles } from "lucide-react";
import { sendChat } from "@/api/assistant";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import type { ChatMessage } from "@/types";

const starterMessages: ChatMessage[] = [
  {
    role: "assistant",
    content: "I’m here to turn your goals into a practical upskilling plan. Ask what to learn next, request practice tasks, or get a weekly sprint.",
  },
];

export function ChatPanel() {
  const [messages, setMessages] = useState<ChatMessage[]>(starterMessages);
  const [draft, setDraft] = useState("");
  const [suggestions, setSuggestions] = useState<string[]>([
    "What should I learn next?",
    "Give me practice tasks",
    "Quiz me on system design",
  ]);

  const mutation = useMutation({
    mutationFn: sendChat,
    onSuccess: (response, outboundMessages) => {
      setMessages([...outboundMessages, { role: "assistant", content: response.message }]);
      setSuggestions(response.suggestions);
      setDraft("");
    },
  });

  const submitMessage = async (content: string) => {
    if (!content.trim()) return;
    const nextMessages = [...messages, { role: "user" as const, content }];
    setMessages(nextMessages);
    await mutation.mutateAsync(nextMessages);
  };

  return (
    <Card className="flex h-full flex-col animate-enter">
      <CardHeader>
        <CardTitle className="flex items-center gap-2">
          <Bot className="h-5 w-5 text-primary" />
          AI Chat Assistant
        </CardTitle>
        <CardDescription>Context-aware coaching for your next best learning move.</CardDescription>
      </CardHeader>
      <CardContent className="flex flex-1 flex-col gap-4">
        <div className="flex-1 space-y-3 overflow-y-auto rounded-[28px] bg-slate-50 p-4">
          {messages.map((message, index) => (
            <div
              key={`${message.role}-${index}`}
              className={`max-w-[90%] rounded-[24px] px-4 py-3 text-sm ${
                message.role === "assistant"
                  ? "bg-white text-slate-700 shadow-sm"
                  : "ml-auto bg-slate-950 text-white"
              }`}
            >
              {message.content}
            </div>
          ))}
          {mutation.isPending ? (
            <div className="inline-flex items-center gap-2 rounded-[24px] bg-white px-4 py-3 text-sm text-slate-500">
              <Sparkles className="h-4 w-4 animate-pulse text-primary" />
              Thinking through your next best step...
            </div>
          ) : null}
        </div>

        <div className="flex flex-wrap gap-2">
          {suggestions.map((suggestion) => (
            <button
              key={suggestion}
              type="button"
              onClick={() => void submitMessage(suggestion)}
              className="rounded-full bg-secondary px-3 py-1.5 text-xs font-semibold text-secondary-foreground"
            >
              {suggestion}
            </button>
          ))}
        </div>

        <div className="flex gap-3">
          <Input
            placeholder="Ask for a learning recommendation or practice task..."
            value={draft}
            onChange={(event) => setDraft(event.target.value)}
            onKeyDown={(event) => {
              if (event.key === "Enter") {
                event.preventDefault();
                void submitMessage(draft);
              }
            }}
          />
          <Button type="button" className="h-12 px-4" onClick={() => void submitMessage(draft)}>
            <SendHorizonal className="h-4 w-4" />
          </Button>
        </div>
      </CardContent>
    </Card>
  );
}
