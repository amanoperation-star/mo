import { AppNotification } from '../types';

export interface RealtimeSyncPayload {
  type: 'STUDENTS_UPDATED' | 'EXPENSES_UPDATED' | 'STAFF_UPDATED' | 'COURSES_UPDATED' | 'SETTINGS_UPDATED' | 'NOTIFICATION_ADDED';
  senderUser: string;
  actionTitle: string;
  actionDetails: string;
  timestamp: string;
  data?: any;
  notification?: AppNotification;
}

const CHANNEL_NAME = 'el_saqqa_realtime_broadcast_v1';

// BroadcastChannel instance (supported natively in all modern browsers)
let broadcastChannel: BroadcastChannel | null = null;

try {
  if (typeof window !== 'undefined' && 'BroadcastChannel' in window) {
    broadcastChannel = new BroadcastChannel(CHANNEL_NAME);
  }
} catch (e) {
  console.warn('BroadcastChannel not supported in this environment', e);
}

/**
 * Broadcast an action event to all other open browsers/tabs in real-time
 */
export function broadcastRealtimeEvent(payload: RealtimeSyncPayload) {
  // 1. Post to BroadcastChannel
  if (broadcastChannel) {
    try {
      broadcastChannel.postMessage(payload);
    } catch (e) {
      console.error('Error posting to BroadcastChannel:', e);
    }
  }

  // 2. Backup trigger via localStorage event (works across all tabs/windows)
  try {
    const syncItem = {
      ...payload,
      _time: Date.now(),
    };
    localStorage.setItem('el_saqqa_sync_ping', JSON.stringify(syncItem));
  } catch (e) {
    // ignore
  }
}

/**
 * Listen for real-time broadcast events from other browsers/tabs
 */
export function subscribeToRealtimeEvents(onEvent: (payload: RealtimeSyncPayload) => void) {
  // 1. Listen via BroadcastChannel
  const handleBcMessage = (event: MessageEvent<RealtimeSyncPayload>) => {
    if (event.data) {
      onEvent(event.data);
    }
  };

  if (broadcastChannel) {
    broadcastChannel.addEventListener('message', handleBcMessage);
  }

  // 2. Listen via localStorage window 'storage' event
  const handleStorageEvent = (event: StorageEvent) => {
    if (event.key === 'el_saqqa_sync_ping' && event.newValue) {
      try {
        const parsed: RealtimeSyncPayload = JSON.parse(event.newValue);
        onEvent(parsed);
      } catch (e) {
        // ignore
      }
    }
  };

  window.addEventListener('storage', handleStorageEvent);

  // Return unsubscribe function
  return () => {
    if (broadcastChannel) {
      broadcastChannel.removeEventListener('message', handleBcMessage);
    }
    window.removeEventListener('storage', handleStorageEvent);
  };
}
