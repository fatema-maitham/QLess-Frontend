import { useCallback, useEffect, useState } from "react";
import { getMe } from "../services/accountService";
import { NOTIFICATIONS_CHANGED } from "../services/notificationService";
import { noShowStatus } from "../components/NoShow/noShowStatus";

/**
 * The signed-in customer's no-show state: { state, count, until } or null while loading.
 * Reloads when the tab comes back and when notifications change
 * (a no-show always creates a notification).
 */
export default function useNoShowStatus(enabled = true) {
  const [me, setMe] = useState(null);

  const load = useCallback(() => {
    getMe()
      .then(setMe)
      .catch(() => {
        // not signed in or offline: show nothing
      });
  }, []);

  useEffect(() => {
    if (!enabled) return;
    load();

    const onVisible = () => document.visibilityState === "visible" && load();
    window.addEventListener(NOTIFICATIONS_CHANGED, load);
    document.addEventListener("visibilitychange", onVisible);
    return () => {
      window.removeEventListener(NOTIFICATIONS_CHANGED, load);
      document.removeEventListener("visibilitychange", onVisible);
    };
  }, [enabled, load]);

  return enabled && me ? noShowStatus(me) : null;
}