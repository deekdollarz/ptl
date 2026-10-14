import React, { useState, useRef, useEffect } from 'react';
import { 
  Sparkles, 
  Send, 
  Bot, 
  User, 
  Loader2, 
  Zap, 
  BrainCircuit, 
  Clock, 
  Flame, 
  MessageSquare,
  ScrollText,
  AlertCircle,
  RefreshCw
} from 'lucide-react';
import { TimelineEvent, PhoneStats } from '../types/timeline';

interface GeminiChatbotProps {
  events: TimelineEvent[];
  stats: PhoneStats;
}

interface ChatMessage {
  id: string;
  role: 'user' | 'model';
  text: string;
  timestamp: string;
  modelUsed?: string;
}

export const GeminiChatbot: React.FC<GeminiChatbotProps> = ({ events, stats }) => {
  // Model selector state:
  // gemini-3.1-flash-lite for fast tasks
  // gemini-3.8-flash for general tasks
  // gemini-3.1-pro-preview for complex tasks
  const [selectedModel, setSelectedModel] = useState<string>('gemini-3.8-flash');
  const [messages, setMessages] = useState<ChatMessage[]>([
    {
      id: 'welcome-msg',
      role: 'model',
      text: `Hello! I am your **Phone Timeline AI Assistant & Digital Well-being Coach**.\n\nI have full visibility into your logged phone activities: texts, app launches, scroll sessions (including duration and time ranges), and your last accessed app (**${stats.lastAppAccessed.appName}**).\n\nYou can ask me about:\n- What app you accessed last and how recently\n- Exactly how long you scrolled specific app sections\n- Summaries of incoming and outgoing texts\n- Deep behavioral analysis of doomscrolling vs productive focus\n\nHow can I help you understand your phone day?`,
      timestamp: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }),
      modelUsed: 'gemini-3.8-flash',
    },
  ]);
  const [inputPrompt, setInputPrompt] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const [errorMessage, setErrorMessage] = useState<string | null>(null);

  const messagesEndRef = useRef<HTMLDivElement | null>(null);

  // Auto-scroll to bottom of conversation thread
  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  }, [messages, isLoading]);

  // Construct summarized timeline context for Gemini grounding
  const buildTimelineContext = () => {
    const recentEvents = events.slice(0, 30).map((e) => {
      if (e.type === 'scroll') {
        const s = e as any;
        return `[SCROLL] ${s.appName} > "${s.sectionName}" | Duration: ${Math.round(s.durationSeconds / 60)} mins (${s.durationSeconds}s) | Time: ${new Date(s.startTime).toLocaleTimeString()} to ${new Date(s.endTime).toLocaleTimeString()} | Intensity: ${s.scrollIntensity}`;
      }
      if (e.type === 'text') {
        const t = e as any;
        return `[TEXT] ${t.appName} (${t.messagingPlatform}) | ${t.direction === 'outgoing' ? 'Sent to' : 'Received from'}: ${t.contact} | Time: ${new Date(t.timestamp).toLocaleTimeString()} | Message: "${t.messageText}"`;
      }
      if (e.type === 'app_access') {
        const a = e as any;
        return `[APP ACCESS] Opened ${a.appName} (Category: ${a.category}) | Previous App: ${a.previousApp || 'None'} | Time: ${new Date(a.timestamp).toLocaleTimeString()}`;
      }
      return `[SYSTEM] ${e.appName} | Time: ${new Date(e.timestamp).toLocaleTimeString()}`;
    }).join('\n');

    return `
PHONE TIMELINE CURRENT STATS:
- Last App Accessed: ${stats.lastAppAccessed.appName} (${stats.lastAppAccessed.category}), accessed ${stats.lastAppAccessed.activeMinutesAgo} minutes ago.
- Total Screen Time: ${Math.round(stats.screenTimeMinutes / 60)}h ${stats.screenTimeMinutes % 60}m.
- Total Time Scrolled: ${Math.round(stats.totalScrollMinutes / 60)}h ${stats.totalScrollMinutes % 60}m.
- Texts Logged: ${stats.textsCount} messages.
- App Switches: ${stats.appSwitchesCount} times.
- Doomscroll Ratio: ${Math.round(stats.doomscrollRatio * 100)}%.

DETAILED RECENT TIMELINE ACTIVITIES:
${recentEvents}
`;
  };

  const handleSendMessage = async (textToSend?: string) => {
    const query = (textToSend || inputPrompt).trim();
    if (!query || isLoading) return;

    setErrorMessage(null);
    const userMessage: ChatMessage = {
      id: 'msg-' + Date.now(),
      role: 'user',
      text: query,
      timestamp: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }),
    };

    const newHistory = [...messages, userMessage];
    setMessages(newHistory);
    setInputPrompt('');
    setIsLoading(true);

    try {
      const timelineContext = buildTimelineContext();

      const response = await fetch('/api/gemini/chat', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          messages: newHistory.map((m) => ({ role: m.role, text: m.text })),
          model: selectedModel,
          systemInstruction: `You are Phone Timeline AI, a specialized digital life and phone behavior coach.
Your role:
- Provide friendly, precise, and data-backed answers about the user's phone activity.
- Refer accurately to their texts, what apps they opened, what app was last accessed, and specific scroll sessions (how long they scrolled and at what time).
- When discussing scrolling, highlight doomscrolling vs mindful browsing.
- Format responses cleanly with markdown, bullet points, and bold text for readability.`,
          timelineContext,
        }),
      });

      const data = await response.json();

      if (!response.ok) {
        throw new Error(data.error || 'Server error communicating with Gemini API');
      }

      const botMessage: ChatMessage = {
        id: 'reply-' + Date.now(),
        role: 'model',
        text: data.reply || 'I reviewed your timeline, but could not produce a response.',
        timestamp: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }),
        modelUsed: data.modelUsed || selectedModel,
      };

      setMessages((prev) => [...prev, botMessage]);
    } catch (err: any) {
      console.error('Chat error:', err);
      setErrorMessage(err.message || 'Failed to receive reply from Gemini AI.');
    } finally {
      setIsLoading(false);
    }
  };

  const presetChips = [
    {
      label: 'What was my last app?',
      model: 'gemini-3.1-flash-lite',
      prompt: 'What was the last app I accessed, when did I open it, and what did I do right before that?',
    },
    {
      label: 'Which app section did I scroll longest?',
      model: 'gemini-3.8-flash',
      prompt: 'Which app section did I scroll the longest today? List each scroll session with the exact time range and duration.',
    },
    {
      label: 'Summarize all texts today',
      model: 'gemini-3.8-flash',
      prompt: 'Summarize all incoming and outgoing text messages from today, broken down by contact.',
    },
    {
      label: 'Deep behavioral audit',
      model: 'gemini-3.1-pro-preview',
      prompt: 'Perform a deep behavioral analysis of my phone timeline. Identify doomscrolling loops, app switching distractions, and advise me on actionable digital well-being improvements.',
    },
  ];

  return (
    <div className="bg-slate-900 border border-slate-800 rounded-2xl shadow-xl flex flex-col h-[750px] overflow-hidden">
      {/* Chat Header & Model Affordance */}
      <div className="p-4 border-b border-slate-800 bg-slate-950/80 flex flex-col sm:flex-row items-start sm:items-center justify-between gap-3">
        <div className="flex items-center gap-3">
          <div className="w-9 h-9 rounded-xl bg-gradient-to-tr from-indigo-500 to-purple-600 flex items-center justify-center text-white shadow-md shadow-indigo-500/20">
            <Sparkles className="w-5 h-5" />
          </div>
          <div>
            <h3 className="font-bold text-white text-sm flex items-center gap-2">
              <span>Phone Timeline AI Assistant</span>
              <span className="text-[10px] bg-indigo-500/20 text-indigo-300 px-2 py-0.5 rounded-full border border-indigo-500/30">
                Grounding Active
              </span>
            </h3>
            <p className="text-xs text-slate-400">Multi-turn chat grounded in your real phone activity</p>
          </div>
        </div>

        {/* Model Selector Affordance fulfilling requirements */}
        <div className="flex items-center gap-1.5 bg-slate-900 p-1 rounded-xl border border-slate-700/80 text-xs">
          <span className="text-[10px] text-slate-400 uppercase font-bold px-2 hidden sm:inline">
            Model:
          </span>

          <button
            onClick={() => setSelectedModel('gemini-3.1-flash-lite')}
            className={`px-2.5 py-1 rounded-lg transition flex items-center gap-1 text-xs ${
              selectedModel === 'gemini-3.1-flash-lite'
                ? 'bg-amber-600 text-white font-semibold shadow-sm'
                : 'text-slate-400 hover:text-white'
            }`}
            title="gemini-3.1-flash-lite: optimized for ultra-fast instant timeline answers"
          >
            <Zap className="w-3 h-3 text-amber-300" />
            <span>Fast (Lite)</span>
          </button>

          <button
            onClick={() => setSelectedModel('gemini-3.8-flash')}
            className={`px-2.5 py-1 rounded-lg transition flex items-center gap-1 text-xs ${
              selectedModel === 'gemini-3.8-flash'
                ? 'bg-indigo-600 text-white font-semibold shadow-sm'
                : 'text-slate-400 hover:text-white'
            }`}
            title="gemini-3.8-flash: general tasks, timeline coaching, and screen time balance"
          >
            <Bot className="w-3 h-3 text-indigo-300" />
            <span>General (3.8)</span>
          </button>

          <button
            onClick={() => setSelectedModel('gemini-3.1-pro-preview')}
            className={`px-2.5 py-1 rounded-lg transition flex items-center gap-1 text-xs ${
              selectedModel === 'gemini-3.1-pro-preview'
                ? 'bg-purple-600 text-white font-semibold shadow-sm'
                : 'text-slate-400 hover:text-white'
            }`}
            title="gemini-3.1-pro-preview: advanced reasoning for complex behavioral audits"
          >
            <BrainCircuit className="w-3 h-3 text-purple-300" />
            <span>Complex (Pro)</span>
          </button>
        </div>
      </div>

      {/* Preset Suggestions Chips */}
      <div className="bg-slate-950/40 px-4 py-2 border-b border-slate-800/60 overflow-x-auto flex items-center gap-2 scrollbar-none text-xs">
        <span className="text-[10px] text-slate-500 uppercase tracking-wider font-semibold whitespace-nowrap">
          Suggestions:
        </span>
        {presetChips.map((chip, idx) => (
          <button
            key={idx}
            onClick={() => {
              setSelectedModel(chip.model);
              handleSendMessage(chip.prompt);
            }}
            className="px-2.5 py-1 rounded-full bg-slate-800/80 hover:bg-slate-700 text-slate-300 hover:text-white border border-slate-700/60 whitespace-nowrap text-xs transition"
          >
            {chip.label}
          </button>
        ))}
      </div>

      {/* Messages Scrollable Thread */}
      <div className="flex-1 overflow-y-auto p-4 space-y-4 scrollbar-thin scrollbar-thumb-slate-700">
        {messages.map((m) => (
          <div
            key={m.id}
            className={`flex gap-3 ${m.role === 'user' ? 'justify-end' : 'justify-start'}`}
          >
            {m.role === 'model' && (
              <div className="w-8 h-8 rounded-xl bg-indigo-600/30 text-indigo-400 border border-indigo-500/40 flex items-center justify-center shrink-0 mt-1">
                <Sparkles className="w-4 h-4" />
              </div>
            )}

            <div className={`max-w-[85%] space-y-1`}>
              <div
                className={`p-4 rounded-2xl text-xs sm:text-sm leading-relaxed whitespace-pre-wrap ${
                  m.role === 'user'
                    ? 'bg-indigo-600 text-white rounded-tr-sm shadow-md'
                    : 'bg-slate-950 border border-slate-800 text-slate-200 rounded-tl-sm'
                }`}
              >
                {m.text}
              </div>

              <div
                className={`flex items-center gap-2 text-[10px] text-slate-500 px-1 ${
                  m.role === 'user' ? 'justify-end' : 'justify-start'
                }`}
              >
                <span>{m.timestamp}</span>
                {m.modelUsed && (
                  <>
                    <span>•</span>
                    <span className="font-mono text-indigo-400">{m.modelUsed}</span>
                  </>
                )}
              </div>
            </div>

            {m.role === 'user' && (
              <div className="w-8 h-8 rounded-xl bg-slate-800 text-slate-300 border border-slate-700 flex items-center justify-center shrink-0 mt-1">
                <User className="w-4 h-4" />
              </div>
            )}
          </div>
        ))}

        {isLoading && (
          <div className="flex gap-3 justify-start items-center">
            <div className="w-8 h-8 rounded-xl bg-indigo-600/30 text-indigo-400 border border-indigo-500/40 flex items-center justify-center shrink-0">
              <Loader2 className="w-4 h-4 animate-spin text-indigo-400" />
            </div>
            <div className="bg-slate-950 border border-slate-800 p-3 rounded-2xl text-xs text-slate-400 flex items-center gap-2">
              <Loader2 className="w-3.5 h-3.5 animate-spin text-indigo-400" />
              <span>Analyzing your phone timeline with <strong>{selectedModel}</strong>...</span>
            </div>
          </div>
        )}

        {errorMessage && (
          <div className="p-3 bg-rose-950/60 border border-rose-800/80 rounded-xl text-rose-200 text-xs flex items-center justify-between gap-2">
            <div className="flex items-center gap-2">
              <AlertCircle className="w-4 h-4 text-rose-400 shrink-0" />
              <span>{errorMessage}</span>
            </div>
            <button
              onClick={() => handleSendMessage()}
              className="text-xs underline text-rose-300 hover:text-white"
            >
              Retry
            </button>
          </div>
        )}

        <div ref={messagesEndRef} />
      </div>

      {/* Input Bar */}
      <div className="p-3 border-t border-slate-800 bg-slate-950/90">
        <form
          onSubmit={(e) => {
            e.preventDefault();
            handleSendMessage();
          }}
          className="flex items-center gap-2"
        >
          <input
            type="text"
            value={inputPrompt}
            onChange={(e) => setInputPrompt(e.target.value)}
            placeholder={`Ask about your phone timeline using ${selectedModel}...`}
            className="flex-1 bg-slate-900 border border-slate-700/80 rounded-xl px-4 py-2.5 text-xs sm:text-sm text-white placeholder-slate-500 focus:outline-none focus:border-indigo-500 transition"
            disabled={isLoading}
          />

          <button
            type="submit"
            disabled={!inputPrompt.trim() || isLoading}
            className="px-4 py-2.5 bg-gradient-to-r from-indigo-600 to-purple-600 hover:from-indigo-500 hover:to-purple-500 disabled:opacity-50 text-white rounded-xl text-xs sm:text-sm font-semibold shadow-md shadow-indigo-600/20 transition active:scale-95 flex items-center gap-1.5"
          >
            {isLoading ? (
              <Loader2 className="w-4 h-4 animate-spin" />
            ) : (
              <>
                <span>Send</span>
                <Send className="w-3.5 h-3.5" />
              </>
            )}
          </button>
        </form>
      </div>
    </div>
  );
};
