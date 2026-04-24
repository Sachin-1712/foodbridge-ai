'use client';

import { useState, useRef, useEffect } from 'react';
import { cn } from '@/lib/utils';
import {
  X,
  Send,
  Sparkles,
  Leaf,
  User,
  Loader2,
  Zap,
  MessageSquare,
  ChevronRight,
  ArrowRight,
} from 'lucide-react';

interface Message {
  role: 'user' | 'assistant';
  content: string;
}

const quickReplies = [
  { text: 'How do I start?', icon: <Zap className="w-3 h-3" /> },
  { text: 'Waste reduction tips', icon: <Leaf className="w-3 h-3" /> },
  { text: 'Matching logic', icon: <Sparkles className="w-3 h-3" /> },
];

export function ChatPanel({ onClose, userRole }: { onClose: () => void; userRole: string }) {
  const [messages, setMessages] = useState<Message[]>([
    {
      role: 'assistant',
      content: `Hello! I'm the FoodBridge AI Intelligence agent. I'm currently monitoring ${
        userRole === 'donor'
          ? 'surplus trends and donation categorization'
          : userRole === 'ngo'
          ? 'real-time marketplace matching and capacity analytics'
          : 'route optimization and delivery logistics'
      } across the platform. How can I assist your operations today?`,
    },
  ]);
  const [input, setInput] = useState('');
  const [loading, setLoading] = useState(false);
  const scrollRef = useRef<HTMLDivElement>(null);
  const inputRef = useRef<HTMLInputElement>(null);

  useEffect(() => {
    if (scrollRef.current) {
      scrollRef.current.scrollTo({ top: scrollRef.current.scrollHeight, behavior: 'smooth' });
    }
  }, [messages, loading]);

  const sendMessage = async (text: string) => {
    if (!text.trim()) return;
    const userMsg: Message = { role: 'user', content: text.trim() };
    setMessages((prev) => [...prev, userMsg]);
    setInput('');
    setLoading(true);

    try {
      const res = await fetch('/api/chat', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          messages: [...messages, userMsg].map((m) => ({
            role: m.role,
            parts: [{ text: m.content }],
          })),
        }),
      });

      if (res.ok) {
        const data = await res.json();
        setMessages((prev) => [...prev, { role: 'assistant', content: data.reply }]);
      } else {
        setMessages((prev) => [
          ...prev,
          { role: 'assistant', content: "I'm having trouble establishing a neural link. Please check your connection and try again." },
        ]);
      }
    } catch {
      setMessages((prev) => [
        ...prev,
        { role: 'assistant', content: "Systems interruption detected. Please attempt your query again shortly." },
      ]);
    } finally {
      setLoading(false);
      setTimeout(() => inputRef.current?.focus(), 100);
    }
  };

  return (
    <div className="flex flex-col h-full bg-white relative overflow-hidden">
      {/* Decorative Background */}
      <div className="absolute top-0 left-0 right-0 h-64 bg-gradient-to-b from-fb-primary/5 to-transparent pointer-events-none" />
      
      {/* ===== HEADER ===== */}
      <div className="flex items-center justify-between px-6 h-20 border-b border-fb-outline-variant/10 shrink-0 relative z-10">
        <div className="flex items-center gap-4">
          <div className="relative">
            <div className="flex items-center justify-center w-10 h-10 rounded-2xl bg-[#0f5238] shadow-lg rotate-3 group-hover:rotate-0 transition-transform">
              <Sparkles className="w-5 h-5 text-[#95d5b2]" />
            </div>
            <div className="absolute -bottom-1 -right-1 w-3.5 h-3.5 bg-emerald-500 border-2 border-white rounded-full animate-pulse" />
          </div>
          <div>
            <h2 className="font-black text-sm text-fb-on-surface tracking-tight uppercase">
              Intelligence Node
            </h2>
            <div className="flex items-center gap-1.5">
              <p className="text-[10px] font-black text-fb-primary uppercase tracking-[0.1em]">
                FoodBridge AI
              </p>
            </div>
          </div>
        </div>
        <button
          onClick={onClose}
          className="p-2.5 rounded-2xl bg-fb-surface-container hover:bg-fb-surface-container-high transition-all text-fb-on-surface-variant group active:scale-95"
          aria-label="Close panel"
        >
          <X className="w-5 h-5 group-hover:rotate-90 transition-transform" />
        </button>
      </div>

      {/* ===== MESSAGES ===== */}
      <div ref={scrollRef} className="flex-1 overflow-y-auto px-6 py-6 space-y-6 custom-scrollbar relative z-10">
        {messages.map((msg, i) => (
          <div
            key={i}
            className={cn('flex gap-4 group', msg.role === 'user' ? 'flex-row-reverse' : 'flex-row')}
          >
            {/* Avatar */}
            <div className="flex items-end shrink-0">
              <div className={cn(
                "w-8 h-8 rounded-xl flex items-center justify-center shadow-sm transition-transform group-hover:scale-110",
                msg.role === 'assistant' ? "bg-[#0f5238] text-white" : "bg-fb-surface-container-high text-fb-on-surface-variant"
              )}>
                {msg.role === 'assistant' ? <Leaf className="w-4 h-4" /> : <User className="w-4 h-4" />}
              </div>
            </div>

            {/* Bubble */}
            <div
              className={cn(
                'max-w-[85%] px-5 py-4 text-[13px] leading-relaxed relative transition-all shadow-sm',
                msg.role === 'assistant'
                  ? 'bg-fb-surface-container-lowest border border-fb-outline-variant/10 rounded-[1.5rem] rounded-bl-none text-fb-on-surface'
                  : 'bg-[#0f5238] text-white rounded-[1.5rem] rounded-br-none font-medium'
              )}
            >
              {msg.content}
            </div>
          </div>
        ))}

        {/* Typing indicator */}
        {loading && (
          <div className="flex gap-4 items-end">
            <div className="w-8 h-8 rounded-xl bg-[#0f5238] flex items-center justify-center shrink-0">
              <Leaf className="w-4 h-4 text-white" />
            </div>
            <div className="bg-fb-surface-container-lowest border border-fb-outline-variant/10 rounded-[1.5rem] rounded-bl-none px-5 py-4 shadow-sm">
              <div className="flex items-center gap-1.5">
                <div className="w-1.5 h-1.5 rounded-full bg-fb-primary animate-bounce [animation-delay:0ms]" />
                <div className="w-1.5 h-1.5 rounded-full bg-fb-primary animate-bounce [animation-delay:200ms]" />
                <div className="w-1.5 h-1.5 rounded-full bg-fb-primary animate-bounce [animation-delay:400ms]" />
              </div>
            </div>
          </div>
        )}

        {/* Quick replies */}
        {messages.length <= 1 && !loading && (
          <div className="flex flex-col gap-3 pt-4 pl-12">
            <p className="text-[10px] font-black text-fb-on-surface-variant uppercase tracking-widest opacity-60">Suggested Inquiries</p>
            <div className="flex flex-col gap-2">
              {quickReplies.map((qr) => (
                <button
                  key={qr.text}
                  onClick={() => sendMessage(qr.text)}
                  className="flex items-center justify-between w-fit px-5 py-2.5 bg-white border border-fb-outline-variant/20 rounded-2xl text-[11px] font-black text-fb-on-surface hover:border-fb-primary hover:text-fb-primary hover:bg-fb-primary/5 hover:shadow-md transition-all group"
                >
                  <div className="flex items-center gap-3">
                    <span className="opacity-60">{qr.icon}</span>
                    {qr.text}
                  </div>
                  <ChevronRight className="w-3 h-3 ml-4 opacity-0 group-hover:opacity-100 transition-opacity" />
                </button>
              ))}
            </div>
          </div>
        )}
      </div>

      {/* ===== INPUT ===== */}
      <div className="px-6 pb-8 pt-4 border-t border-fb-outline-variant/10 bg-white shrink-0 relative z-10">
        <form
          onSubmit={(e) => {
            e.preventDefault();
            sendMessage(input);
          }}
          className="relative flex items-center group"
        >
          <div className="absolute left-5 text-fb-on-surface-variant/40 group-focus-within:text-fb-primary transition-colors">
            <MessageSquare className="w-4 h-4" />
          </div>
          <input
            ref={inputRef}
            type="text"
            value={input}
            onChange={(e) => setInput(e.target.value)}
            placeholder="Type your strategic request..."
            disabled={loading}
            className="w-full bg-fb-surface-container-lowest border border-fb-outline-variant/20 rounded-2xl py-4 pl-12 pr-16 text-[13px] text-fb-on-surface placeholder:text-fb-on-surface-variant/40 focus:outline-none focus:ring-2 focus:ring-[#0f5238]/10 focus:border-fb-primary/30 transition-all disabled:opacity-60 shadow-sm"
          />
          <button
            type="submit"
            disabled={loading || !input.trim()}
            className={cn(
              'absolute right-2 w-11 h-11 rounded-xl flex items-center justify-center transition-all active:scale-95',
              input.trim()
                ? 'bg-[#0f5238] text-white shadow-lg hover:shadow-xl hover:scale-105'
                : 'bg-fb-surface-container-high text-fb-on-surface-variant/40 cursor-not-allowed'
            )}
            aria-label="Dispatch message"
          >
            {loading ? (
              <Loader2 className="w-5 h-5 animate-spin" />
            ) : (
              <ArrowRight className="w-5 h-5" />
            )}
          </button>
        </form>
        <p className="text-[9px] text-center text-fb-on-surface-variant/40 mt-4 uppercase tracking-widest font-black">
          Encrypted Session • Operational Support Node
        </p>
      </div>
    </div>
  );
}
