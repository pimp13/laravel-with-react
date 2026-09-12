import AppLayout from "@/layouts/AppLayout";
import PanelLayout from "@/layouts/PanelLayout";
import { Link } from "@inertiajs/react";
import {
  Activity,
  ArrowUpRight,
  Eye,
  FileText,
  LayoutIcon,
  MessageSquare,
  Plus,
  TrendingUp,
  Users,
} from "lucide-react";
import React from "react";

function StatCard({
  title,
  value,
  icon,
  color,
  href,
}: {
  title: string;
  value: string | number;
  icon: React.ReactNode;
  color: string;
  href?: string;
}) {
  const content = (
    <div className="rounded-xl border border-slate-200 bg-white p-5 shadow-sm transition hover:shadow-md">
      <div className="flex items-start justify-between">
        <div>
          <p className="text-sm text-slate-500">{title}</p>
          <p className="mt-1 text-2xl font-bold text-slate-800">{value}</p>
        </div>
        <div className={`rounded-lg p-2.5 ${color}`}>{icon}</div>
      </div>
    </div>
  );

  return href ? <Link href={href}>{content}</Link> : content;
}

function Widget({
  title,
  children,
  action,
}: {
  title: string;
  children: React.ReactNode;
  action?: React.ReactNode;
}) {
  return (
    <div className="rounded-xl border border-slate-200 bg-white shadow-sm overflow-hidden">
      <div className="flex items-center justify-between border-b border-slate-100 bg-slate-50/80 px-5 py-3">
        <h3 className="text-sm font-semibold text-slate-800">{title}</h3>
        {action}
      </div>
      <div className="p-5">{children}</div>
    </div>
  );
}

