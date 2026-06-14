"use client";

import { cn } from "@/lib/utils";
import { Search, ChevronRight, ChevronDown, Settings, HelpCircle, Bell, Moon, Sun, Download, Menu, X, Sparkles, Loader2 } from "lucide-react";
import { useTheme } from "next-themes";
import { useState, useEffect, useRef } from "react";
import { MOCK_DATA } from "@/data/mockData";
import { useSidebarStore } from "@/store/sidebarStore";

function exportCSV() {
  const rows = [
    ["Title", "Platform", "Type", "Date", "Likes", "Comments", "Shares", "Saves", "Reach", "Eng%"],
    ...MOCK_DATA.contentPosts.map((p) => [
      p.title, p.platform, p.type, p.date,
      p.likes, p.comments,
      p.shares === -1 ? "N/A" : p.shares,
      p.saves === -1  ? "N/A" : p.saves,
      p.reach, `${p.engagementRate}%`,
    ]),
  ];
  const csv = rows.map((r) => r.map(String).map((v) => `"${v.replace(/"/g, '""')}"`).join(",")).join("\n");
  const blob = new Blob([csv], { type: "text/csv" });
  const url = URL.createObjectURL(blob);
  const a = document.createElement("a");
  a.href = url;
  a.download = "rarefitness-smm-march2026.csv";
  a.click();
  URL.revokeObjectURL(url);
}

const EXAMPLE_QUERIES = [
  "Which platform has the best engagement?",
  "Why is YouTube underperforming?",
  "When should we post content?",
  "What's our best content type?",
];

