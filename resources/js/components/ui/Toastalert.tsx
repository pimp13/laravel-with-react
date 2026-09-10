import React, {
  createContext,
  useCallback,
  useContext,
  useEffect,
  useRef,
  useState,
  type ReactNode,
} from "react";

import {
  CheckCircle2,
  XCircle,
  AlertTriangle,
  Info,
  X,
  type LucideIcon,
} from "lucide-react";

/* ============================================================
   Types
============================================================ */

export type ToastType = "success" | "error" | "warning" | "info";

export interface Toast {
  id: string;
  type?: ToastType;
  title?: string;
  message?: string;
  duration?: number;
}

export type ToastOptions = Omit<Toast, "id" | "type">;

export interface ToastProviderProps {
  children: ReactNode;
}

interface ToastItemProps {
  toast: Toast;
  onClose: (id: string) => void;
}

interface ToastStyle {
  icon: LucideIcon;
  ring: string;
  iconBg: string;
  iconColor: string;
  bar: string;
}

/* ============================================================
   Styles
============================================================ */

const STYLES: Record<ToastType, ToastStyle> = {
  success: {
    icon: CheckCircle2,
    ring: "ring-emerald-100",
    iconBg: "bg-emerald-50",
    iconColor: "text-emerald-500",
    bar: "bg-emerald-400",
  },

  error: {
    icon: XCircle,
    ring: "ring-rose-100",
    iconBg: "bg-rose-50",
    iconColor: "text-rose-500",
    bar: "bg-rose-400",
  },

  warning: {
    icon: AlertTriangle,
    ring: "ring-amber-100",
    iconBg: "bg-amber-50",
    iconColor: "text-amber-500",
    bar: "bg-amber-400",
  },

  info: {
    icon: Info,
    ring: "ring-indigo-100",
    iconBg: "bg-indigo-50",
    iconColor: "text-indigo-500",
    bar: "bg-indigo-400",
  },
};

/* ============================================================
   Toast Context
============================================================ */

export interface ToastContextValue {
  show: (toast: Omit<Toast, "id">) => string;

  success: (message: string, options?: ToastOptions) => string;

  error: (message: string, options?: ToastOptions) => string;

  warning: (message: string, options?: ToastOptions) => string;

  info: (message: string, options?: ToastOptions) => string;

  dismiss: (id: string) => void;
}

const ToastContext = createContext<ToastContextValue | null>(null);

/* ============================================================
   Toast Item
============================================================ */

function ToastItem({ toast, onClose }: ToastItemProps) {
  const { type = "info", title, message, duration = 4000 } = toast;

  const style = STYLES[type];
  const Icon = style.icon;

  const [leaving, setLeaving] = useState<boolean>(false);
  const [paused, setPaused] = useState<boolean>(false);

  const timerRef = useRef<ReturnType<typeof setTimeout> | null>(null);

  const remainingRef = useRef<number>(duration);
  const startRef = useRef<number>(Date.now());

  const close = useCallback(() => {
    setLeaving(true);

    setTimeout(() => {
      onClose(toast.id);
    }, 200);
  }, [onClose, toast.id]);

  useEffect(() => {
    if (duration === Infinity) {
      return;
    }

    const tick = () => {
      startRef.current = Date.now();

      timerRef.current = setTimeout(close, Math.max(0, remainingRef.current));
    };

    if (!paused) {
      tick();
    }

    return () => {
      if (timerRef.current) {
        clearTimeout(timerRef.current);
      }
    };
  }, [paused, close, duration]);

  const handleMouseEnter = () => {
    if (duration === Infinity) {
      return;
    }

    if (timerRef.current) {
      clearTimeout(timerRef.current);
    }

    remainingRef.current -= Date.now() - startRef.current;

    setPaused(true);
  };

  const handleMouseLeave = () => {
    setPaused(false);
  };

  return (
    <div
      onMouseEnter={handleMouseEnter}
      onMouseLeave={handleMouseLeave}
      className={`pointer-events-auto relative w-80 overflow-hidden rounded-2xl bg-white shadow-lg shadow-slate-200/70 ring-1 ${
        style.ring
      } transition-all duration-200 ${
        leaving ? "translate-y-1 opacity-0" : "animate-toast-in"
      }`}
    >
      <div className="flex items-start gap-3 p-4">
        <div
          className={`flex h-8 w-8 shrink-0 items-center justify-center rounded-full ${style.iconBg}`}
        >
          <Icon size={17} className={style.iconColor} strokeWidth={2} />
        </div>

        <div className="min-w-0 flex-1 pt-0.5">
          {title && (
            <p className="text-sm font-semibold text-slate-800">{title}</p>
          )}

          {message && (
            <p className="mt-0.5 text-xs leading-5 text-slate-500">{message}</p>
          )}
        </div>

        <button
          type="button"
          onClick={close}
          className="shrink-0 rounded-lg p-1 text-slate-300 transition-colors hover:bg-slate-50 hover:text-slate-500"
        >
          <X size={15} />
        </button>
      </div>

      {duration !== Infinity && (
        <div className="h-1 w-full bg-slate-100">
          <div
            className={`h-full ${style.bar}`}
            style={{
              animation: `toast-shrink ${duration}ms linear forwards`,
              animationPlayState: paused ? "paused" : "running",
            }}
          />
        </div>
      )}
    </div>
  );
}

/* ============================================================
   Toast Provider
============================================================ */

export function ToastProvider({ children }: ToastProviderProps) {
  const [toasts, setToasts] = useState<Toast[]>([]);

  const addToast = useCallback((toast: Omit<Toast, "id">): string => {
    const id = crypto.randomUUID();

    setToasts((prev) => [
      ...prev,
      {
        id,
        ...toast,
      },
    ]);

    return id;
  }, []);

  const removeToast = useCallback((id: string) => {
    setToasts((prev) => prev.filter((toast) => toast.id !== id));
  }, []);

  const api: ToastContextValue = {
    show: addToast,

    success: (message, options) =>
      addToast({
        type: "success",
        message,
        ...options,
      }),

    error: (message, options) =>
      addToast({
        type: "error",
        message,
        ...options,
      }),

    warning: (message, options) =>
      addToast({
        type: "warning",
        message,
        ...options,
      }),

    info: (message, options) =>
      addToast({
        type: "info",
        message,
        ...options,
      }),

    dismiss: removeToast,
  };

  return (
    <ToastContext.Provider value={api}>
      <style>{`
        @keyframes toast-in {
          from {
            opacity: 0;
            transform: translateY(8px) scale(.97);
          }

          to {
            opacity: 1;
            transform: translateY(0) scale(1);
          }
        }

        @keyframes toast-shrink {
          from {
            width: 100%;
          }

          to {
            width: 0%;
          }
        }

        .animate-toast-in {
          animation: toast-in .25s ease-out;
        }
      `}</style>

      {children}

      <div className="pointer-events-none fixed bottom-5 left-5 z-50 flex flex-col gap-3">
        {toasts.map((toast) => (
          <ToastItem key={toast.id} toast={toast} onClose={removeToast} />
        ))}
      </div>
    </ToastContext.Provider>
  );
}

/* ============================================================
   useToast Hook
============================================================ */

export function useToast(): ToastContextValue {
  const context = useContext(ToastContext);

  if (!context) {
    throw new Error("useToast باید داخل ToastProvider استفاده بشه");
  }

  return context;
}