export default function PanelPage() {
  // این داده‌ها را از Inertia props بگیرید
  const stats = {
    posts: 24,
    pages: 8,
    comments: 56,
    users: 12,
  };

  const recentPosts = [
    {
      id: 1,
      title: "آموزش کامل Laravel 13",
      status: "general",
      date: "۱۰ شهریور ۱۴۰۵",
    },
    {
      id: 2,
      title: "بهینه‌سازی SEO در React",
      status: "general",
      date: "۵ شهریور ۱۴۰۵",
    },
    {
      id: 3,
      title: "مقایسه TypeScript و JavaScript",
      status: "draft",
      date: "۱۱ شهریور ۱۴۰۵",
    },
  ];

  const activity = [
    { text: "مقاله جدید «آموزش Laravel» منتشر شد", time: "۲ ساعت پیش" },
    { text: "نظر جدید در مقاله SEO ثبت شد", time: "۵ ساعت پیش" },
    { text: "کاربر جدید ثبت‌نام کرد", time: "دیروز" },
  ];

  return (
    <PanelLayout title="پیشخوان">
      {/* خوش‌آمدگویی */}
      <div className="mb-6 rounded-xl border border-blue-100 bg-gradient-to-l from-blue-50 to-indigo-50 p-5">
        <div className="flex flex-wrap items-center justify-between gap-4">
          <div>
            <h2 className="text-lg font-bold text-slate-800">
              سلام، به پنل مدیریت خوش آمدید 👋
            </h2>
            <p className="mt-1 text-sm text-slate-600">
              اینجا می‌توانید محتوای سایت، صفحات لندینگ و تنظیمات را مدیریت
              کنید.
            </p>
          </div>
          <Link
            href="/panel/posts/create"
            className="inline-flex items-center gap-2 rounded-lg bg-[#2271b1] px-4 py-2.5 text-sm font-medium text-white hover:bg-[#135e96]"
          >
            <Plus className="h-4 w-4" />
            نوشته جدید
          </Link>
        </div>
      </div>

      {/* آمار سریع */}
      <div className="mb-6 grid grid-cols-2 gap-4 lg:grid-cols-4">
        <StatCard
          title="نوشته‌ها"
          value={stats.posts}
          icon={<FileText className="h-5 w-5 text-blue-600" />}
          color="bg-blue-50"
          href="/panel/posts"
        />
        <StatCard
          title="صفحات"
          value={stats.pages}
          icon={<LayoutIcon className="h-5 w-5 text-indigo-600" />}
          color="bg-indigo-50"
          href="/panel/pages"
        />
        <StatCard
          title="نظرات"
          value={stats.comments}
          icon={<MessageSquare className="h-5 w-5 text-emerald-600" />}
          color="bg-emerald-50"
          href="/panel/comments"
        />
        <StatCard
          title="کاربران"
          value={stats.users}
          icon={<Users className="h-5 w-5 text-amber-600" />}
          color="bg-amber-50"
          href="/panel/users"
        />
      </div>

      <div className="grid grid-cols-1 gap-6 lg:grid-cols-3">
        {/* نوشته‌های اخیر */}
        <div className="lg:col-span-2">
          <Widget
            title="نوشته‌های اخیر"
            action={
              <Link
                href="/panel/posts"
                className="text-xs text-[#2271b1] hover:underline flex items-center gap-1"
              >
                مشاهده همه
                <ArrowUpRight className="h-3.5 w-3.5" />
              </Link>
            }
          >
            <div className="space-y-3">
              {recentPosts.map((post) => (
                <div
                  key={post.id}
                  className="flex items-center justify-between rounded-lg border border-slate-100 px-4 py-3 hover:bg-slate-50"
                >
                  <div className="min-w-0">
                    <Link
                      href={`/panel/posts/${post.id}`}
                      className="font-medium text-slate-800 hover:text-[#2271b1] line-clamp-1"
                    >
                      {post.title}
                    </Link>
                    <p className="mt-0.5 text-xs text-slate-500">{post.date}</p>
                  </div>
                  <span
                    className={`shrink-0 rounded-full px-2.5 py-0.5 text-xs font-medium ${
                      post.status === "general"
                        ? "bg-emerald-50 text-emerald-700"
                        : "bg-blue-50 text-blue-700"
                    }`}
                  >
                    {post.status === "general" ? "منتشر شده" : "پیش‌نویس"}
                  </span>
                </div>
              ))}
            </div>
          </Widget>
        </div>

        {/* فعالیت‌ها */}
        <div>
          <Widget title="فعالیت‌های اخیر">
            <div className="space-y-4">
              {activity.map((item, i) => (
                <div key={i} className="flex gap-3">
                  <div className="mt-1.5 h-2 w-2 shrink-0 rounded-full bg-[#2271b1]" />
                  <div>
                    <p className="text-sm text-slate-700">{item.text}</p>
                    <p className="mt-0.5 text-xs text-slate-400">{item.time}</p>
                  </div>
                </div>
              ))}
            </div>
          </Widget>
        </div>
      </div>

      {/* دسترسی سریع */}
      <div className="mt-6">
        <Widget title="دسترسی سریع">
          <div className="grid grid-cols-2 gap-3 sm:grid-cols-4">
            {[
              {
                label: "نوشته جدید",
                href: "/panel/posts/create",
                icon: <FileText className="h-5 w-5" />,
              },
              {
                label: "صفحه جدید",
                href: "/panel/pages/create",
                icon: <LayoutIcon className="h-5 w-5" />,
              },
              {
                label: "رسانه",
                href: "/panel/media",
                icon: <Eye className="h-5 w-5" />,
              },
              {
                label: "تنظیمات",
                href: "/panel/settings",
                icon: <Activity className="h-5 w-5" />,
              },
            ].map((item) => (
              <Link
                key={item.href}
                href={item.href}
                className="flex flex-col items-center gap-2 rounded-xl border border-slate-200 p-4 text-center transition hover:border-[#2271b1] hover:bg-blue-50/50"
              >
                <span className="text-[#2271b1]">{item.icon}</span>
                <span className="text-sm font-medium text-slate-700">
                  {item.label}
                </span>
              </Link>
            ))}
          </div>
        </Widget>
      </div>
    </PanelLayout>
  );
}

PanelPage.layout = (page: React.ReactNode) => <AppLayout>{page}</AppLayout>;
