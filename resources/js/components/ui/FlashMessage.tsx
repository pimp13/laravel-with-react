// components/FlashMessage.tsx
import { usePage } from "@inertiajs/react";
import { useEffect, useState } from "react";

export function FlashMessage() {
  const { flash } = usePage().props as {
    flash?: {
      message?: string;
    };
  };

  const [visible, setVisible] = useState(false);

  useEffect(() => {
    if (flash?.message) {
      setVisible(true);

      // بعد از چند ثانیه مخفی شود
      const timer = setTimeout(() => {
        setVisible(false);
      }, 4000);

      return () => clearTimeout(timer);
    }
  }, [flash]);

  if (!visible || !flash?.message) return null;

  return (
    <div className="fixed top-4 left-1/2 z-50 -translate-x-1/2 transform">
      <div className="flex items-center gap-3 rounded-lg bg-green-600 px-5 py-3 text-sm font-medium text-white shadow-lg">
        <span>{flash.message}</span>
        <button
          onClick={() => setVisible(false)}
          className="text-white/80 hover:text-white"
        >
          ✕
        </button>
      </div>
    </div>
  );
}
