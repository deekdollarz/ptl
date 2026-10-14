export type ActivityType = 'text' | 'app_access' | 'scroll' | 'system';

export interface BaseEvent {
  id: string;
  timestamp: string; // ISO string
  appName: string;
  appIcon?: string;
  appColor?: string;
  category: 'Social' | 'Messaging' | 'Entertainment' | 'Productivity' | 'System' | 'Browser' | 'Gaming';
}

export interface TextEvent extends BaseEvent {
  type: 'text';
  direction: 'incoming' | 'outgoing';
  contact: string;
  contactAvatar?: string;
  messageText: string;
  messagingPlatform: 'iMessage' | 'WhatsApp' | 'Telegram' | 'Slack' | 'Signal' | 'Instagram DM';
  sentiment?: 'neutral' | 'positive' | 'urgent' | 'casual';
}

export interface ScrollEvent extends BaseEvent {
  type: 'scroll';
  sectionName: string; // e.g., "Reels / Explore Feed", "FYP Main Feed", "r/technology Feed"
  startTime: string; // ISO string or time e.g. "14:20:10"
  endTime: string; // ISO string or time e.g. "14:32:45"
  durationSeconds: number; // e.g. 755
  scrollDistanceEstimatedPx: number; // e.g. 14200
  scrollIntensity: 'light' | 'moderate' | 'heavy' | 'doomscroll';
  itemsBrowsedEstimated: number; // e.g. 84
  notes?: string;
}

export interface AppAccessEvent extends BaseEvent {
  type: 'app_access';
  action: 'opened' | 'closed' | 'switched_from' | 'backgrounded';
  previousApp?: string;
  durationSeconds?: number; // how long it was active
  subScreen?: string;
}

export interface SystemEvent extends BaseEvent {
  type: 'system';
  action: 'phone_unlocked' | 'phone_locked' | 'screen_on' | 'screen_off' | 'dnd_toggled' | 'battery_low';
  details?: string;
}

export type TimelineEvent = TextEvent | ScrollEvent | AppAccessEvent | SystemEvent;

export interface PhoneStats {
  screenTimeMinutes: number;
  totalScrollMinutes: number;
  textsCount: number;
  appSwitchesCount: number;
  doomscrollRatio: number;
  lastAppAccessed: {
    appName: string;
    category: string;
    timestamp: string;
    activeMinutesAgo: number;
    color: string;
  };
}

export interface AttachedImageRecap {
  id: string;
  eventId?: string;
  prompt: string;
  imageUrl: string;
  imageSize: '1K' | '2K' | '4K';
  aspectRatio: string;
  createdAt: string;
  title: string;
}
