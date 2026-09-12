// resources/js/Layouts/AdminLayout.tsx
import { Link, usePage } from "@inertiajs/react";
import {
  BarChart3,
  ChevronDown,
  FileText,
  Home,
  Image,
  Layout,
  LogOut,
  Menu,
  MessageSquare,
  Palette,
  Settings,
  Users,
  X,
  Zap,
} from "lucide-react";
import React, { useState } from "react";

interface NavItem {
  label: string;
  href?: string;
  icon: React.ReactNode;
  children?: { label: string; href: string }[];
}

const NAV_ITEMS: NavItem[] = [
  {
    label: "پیشخوان",
    href: "/panel",
    icon: <Home className="h-5 w-5" />,
  },
  {
    label: "نوشته‌ها",
    icon: <FileText className="h-5 w-5" />,
    children: [
      { label: "همه نوشته‌ها", href: "/panel/posts" },
      { label: "افزودن نوشته", href: "/panel/posts/create" },
      { label: "دسته‌ها", href: "/panel/categories" },
      { label: "برچسب‌ها", href: "/panel/tags" },
    ],
  },
  {
    label: "رسانه",
    href: "/panel/media",
    icon: <Image className="h-5 w-5" />,
  },
  {
    label: "صفحات",
    icon: <Layout className="h-5 w-5" />,
    children: [
      { label: "همه صفحات", href: "/panel/pages" },
      { label: "افزودن صفحه", href: "/panel/pages/create" },
    ],
  },
  {
    label: "نظرات",
    href: "/panel/comments",
    icon: <MessageSquare className="h-5 w-5" />,
  },
  {
    label: "ظاهر",
    icon: <Palette className="h-5 w-5" />,
    children: [
      { label: "پوسته‌ها", href: "/panel/themes" },
      { label: "سفارشی‌سازی", href: "/panel/customize" },
      { label: "ویجت‌ها", href: "/panel/widgets" },
      { label: "منوها", href: "/panel/menus" },
    ],
  },
  {
    label: "افزونه‌ها",
    href: "/panel/plugins",
    icon: <Zap className="h-5 w-5" />,
  },
  {
    label: "کاربران",
    href: "/panel/users",
    icon: <Users className="h-5 w-5" />,
  },
  {
    label: "ابزارها",
    href: "/panel/tools",
    icon: <BarChart3 className="h-5 w-5" />,
  },
  {
    label: "تنظیمات",
    href: "/panel/settings",
    icon: <Settings className="h-5 w-5" />,
  },
];

