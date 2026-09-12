import { ToastProvider } from "@/components/ui/Toastalert";
import { AuthProvider } from "@/contexts/AuthContext";
import React from "react";

interface AppLayoutProps {
  children: React.ReactNode;
}

export default function AppLayout({ children }: AppLayoutProps) {
  return (
    <AuthProvider>
      <ToastProvider>
        <div>
          {/* className="mx-auto max-w-7xl px-6 py-8" */}
          <main>{children}</main>
        </div>
      </ToastProvider>
    </AuthProvider>
  );
}
