import React, { useState, useMemo } from 'react';
import { 
  MessageSquare, 
  ArrowUpRight, 
  ArrowDownLeft, 
  Search, 
  User, 
  Calendar, 
  Clock, 
  Sparkles,
  Send,
  MessageCircle
} from 'lucide-react';
import { TimelineEvent, TextEvent } from '../types/timeline';

interface TextsViewProps {
  events: TimelineEvent[];
  onSelectEventForImage: (event: TimelineEvent) => void;
  onOpenSimulator: () => void;
}

export const TextsView: React.FC<TextsViewProps> = ({
  events,
  onSelectEventForImage,
  onOpenSimulator,
}) => {
  const [selectedContact, setSelectedContact] = useState<string>('all');
  const [directionFilter, setDirectionFilter] = useState<'all' | 'incoming' | 'outgoing'>('all');
  const [searchQuery, setSearchQuery] = useState('');

  const textEvents = useMemo(() => {
    return (events.filter((e) => e.type === 'text') as TextEvent[]).sort(
      (a, b) => new Date(b.timestamp).getTime() - new Date(a.timestamp).getTime()
    );
  }, [events]);

  const uniqueContacts = useMemo(() => {
    const map = new Map<string, number>();
    textEvents.forEach((t) => {
      map.set(t.contact, (map.get(t.contact) || 0) + 1);
    });
    return Array.from(map.entries()).sort((a, b) => b[1] - a[1]);
  }, [textEvents]);

  const filteredTexts = useMemo(() => {
    return textEvents.filter((t) => {
      if (selectedContact !== 'all' && t.contact !== selectedContact) return false;
      if (directionFilter !== 'all' && t.direction !== directionFilter) return false;
      if (searchQuery.trim()) {
        const q = searchQuery.toLowerCase();
        return (
          t.contact.toLowerCase().includes(q) ||
          t.messageText.toLowerCase().includes(q) ||
          t.messagingPlatform.toLowerCase().includes(q)
        );
      }
      return true;
    });
  }, [textEvents, selectedContact, directionFilter, searchQuery]);

  const sentCount = textEvents.filter((t) => t.direction === 'outgoing').length;
  const receivedCount = textEvents.filter((t) => t.direction === 'incoming').length;

  const formatTime = (isoString: string) => {
    try {
      const d = new Date(isoString);
      return d.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' });
    } catch {
      return isoString;
    }
  };

  const formatDate = (isoString: string) => {
    try {
      const d = new Date(isoString);
      return d.toLocaleDateString([], { month: 'short', day: 'numeric' });
    } catch {
      return '';
    }
  };

  return (
    <div className="space-y-6">
      {/* Intro Header */}
      <div className="bg-gradient-to-r from-emerald-950 via-slate-900 to-indigo-950 border border-emerald-900/50 rounded-2xl p-6 shadow-lg">
        <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
          <div>
            <div className="flex items-center gap-2">
              <div className="p-2 rounded-xl bg-emerald-500/20 text-emerald-400 border border-emerald-500/30">
                <MessageSquare className="w-5 h-5" />
              </div>
              <h2 className="text-xl font-bold text-white">Texts & Messages Archive</h2>
            </div>
            <p className="text-xs text-slate-300 mt-1 max-w-xl">
              Chronological ledger of every message sent and received across iMessage, WhatsApp, Slack, and other messaging apps.
            </p>
          </div>

          <button
            onClick={onOpenSimulator}
            className="flex items-center gap-2 px-4 py-2 bg-emerald-600 hover:bg-emerald-500 text-white rounded-xl text-xs font-semibold shadow-md shadow-emerald-900/30 transition"
          >
            <Send className="w-4 h-4" />
            <span>Send New Text in Simulator</span>
          </button>
        </div>

        {/* Stats Strip */}
        <div className="grid grid-cols-2 sm:grid-cols-4 gap-3 mt-6 pt-4 border-t border-emerald-900/40 text-xs">
          <div className="bg-slate-900/80 p-3 rounded-xl border border-slate-800">
            <span className="text-slate-400 block text-[11px]">Total Texts Logged</span>
            <span className="text-base font-bold text-white mt-1 block">
              {textEvents.length} messages
            </span>
          </div>

          <div className="bg-slate-900/80 p-3 rounded-xl border border-slate-800">
            <span className="text-slate-400 block text-[11px]">Sent (Outgoing)</span>
            <span className="text-base font-bold text-blue-300 mt-1 block">
              {sentCount} sent
            </span>
          </div>

          <div className="bg-slate-900/80 p-3 rounded-xl border border-slate-800">
            <span className="text-slate-400 block text-[11px]">Received (Incoming)</span>
            <span className="text-base font-bold text-emerald-300 mt-1 block">
              {receivedCount} received
            </span>
          </div>

          <div className="bg-slate-900/80 p-3 rounded-xl border border-slate-800">
            <span className="text-slate-400 block text-[11px]">Active Contacts</span>
            <span className="text-base font-bold text-indigo-300 mt-1 block">
              {uniqueContacts.length} people/threads
            </span>
          </div>
        </div>
      </div>

      {/* Filter and Search */}
      <div className="bg-slate-900 border border-slate-800 rounded-2xl p-4 shadow-sm flex flex-col md:flex-row gap-3 items-center justify-between">
        <div className="relative flex-1 w-full">
          <Search className="w-4 h-4 absolute left-3 top-1/2 -translate-y-1/2 text-slate-400" />
          <input
            type="text"
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            placeholder="Search text messages by keyword, contact or platform..."
            className="w-full bg-slate-950 border border-slate-700/70 rounded-xl pl-9 pr-4 py-2 text-xs text-white placeholder-slate-500 focus:outline-none focus:border-emerald-500"
          />
        </div>

        <div className="flex items-center gap-2 w-full md:w-auto overflow-x-auto">
          <select
            value={selectedContact}
            onChange={(e) => setSelectedContact(e.target.value)}
            className="bg-slate-950 border border-slate-700/70 rounded-xl px-3 py-2 text-xs text-slate-200 focus:outline-none focus:border-emerald-500"
          >
            <option value="all">All Contacts ({uniqueContacts.length})</option>
            {uniqueContacts.map(([contact, count]) => (
              <option key={contact} value={contact}>
                {contact} ({count})
              </option>
            ))}
          </select>

          <select
            value={directionFilter}
            onChange={(e) => setDirectionFilter(e.target.value as any)}
            className="bg-slate-950 border border-slate-700/70 rounded-xl px-3 py-2 text-xs text-slate-200 focus:outline-none focus:border-emerald-500"
          >
            <option value="all">All Directions</option>
            <option value="outgoing">Outgoing Only</option>
            <option value="incoming">Incoming Only</option>
          </select>
        </div>
      </div>

      {/* Texts List */}
      <div className="bg-slate-900 border border-slate-800 rounded-2xl p-5 shadow-sm space-y-3">
        {filteredTexts.length === 0 ? (
          <div className="text-center py-12 text-slate-400 text-xs">
            No texts found matching your filter criteria.
          </div>
        ) : (
          filteredTexts.map((t) => (
            <div
              key={t.id}
              className="bg-slate-950 p-4 rounded-xl border border-slate-800/80 hover:border-emerald-800/50 transition flex flex-col sm:flex-row items-start justify-between gap-3"
            >
              <div className="space-y-2 flex-1">
                <div className="flex items-center gap-2 flex-wrap text-xs">
                  <div className={`p-1.5 rounded-lg ${
                    t.direction === 'outgoing'
                      ? 'bg-blue-500/20 text-blue-400 border border-blue-500/30'
                      : 'bg-emerald-500/20 text-emerald-400 border border-emerald-500/30'
                  }`}>
                    {t.direction === 'outgoing' ? (
                      <ArrowUpRight className="w-3.5 h-3.5" />
                    ) : (
                      <ArrowDownLeft className="w-3.5 h-3.5" />
                    )}
                  </div>

                  <span className="font-bold text-white text-sm">
                    {t.contact}
                  </span>

                  <span className="text-[10px] bg-slate-800 text-slate-300 px-2 py-0.5 rounded font-mono border border-slate-700">
                    {t.messagingPlatform}
                  </span>

                  {t.sentiment && (
                    <span className="text-[10px] text-slate-400 capitalize bg-slate-900 px-1.5 py-0.5 rounded border border-slate-800">
                      {t.sentiment}
                    </span>
                  )}
                </div>

                <div className={`p-3 rounded-2xl text-xs max-w-xl ${
                  t.direction === 'outgoing'
                    ? 'bg-blue-950/50 border border-blue-800/40 text-blue-100'
                    : 'bg-slate-900 border border-slate-800 text-slate-200'
                }`}>
                  <p className="leading-relaxed whitespace-pre-wrap">{t.messageText}</p>
                </div>

                <div className="flex items-center gap-2 text-[11px] text-slate-500 font-mono">
                  <span>{formatDate(t.timestamp)}</span>
                  <span>•</span>
                  <span>{formatTime(t.timestamp)}</span>
                  <span>•</span>
                  <span>Direction: {t.direction}</span>
                </div>
              </div>

              <button
                onClick={() => onSelectEventForImage(t)}
                className="self-end sm:self-center flex items-center gap-1.5 text-xs text-pink-400 hover:text-pink-300 p-2 bg-slate-900 hover:bg-slate-800 rounded-xl border border-slate-800 transition"
                title="Create an AI visual snapshot memory of this text"
              >
                <Sparkles className="w-3.5 h-3.5" />
                <span className="hidden sm:inline">AI Visual Memory</span>
              </button>
            </div>
          ))
        )}
      </div>
    </div>
  );
};