export function Header() {
  const { theme, setTheme } = useTheme();
  const toggleMobile = useSidebarStore((s) => s.toggleMobile);
  const [mounted, setMounted] = useState(false);

  // NLQ state
  const [query, setQuery]     = useState("");
  const [nlqOpen, setNlqOpen] = useState(false);
  const [answer, setAnswer]   = useState("");
  const [loading, setLoading] = useState(false);
  const [asked, setAsked]     = useState(false);
  const containerRef          = useRef<HTMLDivElement>(null);
  const inputRef              = useRef<HTMLInputElement>(null);

  useEffect(() => setMounted(true), []);

  // Close on outside click
  useEffect(() => {
    if (!nlqOpen) return;
    const handler = (e: MouseEvent) => {
      if (containerRef.current && !containerRef.current.contains(e.target as Node)) {
        setNlqOpen(false);
      }
    };
    document.addEventListener("mousedown", handler);
    return () => document.removeEventListener("mousedown", handler);
  }, [nlqOpen]);

  const handleQuery = async (q = query) => {
    const trimmed = q.trim();
    if (!trimmed || loading) return;
    setQuery(trimmed);
    setNlqOpen(true);
    setAsked(true);
    setLoading(true);
    setAnswer("");

    try {
      const res = await fetch("/api/ai/query", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ question: trimmed }),
      });

      if (!res.body) throw new Error("No stream");
      const reader = res.body.getReader();
      const decoder = new TextDecoder();

      while (true) {
        const { done, value } = await reader.read();
        if (done) break;
        for (const line of decoder.decode(value, { stream: true }).split("\n")) {
          if (!line.startsWith("data: ")) continue;
          const payload = line.slice(6);
          if (payload === "[DONE]") break;
          try {
            const parsed = JSON.parse(payload);
            if (parsed.text) setAnswer((p) => p + parsed.text);
            if (parsed.error) setAnswer(`Unable to answer: ${parsed.error}`);
          } catch { /* partial chunk */ }
        }
      }
    } catch {
      setAnswer("Unable to reach AI. Check your GROQ_API_KEY.");
    } finally {
      setLoading(false);
    }
  };

  const clearNlq = () => {
    setQuery("");
    setAnswer("");
    setAsked(false);
    setNlqOpen(false);
  };

  return (
    <header className="flex items-center gap-2 sm:gap-3 px-3 sm:px-6 h-14 border-b border-border bg-background sticky top-0 z-30 shrink-0">
      {/* Mobile hamburger */}
      <button
        onClick={toggleMobile}
        className="lg:hidden h-8 w-8 flex items-center justify-center rounded-lg text-foreground hover:bg-muted transition-colors shrink-0"
        title="Open menu"
      >
        <Menu className="w-5 h-5" />
      </button>

      {/* Breadcrumb */}
      <div className="flex items-center gap-1.5 text-[13px] min-w-0">
        <span className="text-muted-foreground hidden sm:inline">Brand</span>
        <ChevronRight className="w-3.5 h-3.5 text-muted-foreground/40 hidden sm:inline" />
        <span className="text-muted-foreground hidden md:inline">Marketing</span>
        <ChevronRight className="w-3.5 h-3.5 text-muted-foreground/40 hidden md:inline" />
        <span className="text-foreground font-medium truncate">Social Media</span>
      </div>

      <div className="flex-1" />

      {/* NLQ Search bar — desktop only */}
      <div ref={containerRef} className="relative hidden lg:flex items-center">
        <Search className="w-3.5 h-3.5 absolute left-2.5 text-muted-foreground pointer-events-none z-10" />
        <input
          ref={inputRef}
          value={query}
          onChange={(e) => setQuery(e.target.value)}
          onFocus={() => setNlqOpen(true)}
          onKeyDown={(e) => {
            if (e.key === "Enter") handleQuery();
            if (e.key === "Escape") { setNlqOpen(false); inputRef.current?.blur(); }
          }}
          className={cn(
            "h-8 pl-8 pr-7 text-[13px] rounded-lg border bg-background text-foreground placeholder:text-muted-foreground focus:outline-none transition-all duration-200",
            nlqOpen
              ? "w-72 border-indigo-300 dark:border-indigo-500/50 ring-1 ring-indigo-200/60 dark:ring-indigo-500/30"
              : "w-52 border-border"
          )}
          placeholder="Ask AI anything…"
        />
        {query ? (
          <button onClick={clearNlq} className="absolute right-2 text-muted-foreground hover:text-foreground transition-colors">
            <X className="w-3.5 h-3.5" />
          </button>
        ) : (
          <Sparkles className="w-3 h-3 absolute right-2.5 text-indigo-400 pointer-events-none" />
        )}

        {/* Popup */}
        {nlqOpen && (
          <div className="absolute top-full right-0 mt-2 w-80 rounded-xl border border-border bg-popover shadow-2xl overflow-hidden z-50 animate-in fade-in slide-in-from-top-2 duration-150">
            <div className="flex items-center justify-between px-3 py-2 border-b border-border bg-indigo-50 dark:bg-indigo-500/10">
              <div className="flex items-center gap-1.5">
                <div className="w-5 h-5 rounded-md bg-indigo-500 flex items-center justify-center">
                  <Sparkles className="w-3 h-3 text-white" />
                </div>
                <span className="text-[11px] font-bold text-foreground">Dashboard AI</span>
                {loading && <Loader2 className="w-3 h-3 text-indigo-500 animate-spin ml-1" />}
              </div>
              <span className="text-[9px] text-muted-foreground/60">March 2026 data</span>
            </div>

            <div className="p-3">
              {!asked && (
                <div>
                  <p className="text-[10px] text-muted-foreground mb-2 font-medium uppercase tracking-wider">Try asking</p>
                  <div className="flex flex-col gap-0.5">
                    {EXAMPLE_QUERIES.map((eq) => (
                      <button
                        key={eq}
                        onClick={() => { setQuery(eq); handleQuery(eq); }}
                        className="text-left text-[12px] text-foreground/80 hover:text-foreground hover:bg-muted px-2 py-1.5 rounded-md transition-colors"
                      >
                        {eq}
                      </button>
                    ))}
                  </div>
                </div>
              )}

              {asked && loading && !answer && (
                <div className="flex items-center gap-2 py-2 text-[12px] text-muted-foreground">
                  <Loader2 className="w-3.5 h-3.5 animate-spin shrink-0" />
                  Thinking…
                </div>
              )}

              {answer && (
                <div>
                  <p className="text-[10px] text-indigo-600 dark:text-indigo-400 font-bold uppercase tracking-wider mb-1.5 line-clamp-1">
                    {query}
                  </p>
                  <p className="text-[12px] text-foreground/90 leading-relaxed">{answer}</p>
                  {!loading && (
                    <button
                      onClick={() => { setAsked(false); setAnswer(""); setQuery(""); inputRef.current?.focus(); }}
                      className="mt-2 text-[10px] text-muted-foreground hover:text-foreground transition-colors"
                    >
                      Ask another question →
                    </button>
                  )}
                </div>
              )}
            </div>

            <div className="px-3 py-1.5 border-t border-border bg-muted/40">
              <p className="text-[9px] text-muted-foreground/60">Powered by Llama 3.3 70B · Press Enter to send</p>
            </div>
          </div>
        )}
      </div>

      {/* Brand dropdown */}
      <button className="hidden md:flex items-center gap-2 h-8 px-3 rounded-lg bg-foreground text-background text-[12.5px] font-medium shrink-0">
        <Settings className="w-3.5 h-3.5" />
        <span className="hidden lg:inline">Brand - BD Master</span>
        <span className="lg:hidden">Brand</span>
        <ChevronDown className="w-3.5 h-3.5 opacity-60" />
      </button>

      {/* Export CSV */}
      <button
        onClick={exportCSV}
        title="Export content data as CSV"
        className={cn(
          "h-8 px-2.5 flex items-center gap-1.5 rounded-lg text-[11px] font-medium transition-colors shrink-0",
          "text-muted-foreground border border-border hover:bg-muted hover:text-foreground"
        )}
      >
        <Download className="w-3.5 h-3.5" />
        <span className="hidden sm:inline">Export</span>
      </button>

      <button className="hidden sm:flex h-8 w-8 items-center justify-center rounded-lg text-muted-foreground hover:bg-muted transition-colors shrink-0">
        <HelpCircle className="w-4 h-4" />
      </button>

      <button
        onClick={() => setTheme(theme === "dark" ? "light" : "dark")}
        className="h-8 w-8 flex items-center justify-center rounded-lg text-muted-foreground hover:bg-muted transition-colors shrink-0"
      >
        {mounted && theme === "dark" ? <Sun className="w-4 h-4" /> : <Moon className="w-4 h-4" />}
      </button>

      <button className="hidden sm:flex h-8 w-8 items-center justify-center rounded-lg text-muted-foreground hover:bg-muted transition-colors relative shrink-0">
        <Bell className="w-4 h-4" />
        <span className="absolute top-1.5 right-1.5 w-1.5 h-1.5 bg-red-500 rounded-full" />
      </button>

      <div className="h-8 w-8 rounded-full bg-indigo-500 flex items-center justify-center text-white text-xs font-bold shrink-0">G</div>
    </header>
  );
}
