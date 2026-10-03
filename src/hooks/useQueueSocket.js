import { useEffect, useRef, useState } from "react";

const API_URL = import.meta.env.VITE_API_URL || "http://127.0.0.1:8000/api";
const MAX_RETRY_MS = 15000;

// http://127.0.0.1:8000/api -> ws://127.0.0.1:8000/api/ws/queues/1?token=...
function socketUrl(queueId, token) {
  const url = new URL(`${API_URL}/ws/queues/${queueId}`);
  url.protocol = url.protocol === "https:" ? "wss:" : "ws:";
  url.searchParams.set("token", token);
  return url;
}

/**
 * Listens to live updates for one queue.
 * - onMessage(message) runs for every update from the server
 * - returns true while connected
 * If the connection drops, it tries again after 1s, 2s, 4s ... up to 15s.
 */
export default function useQueueSocket(queueId, onMessage, { enabled = true } = {}) {
  const [connected, setConnected] = useState(false);
  const handlerRef = useRef(onMessage);

  // Always call the newest onMessage without reconnecting
  useEffect(() => {
    handlerRef.current = onMessage;
  }, [onMessage]);

  useEffect(() => {
    const token = localStorage.getItem("token");
    if (!enabled || !queueId || !token) return;

    let socket = null;
    let retryTimer = null;
    let attempts = 0;
    let stopped = false;

    function connect() {
      socket = new WebSocket(socketUrl(queueId, token));

      socket.onopen = () => {
        attempts = 0;
        setConnected(true);
      };

      socket.onmessage = (event) => {
        try {
          handlerRef.current?.(JSON.parse(event.data));
        } catch {
          // ignore messages that aren't JSON
        }
      };

      socket.onclose = () => {
        setConnected(false);
        if (stopped) return;
        const delay = Math.min(1000 * 2 ** attempts, MAX_RETRY_MS);
        attempts += 1;
        retryTimer = setTimeout(connect, delay);
      };
    }

    connect();

    return () => {
      stopped = true;
      clearTimeout(retryTimer);
      socket?.close();
      setConnected(false);
    };
  }, [queueId, enabled]);

  return connected;
}