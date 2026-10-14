import React, { useState } from 'react';
import { X, Plus, MessageSquare, ScrollText, Smartphone, Clock } from 'lucide-react';
import { TimelineEvent, ActivityType } from '../types/timeline';

interface ManualAddModalProps {
  isOpen: boolean;
  onClose: () => void;
  onAddEvent: (event: TimelineEvent) => void;
}

export const ManualAddModal: React.FC<ManualAddModalProps> = ({
  isOpen,
  onClose,
  onAddEvent,
}) => {
  const [activityType, setActivityType] = useState<ActivityType>('scroll');

  // Common fields
  const [appName, setAppName] = useState('Instagram');
  const [appColor, setAppColor] = useState('#E1306C');

  // Scroll fields
  const [sectionName, setSectionName] = useState('Reels Explore Feed');
  const [durationMinutes, setDurationMinutes] = useState(15);
  const [scrollIntensity, setScrollIntensity] = useState<'light' | 'moderate' | 'heavy' | 'doomscroll'>('moderate');

  // Text fields
  const [contact, setContact] = useState('Sarah Miller');
  const [messageText, setMessageText] = useState('Hey, see you in 10 minutes!');
  const [direction, setDirection] = useState<'outgoing' | 'incoming'>('outgoing');
  const [messagingPlatform, setMessagingPlatform] = useState<any>('iMessage');

  // App access fields
  const [previousApp, setPreviousApp] = useState('Home Screen');
  const [appDurationMinutes, setAppDurationMinutes] = useState(5);

  if (!isOpen) return null;

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    const now = new Date();

    if (activityType === 'scroll') {
      const durSec = durationMinutes * 60;
      const startTime = new Date(now.getTime() - durSec * 1000);
      onAddEvent({
        id: 'scroll-' + Date.now(),
        type: 'scroll',
        timestamp: now.toISOString(),
        appName,
        appColor,
        category: 'Social',
        sectionName,
        startTime: startTime.toISOString(),
        endTime: now.toISOString(),
        durationSeconds: durSec,
        scrollDistanceEstimatedPx: durSec * 120,
        scrollIntensity,
        itemsBrowsedEstimated: Math.round(durSec / 4),
        notes: `Manually recorded scroll session on ${appName}`,
      });
    } else if (activityType === 'text') {
      onAddEvent({
        id: 'text-' + Date.now(),
        type: 'text',
        timestamp: now.toISOString(),
        appName,
        appColor: messagingPlatform === 'WhatsApp' ? '#25D366' : '#34C759',
        category: 'Messaging',
        direction,
        contact,
        messageText,
        messagingPlatform,
        sentiment: 'casual',
      });
    } else if (activityType === 'app_access') {
      onAddEvent({
        id: 'app-' + Date.now(),
        type: 'app_access',
        timestamp: now.toISOString(),
        appName,
        appColor,
        category: 'Social',
        action: 'opened',
        previousApp,
        durationSeconds: appDurationMinutes * 60,
      });
    }

    onClose();
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/75 backdrop-blur-sm animate-in fade-in">
      <div className="bg-slate-900 border border-slate-700 rounded-3xl shadow-2xl max-w-lg w-full p-6 text-white space-y-4">
        <div className="flex items-center justify-between pb-3 border-b border-slate-800">
          <div className="flex items-center gap-2">
            <div className="p-2 rounded-xl bg-indigo-600/30 text-indigo-400">
              <Plus className="w-5 h-5" />
            </div>
            <div>
              <h3 className="font-bold text-base">Manually Log Activity</h3>
              <p className="text-xs text-slate-400">Add an activity to the phone timeline</p>
            </div>
          </div>
          <button
            onClick={onClose}
            className="p-1.5 rounded-lg text-slate-400 hover:text-white hover:bg-slate-800 transition"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Type Selector */}
        <div className="grid grid-cols-3 gap-2 text-xs">
          <button
            type="button"
            onClick={() => setActivityType('scroll')}
            className={`py-2 px-3 rounded-xl font-semibold flex items-center justify-center gap-1.5 border transition ${
              activityType === 'scroll'
                ? 'bg-purple-600 text-white border-purple-500 shadow-md'
                : 'bg-slate-950 text-slate-400 border-slate-800 hover:bg-slate-800'
            }`}
          >
            <ScrollText className="w-3.5 h-3.5" />
            <span>Scroll Session</span>
          </button>

          <button
            type="button"
            onClick={() => setActivityType('text')}
            className={`py-2 px-3 rounded-xl font-semibold flex items-center justify-center gap-1.5 border transition ${
              activityType === 'text'
                ? 'bg-emerald-600 text-white border-emerald-500 shadow-md'
                : 'bg-slate-950 text-slate-400 border-slate-800 hover:bg-slate-800'
            }`}
          >
            <MessageSquare className="w-3.5 h-3.5" />
            <span>Text Message</span>
          </button>

          <button
            type="button"
            onClick={() => setActivityType('app_access')}
            className={`py-2 px-3 rounded-xl font-semibold flex items-center justify-center gap-1.5 border transition ${
              activityType === 'app_access'
                ? 'bg-blue-600 text-white border-blue-500 shadow-md'
                : 'bg-slate-950 text-slate-400 border-slate-800 hover:bg-slate-800'
            }`}
          >
            <Smartphone className="w-3.5 h-3.5" />
            <span>App Access</span>
          </button>
        </div>

        <form onSubmit={handleSubmit} className="space-y-3.5 text-xs">
          {/* Scroll Session Form */}
          {activityType === 'scroll' && (
            <>
              <div>
                <label className="block text-slate-300 mb-1 font-medium">App Name</label>
                <select
                  value={appName}
                  onChange={(e) => {
                    setAppName(e.target.value);
                    if (e.target.value === 'Instagram') {
                      setAppColor('#E1306C');
                      setSectionName('Reels Explore Feed');
                    } else if (e.target.value === 'TikTok') {
                      setAppColor('#000000');
                      setSectionName('For You Page (FYP)');
                    } else if (e.target.value === 'Reddit') {
                      setAppColor('#FF4500');
                      setSectionName('r/technology Hot Threads');
                    } else if (e.target.value === 'Chrome') {
                      setAppColor('#4285F4');
                      setSectionName('Google Discover News');
                    }
                  }}
                  className="w-full bg-slate-950 border border-slate-700 rounded-xl px-3 py-2 text-white"
                >
                  <option value="Instagram">Instagram</option>
                  <option value="TikTok">TikTok</option>
                  <option value="Reddit">Reddit</option>
                  <option value="Chrome">Chrome</option>
                  <option value="Twitter / X">Twitter / X</option>
                  <option value="YouTube">YouTube</option>
                </select>
              </div>

              <div>
                <label className="block text-slate-300 mb-1 font-medium">App Section Scrolled</label>
                <input
                  type="text"
                  value={sectionName}
                  onChange={(e) => setSectionName(e.target.value)}
                  placeholder="e.g. Reels Explore Feed, FYP, Comments Section"
                  className="w-full bg-slate-950 border border-slate-700 rounded-xl px-3 py-2 text-white"
                  required
                />
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block text-slate-300 mb-1 font-medium">Duration (Minutes)</label>
                  <input
                    type="number"
                    min={1}
                    max={300}
                    value={durationMinutes}
                    onChange={(e) => setDurationMinutes(Number(e.target.value))}
                    className="w-full bg-slate-950 border border-slate-700 rounded-xl px-3 py-2 text-white"
                    required
                  />
                </div>

                <div>
                  <label className="block text-slate-300 mb-1 font-medium">Scroll Intensity</label>
                  <select
                    value={scrollIntensity}
                    onChange={(e) => setScrollIntensity(e.target.value as any)}
                    className="w-full bg-slate-950 border border-slate-700 rounded-xl px-3 py-2 text-white"
                  >
                    <option value="light">Light (Reading)</option>
                    <option value="moderate">Moderate (Standard)</option>
                    <option value="heavy">Heavy (Fast swiping)</option>
                    <option value="doomscroll">Doomscroll 🔥</option>
                  </select>
                </div>
              </div>
            </>
          )}

          {/* Text Message Form */}
          {activityType === 'text' && (
            <>
              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block text-slate-300 mb-1 font-medium">Direction</label>
                  <select
                    value={direction}
                    onChange={(e) => setDirection(e.target.value as any)}
                    className="w-full bg-slate-950 border border-slate-700 rounded-xl px-3 py-2 text-white"
                  >
                    <option value="outgoing">Outgoing (Sent by you)</option>
                    <option value="incoming">Incoming (Received)</option>
                  </select>
                </div>

                <div>
                  <label className="block text-slate-300 mb-1 font-medium">Platform</label>
                  <select
                    value={messagingPlatform}
                    onChange={(e) => {
                      setMessagingPlatform(e.target.value as any);
                      setAppName(e.target.value);
                    }}
                    className="w-full bg-slate-950 border border-slate-700 rounded-xl px-3 py-2 text-white"
                  >
                    <option value="iMessage">iMessage</option>
                    <option value="WhatsApp">WhatsApp</option>
                    <option value="Slack">Slack</option>
                    <option value="Telegram">Telegram</option>
                    <option value="Signal">Signal</option>
                  </select>
                </div>
              </div>

              <div>
                <label className="block text-slate-300 mb-1 font-medium">Contact / Channel</label>
                <input
                  type="text"
                  value={contact}
                  onChange={(e) => setContact(e.target.value)}
                  placeholder="e.g. Sarah, Mom, Alex Chen"
                  className="w-full bg-slate-950 border border-slate-700 rounded-xl px-3 py-2 text-white"
                  required
                />
              </div>

              <div>
                <label className="block text-slate-300 mb-1 font-medium">Message Body</label>
                <textarea
                  rows={2}
                  value={messageText}
                  onChange={(e) => setMessageText(e.target.value)}
                  placeholder="Enter message text..."
                  className="w-full bg-slate-950 border border-slate-700 rounded-xl px-3 py-2 text-white"
                  required
                />
              </div>
            </>
          )}

          {/* App Access Form */}
          {activityType === 'app_access' && (
            <>
              <div>
                <label className="block text-slate-300 mb-1 font-medium">App Opened</label>
                <input
                  type="text"
                  value={appName}
                  onChange={(e) => setAppName(e.target.value)}
                  placeholder="e.g. Spotify, YouTube, Notes"
                  className="w-full bg-slate-950 border border-slate-700 rounded-xl px-3 py-2 text-white"
                  required
                />
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block text-slate-300 mb-1 font-medium">Previous App</label>
                  <input
                    type="text"
                    value={previousApp}
                    onChange={(e) => setPreviousApp(e.target.value)}
                    placeholder="e.g. Messages, Home Screen"
                    className="w-full bg-slate-950 border border-slate-700 rounded-xl px-3 py-2 text-white"
                  />
                </div>
                <div>
                  <label className="block text-slate-300 mb-1 font-medium">Session Duration (Mins)</label>
                  <input
                    type="number"
                    min={1}
                    value={appDurationMinutes}
                    onChange={(e) => setAppDurationMinutes(Number(e.target.value))}
                    className="w-full bg-slate-950 border border-slate-700 rounded-xl px-3 py-2 text-white"
                  />
                </div>
              </div>
            </>
          )}

          <div className="pt-2 flex justify-end gap-2">
            <button
              type="button"
              onClick={onClose}
              className="px-4 py-2 rounded-xl text-slate-400 hover:text-white hover:bg-slate-800 transition"
            >
              Cancel
            </button>
            <button
              type="submit"
              className="px-5 py-2 rounded-xl bg-indigo-600 hover:bg-indigo-500 font-semibold text-white shadow-md shadow-indigo-600/30 transition"
            >
              Add to Timeline
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};
