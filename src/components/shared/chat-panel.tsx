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
} from 'lucide-react';

interface Message {
  role: 'user' | 'assistant';
  content: string;
}

const quickReplies = [
  'What can you help with?',
  'Show food waste tips',
  'How does matching work?',
];

export function ChatPanel({ onClose, userRole }: { onClose: () => void; userRole: string }) {
  const [messages, setMessages] = useState<Message[]>([
    {
      role: 'assistant',
      content: `Hi! I'm the FoodBridge AI assistant. I can help you with ${
        userRole === 'donor'
          ? 'donation tips, impact tracking, and food categorisation'
          : userRole === 'ngo'
          ? 'finding donations, analytics insights, and capacity planning'
          : 'route optimisation, pickup logistics, and delivery tracking'
      }. How can I help?`,
    },
  ]);
  const [input, setInput] = useState('');
  const [loading, setLoading] = useState(false);
  const scrollRef = useRef<HTMLDivElement>(null);
  const inputRef = useRef<HTMLInputElement>(null);

  useEffect(() => {
    scrollRef.current?.scrollTo({ top: scrollRef.current.scrollHeight, behavior: 'smooth' });
  }, [messages]);

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
          { role: 'assistant', content: "I'm having trouble connecting right now. Please try again." },
        ]);
      }
    } catch {
      setMessages((prev) => [
        ...prev,
        { role: 'assistant', content: "Something went wrong. Please try again." },
      ]);
    } finally {
      setLoading(false);
      inputRef.current?.focus();
    }
  };

  return (
    <div className="flex flex-col h-full">
      {/* ===== HEADER ===== */}
      <div className="flex items-center justify-between px-5 h-16 border-b border-fb-outline-variant/20 bg-fb-surface-container-lowest shrink-0">
        <div className="flex items-center gap-3">
          <div className="flex items-center justify-center w-9 h-9 rounded-full bg-[#2D6A4F]">
            <Sparkles className="w-4 h-4 text-white" />
          </div>
          <div>
            <h2 className="font-[family-name:var(--font-heading)] text-sm font-bold text-fb-on-surface">
              FoodBridge AI
            </h2>
            <p className="text-[11px] text-fb-outline flex items-center gap-1">
              <span className="w-1.5 h-1.5 rounded-full bg-emerald-400 animate-pulse" />
              Online
            </p>
          </div>
        </div>
        <button
          onClick={onClose}
          className="p-2 rounded-lg hover:bg-fb-surface-container transition-colors text-fb-on-surface-variant"
          aria-label="Close chat"
        >
          <X className="w-5 h-5" />
        </button>
      </div>

      {/* ===== MESSAGES ===== */}
      <div ref={scrollRef} className="flex-1 overflow-y-auto px-4 py-5 space-y-4">
        {messages.map((msg, i) => (
          <div
            key={i}
            className={cn('flex gap-2.5', msg.role === 'user' ? 'justify-end' : 'justify-start')}
          >
            {/* Bot avatar */}
            {msg.role === 'assistant' && (
              <div className="flex items-end shrink-0">
                <div className="w-7 h-7 rounded-full bg-[#2D6A4F] flex items-center justify-center">
                  <Leaf className="w-3.5 h-3.5 text-white" />
                </div>
              </div>
            )}

            {/* Bubble */}
            <div
              className={cn(
                'max-w-[80%] px-4 py-3 text-sm leading-relaxed whitespace-pre-wrap',
                msg.role === 'assistant'
                  ? 'bg-fb-surface-container-low border border-fb-surface-container rounded-2xl rounded-bl-sm text-fb-on-surface'
                  : 'bg-[#2D6A4F] text-white rounded-2xl rounded-br-sm'
              )}
            >
              {msg.content}
            </div>

            {/* User avatar */}
            {msg.role === 'user' && (
              <div className="flex items-end shrink-0">
                <div className="w-7 h-7 rounded-full bg-fb-surface-container-high flex items-center justify-center">
                  <User className="w-3.5 h-3.5 text-fb-on-surface-variant" />
                </div>
              </div>
            )}
          </div>
        ))}

        {/* Typing indicator */}
        {loading && (
          <div className="flex gap-2.5 items-end">
            <div className="w-7 h-7 rounded-full bg-[#2D6A4F] flex items-center justify-center shrink-0">
              <Leaf className="w-3.5 h-3.5 text-white" />
            </div>
            <div className="bg-fb-surface-container-low border border-fb-surface-container rounded-2xl rounded-bl-sm px-4 py-3">
              <div className="flex items-center gap-1">
                <div className="w-2 h-2 rounded-full bg-fb-outline animate-bounce [animation-delay:0ms]" />
                <div className="w-2 h-2 rounded-full bg-fb-outline animate-bounce [animation-delay:150ms]" />
                <div className="w-2 h-2 rounded-full bg-fb-outline animate-bounce [animation-delay:300ms]" />
              </div>
            </div>
          </div>
        )}

        {/* Quick replies (only when few messages) */}
        {messages.length <= 1 && !loading && (
          <div className="flex flex-wrap gap-2 pt-2">
            {quickReplies.map((qr) => (
              <button
                key={qr}
                onClick={() => sendMessage(qr)}
                className="px-4 py-2 text-sm rounded-full border border-fb-outline-variant text-fb-on-surface-variant hover:bg-fb-surface-container-low hover:text-fb-on-surface transition-colors"
              >
                {qr}
              </button>
            ))}
          </div>
        )}
      </div>

      {/* ===== INPUT ===== */}
      <div className="px-4 pb-4 pt-2 border-t border-fb-outline-variant/20 bg-fb-surface-container-lowest shrink-0">
        <form
          onSubmit={(e) => {
            e.preventDefault();
            sendMessage(input);
          }}
          className="relative flex items-center"
        >
          <input
            ref={inputRef}
            type="text"
            value={input}
            onChange={(e) => setInput(e.target.value)}
            placeholder="Ask FoodBridge AI…"
            disabled={loading}
            className="w-full bg-fb-surface-container rounded-full py-3.5 pl-5 pr-14 text-sm text-fb-on-surface placeholder:text-fb-outline focus:outline-none focus:ring-2 focus:ring-[#2D6A4F]/30 transition-all disabled:opacity-60"
          />
          <button
            type="submit"
            disabled={loading || !input.trim()}
            className={cn(
              'absolute right-2 w-10 h-10 rounded-full flex items-center justify-center transition-all',
              input.trim()
                ? 'bg-[#2D6A4F] text-white shadow-fab hover:scale-105'
                : 'bg-fb-surface-container-high text-fb-outline'
            )}
            aria-label="Send message"
          >
            {loading ? (
              <Loader2 className="w-4 h-4 animate-spin" />
            ) : (
              <Send className="w-4 h-4" />
            )}
          </button>
        </form>
      </div>
    </div>
  );
}
