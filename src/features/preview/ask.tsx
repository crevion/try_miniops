import { useRef, useState, type FormEvent } from "react";
import { Send, Sparkles } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Sheet, SheetContent, SheetDescription, SheetTitle } from "@/components/ui/sheet";
import { Textarea } from "@/components/ui/textarea";
import { cn } from "@/lib/utils";
import { AI_SAMPLE_ANSWERS } from "./data";

const FALLBACK =
  "In the real product this is answered from your projects, bank data and goals. Try a suggested question to see a sample.";

/** "Ask MiniOps" sidebar button and its assistant panel (sample answers for now). */
export function AskMiniOps({ compact = false }: { compact?: boolean }) {
  const [open, setOpen] = useState(false);
  const [log, setLog] = useState<{ q: string; a: string }[]>([]);
  const [input, setInput] = useState("");
  const bodyRef = useRef<HTMLDivElement>(null);
  const ask = (q: string) => {
    setLog((l) => [...l, { q, a: AI_SAMPLE_ANSWERS[q] ?? FALLBACK }]);
    requestAnimationFrame(() => bodyRef.current?.scrollTo({ top: 1e6, behavior: "smooth" }));
  };
  const submit = (e: FormEvent) => {
    e.preventDefault();
    const q = input.trim();
    if (!q) return;
    ask(q);
    setInput("");
  };
  return (
    <>
      <button
        type="button"
        onClick={() => setOpen(true)}
        aria-label="Ask MiniOps"
        title={compact ? "Ask MiniOps" : undefined}
        className={cn(
          "mb-1 flex h-[38px] items-center gap-2.5 rounded-[10px] bg-primary-soft text-sm font-semibold text-accent-foreground transition-colors hover:bg-primary-light/60",
          compact ? "mx-auto w-10 justify-center" : "w-full px-3",
        )}
      >
        <Sparkles className="size-4 shrink-0" />
        {!compact && (
          <>
            Ask MiniOps
            <span className="ml-auto text-xs font-medium opacity-80">AI</span>
          </>
        )}
      </button>
      <Sheet open={open} onOpenChange={setOpen}>
        <SheetContent side="right" className="flex w-full flex-col gap-0 p-0 sm:max-w-md">
          <div className="flex items-center gap-2 border-b px-5 py-4">
            <Sparkles className="size-[18px] text-accent-foreground" />
            <SheetTitle className="font-sans text-base font-semibold">Ask MiniOps</SheetTitle>
          </div>
          <div ref={bodyRef} className="flex-1 overflow-y-auto px-5 py-5">
            <SheetDescription className="mb-4 text-sm text-muted-foreground">
              Ask about profit, goals, clients or costs. Answers use your MiniOps data.
            </SheetDescription>
            <div className="flex flex-col items-start gap-2">
              {Object.keys(AI_SAMPLE_ANSWERS).map((q) => (
                <button
                  key={q}
                  type="button"
                  onClick={() => ask(q)}
                  className="rounded-full border px-3.5 py-1.5 text-left text-sm hover:border-primary-light hover:bg-primary-soft"
                >
                  {q}
                </button>
              ))}
            </div>
            <div className="mt-6 flex flex-col gap-4">
              {log.map((m, i) => (
                <div key={i} className="flex flex-col gap-3">
                  <div className="ml-auto max-w-[85%] rounded-2xl rounded-br-md bg-primary px-3.5 py-2.5 text-sm text-primary-foreground">
                    {m.q}
                  </div>
                  <div className="flex max-w-[92%] gap-2">
                    <Sparkles className="mt-2.5 size-4 shrink-0 text-accent-foreground" />
                    <div className="rounded-2xl rounded-bl-md bg-secondary px-3.5 py-2.5 text-sm leading-relaxed">
                      {m.a}
                    </div>
                  </div>
                </div>
              ))}
            </div>
          </div>
          <form onSubmit={submit} className="border-t p-4">
            <div className="rounded-xl border bg-card p-2 focus-within:border-primary-light">
              <Textarea
                value={input}
                onChange={(e) => setInput(e.target.value)}
                onKeyDown={(e) => {
                  if (e.key === "Enter" && !e.shiftKey) submit(e);
                }}
                placeholder="Ask a question…"
                aria-label="Question"
                className="min-h-[60px] resize-none border-0 shadow-none focus-visible:ring-0"
              />
              <div className="flex items-center gap-2 pt-1">
                <span className="text-xs text-subtle-foreground">Sample answers for now</span>
                <Button type="submit" size="sm" className="ml-auto">
                  <Send /> Ask
                </Button>
              </div>
            </div>
          </form>
        </SheetContent>
      </Sheet>
    </>
  );
}
