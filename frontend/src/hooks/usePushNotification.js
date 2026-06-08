import { useEffect, useRef, useState } from "react";
import {
  getVapidPublicKey,
  subscribeNotification,
  unsubscribeNotification,
} from "../api/notifications";

function urlBase64ToUint8Array(base64String) {
  const padding = "=".repeat((4 - (base64String.length % 4)) % 4);
  const base64 = (base64String + padding).replace(/-/g, "+").replace(/_/g, "/");
  const rawData = atob(base64);
  return Uint8Array.from([...rawData].map((c) => c.charCodeAt(0)));
}

/**
 * Service Worker 등록 + 푸시 구독 상태 관리 훅.
 * @param {(page: string) => void} onNavigate - SW 메시지로 페이지 이동
 * @returns {{ isSubscribed: boolean, toggle: () => Promise<void> }}
 */
export function usePushNotification(onNavigate) {
  const [isSubscribed, setIsSubscribed] = useState(false);
  const registrationRef = useRef(null);

  // SW 등록 및 현재 구독 상태 감지
  useEffect(() => {
    if (!("serviceWorker" in navigator) || !("PushManager" in window)) return;

    async function init() {
      try {
        const registration = await navigator.serviceWorker.register("/sw.js", {
          scope: "/",
        });
        registrationRef.current = registration;

        // 기존 구독 여부 확인
        const existing = await registration.pushManager.getSubscription();
        setIsSubscribed(!!existing);

        // SW → 앱 메시지 수신 (알림 클릭 시 페이지 이동)
        navigator.serviceWorker.addEventListener("message", (event) => {
          if (event.data?.type === "SW_NAVIGATE" && onNavigate) {
            onNavigate(event.data.page || "reservations");
          }
        });
      } catch (err) {
        console.warn("[Push] SW 초기화 실패:", err.message);
      }
    }

    init();
  }, []);

  async function subscribe() {
    if (!registrationRef.current) return;
    try {
      const permission = await Notification.requestPermission();
      if (permission !== "granted") {
        alert("브라우저 알림 권한이 차단되어 있습니다. 브라우저 설정에서 허용해주세요.");
        return;
      }
      const publicKey = await getVapidPublicKey();
      const sub = await registrationRef.current.pushManager.subscribe({
        userVisibleOnly: true,
        applicationServerKey: urlBase64ToUint8Array(publicKey),
      });
      await subscribeNotification(sub);
      setIsSubscribed(true);
    } catch (err) {
      console.warn("[Push] 구독 실패:", err.message);
    }
  }

  async function unsubscribe() {
    if (!registrationRef.current) return;
    try {
      const sub = await registrationRef.current.pushManager.getSubscription();
      if (sub) {
        await unsubscribeNotification(sub.endpoint);
        await sub.unsubscribe();
      }
      setIsSubscribed(false);
    } catch (err) {
      console.warn("[Push] 구독 해제 실패:", err.message);
    }
  }

  async function toggle() {
    if (isSubscribed) {
      await unsubscribe();
    } else {
      await subscribe();
    }
  }

  return { isSubscribed, toggle };
}