export default function PanelLayout({
  children,
  title = "پیشخوان",
}: {
  children: React.ReactNode;
  title?: string;
}) {
  const [sidebarOpen, setSidebarOpen] = useState(true);
  const [mobileOpen, setMobileOpen] = useState(false);
  const [openMenus, setOpenMenus] = useState<string[]>([]);

  const { url } = usePage();

  const toggleMenu = (label: string) => {
    setOpenMenus((prev) =>
      prev.includes(label) ? prev.filter((l) => l !== label) : [...prev, label],
    );
  };

  const isActive = (href?: string) => {
    if (!href) return false;
    // || url.startsWith(href + "/")
    return url === href;
  };

  return (
    <div dir="rtl" className="min-h-screen bg-[#f0f0f1] text-slate-800">
      {/* ========== TOP BAR (مثل نوار بالای وردپرس) ========== */}
      <header className="fixed top-0 right-0 left-0 z-50 flex h-8 items-center bg-[#1d2327] text-white text-xs">
        <div className="flex w-full items-center justify-between px-3">
          <div className="flex items-center gap-4">
            <Link
              href="/"
              className="flex items-center gap-1.5 hover:bg-white/10 px-2 py-1 rounded"
            >
              <span className="font-semibold">سایت شما</span>
            </Link>
            <Link href="/panel" className="hover:bg-white/10 px-2 py-1 rounded">
              پیشخوان
            </Link>
          </div>
          <div className="flex items-center gap-3">
            <span className="hidden sm:inline text-white/70">سلام، مدیر</span>
            <Link
              href="/logout"
              method="post"
              as="button"
              className="hover:bg-white/10 px-2 py-1 rounded flex items-center gap-1"
            >
              <LogOut className="h-3.5 w-3.5" />
              خروج
            </Link>
          </div>
        </div>
      </header>

      <div className="flex pt-8">
        {/* ========== SIDEBAR ========== */}
        <aside
          className={`fixed top-8 bottom-0 z-40 flex flex-col bg-[#1d2327] text-white transition-all duration-300
            ${sidebarOpen ? "w-56" : "w-16"}
            ${mobileOpen ? "translate-x-0" : "translate-x-full lg:translate-x-0"}
            right-0`}
        >
          {/* لوگو / عنوان */}
          <div className="flex h-14 items-center justify-between border-b border-white/10 px-4">
            {sidebarOpen && (
              <span className="font-bold text-sm tracking-wide">
                مدیریت سایت
              </span>
            )}
            <button
              type="button"
              onClick={() => setSidebarOpen(!sidebarOpen)}
              className="hidden lg:flex h-8 w-8 items-center justify-center rounded hover:bg-white/10"
            >
              <Menu className="h-4 w-4" />
            </button>
            <button
              type="button"
              onClick={() => setMobileOpen(false)}
              className="lg:hidden h-8 w-8 flex items-center justify-center rounded hover:bg-white/10"
            >
              <X className="h-4 w-4" />
            </button>
          </div>

          {/* منو */}
          <nav className="flex-1 overflow-y-auto py-3">
            {NAV_ITEMS.map((item) => {
              const hasChildren = !!item.children?.length;
              const isOpen = openMenus.includes(item.label);
              const active =
                isActive(item.href) ||
                item.children?.some((c) => isActive(c.href));

              return (
                <div key={item.label}>
                  {hasChildren ? (
                    <button
                      type="button"
                      onClick={() => toggleMenu(item.label)}
                      className={`flex w-full items-center gap-3 px-4 py-2.5 text-sm transition
                        ${active ? "bg-[#2271b1] text-white" : "text-white/80 hover:bg-white/10"}`}
                    >
                      <span className="shrink-0">{item.icon}</span>
                      {sidebarOpen && (
                        <>
                          <span className="flex-1 text-right">
                            {item.label}
                          </span>
                          <ChevronDown
                            className={`h-4 w-4 transition ${isOpen ? "rotate-180" : ""}`}
                          />
                        </>
                      )}
                    </button>
                  ) : (
                    <Link
                      href={item.href!}
                      className={`flex items-center gap-3 px-4 py-2.5 text-sm transition
                        ${active ? "bg-[#2271b1] text-white" : "text-white/80 hover:bg-white/10"}`}
                    >
                      <span className="shrink-0">{item.icon}</span>
                      {sidebarOpen && <span>{item.label}</span>}
                    </Link>
                  )}

                  {/* زیرمنو */}
                  {hasChildren && isOpen && sidebarOpen && (
                    <div className="bg-black/20 py-1">
                      {item.children!.map((child) => (
                        <Link
                          key={child.href}
                          href={child.href}
                          className={`block pr-12 pl-4 py-2 text-sm transition
                            ${
                              isActive(child.href)
                                ? "text-white bg-[#2271b1]/40"
                                : "text-white/60 hover:text-white hover:bg-white/5"
                            }`}
                        >
                          {child.label}
                        </Link>
                      ))}
                    </div>
                  )}
                </div>
              );
            })}
          </nav>
        </aside>

        {/* ========== MAIN CONTENT ========== */}
        <div
          className={`flex-1 transition-all duration-300
            ${sidebarOpen ? "lg:mr-56" : "lg:mr-16"}`}
        >
          {/* هدر صفحه */}
          <div className="sticky top-8 z-20 border-b border-slate-200 bg-white px-4 py-4 sm:px-6">
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-3">
                <button
                  type="button"
                  onClick={() => setMobileOpen(true)}
                  className="lg:hidden rounded-lg border border-slate-200 p-2"
                >
                  <Menu className="h-5 w-5" />
                </button>
                <h1 className="text-xl font-semibold text-slate-800">
                  {title}
                </h1>
              </div>
            </div>
          </div>

          {/* محتوای صفحه */}
          <main className="p-4 sm:p-6">{children}</main>
        </div>
      </div>

      {/* Overlay موبایل */}
      {mobileOpen && (
        <div
          className="fixed inset-0 z-30 bg-black/40 lg:hidden"
          onClick={() => setMobileOpen(false)}
        />
      )}
    </div>
  );
}
