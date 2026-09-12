import { useToast } from "@/components/ui/Toastalert";
import AppLayout from "@/layouts/AppLayout";
import { cn } from "@/lib/utils";
import { Link, router } from "@inertiajs/react";
import {
  ArrowRight,
  Calendar,
  CheckCircle2,
  Clock,
  Edit3,
  ExternalLink,
  Eye,
  FileText,
  Hash,
  Image as ImageIcon,
  Link2,
  Loader2,
  Trash2,
  User,
  XCircle,
} from "lucide-react";
import React, { useEffect, useMemo, useState } from "react";

/* -------------------------------------------------------------------------- */
/* Types                                                                      */
/* -------------------------------------------------------------------------- */

type Visibility = "general" | "private" | "limited" | "draft";
type RobotsIndex = "index" | "noindex";
type RobotsFollow = "follow" | "nofollow";
type MaxImagePreview = "none" | "standard" | "large";
type SchemaType = "BlogPosting" | "Article" | "NewsArticle" | "TechArticle";

interface RobotsMeta {
  index: RobotsIndex;
  follow: RobotsFollow;
  archive: boolean;
  snippet: boolean;
  image_index: boolean;
  max_snippet: number;
  max_image_preview: MaxImagePreview;
}

interface SocialMeta {
  title: string;
  description: string;
  image: string;
  image_alt: string;
}

interface SeoMeta {
  meta_title: string;
  meta_description: string;
  meta_keywords: string;
  focus_keyword: string;
  focus_keywords: string[];
  canonical_url: string;
  robots: RobotsMeta;
  og: SocialMeta & { type: "article" | "website" };
  twitter: SocialMeta & { card: "summary" | "summary_large_image" };
  schema_type: SchemaType;
  author_name: string;
  author_url: string;
  featured_image_alt: string;
  featured_image_caption: string;
  breadcrumb_title: string;
  reading_time: number;
  word_count: number;
  sitemap_priority: number;
  sitemap_change_frequency: string;
  seo_score: number;
}

interface PostDetail {
  id: number;
  title: string;
  slug: string;
  content: string;
  excerpt: string;
  featured_image: string | null;
  category_id: number | null;
  category_title: string | null;
  visibility: Visibility;
  published_at: string | null;
  is_active: boolean;
  author_name: string;
  created_at: string;
  updated_at: string;
  meta: {
    seo: SeoMeta;
  };
  author: any;
  category: any;
}

/* -------------------------------------------------------------------------- */
/* Helpers                                                                    */
/* -------------------------------------------------------------------------- */

function formatDate(dateStr: string | null | undefined) {
  if (!dateStr) return "—";
  try {
    return new Date(dateStr).toLocaleDateString("fa-IR", {
      year: "numeric",
      month: "long",
      day: "numeric",
      hour: "2-digit",
      minute: "2-digit",
    });
  } catch {
    return dateStr;
  }
}

function getVisibilityLabel(v: Visibility) {
  const map: Record<Visibility, string> = {
    general: "عمومی",
    private: "خصوصی",
    limited: "محدود",
    draft: "پیش‌نویس",
  };
  return map[v] || v;
}

function getVisibilityBadge(v: Visibility) {
  const map: Record<Visibility, string> = {
    general: "bg-emerald-50 text-emerald-700 border-emerald-200",
    private: "bg-slate-100 text-slate-600 border-slate-200",
    limited: "bg-amber-50 text-amber-700 border-amber-200",
    draft: "bg-blue-50 text-blue-700 border-blue-200",
  };
  return map[v] || "bg-slate-100 text-slate-600";
}

function getSeoBadge(score: number) {
  if (score >= 85) return "bg-emerald-50 text-emerald-700 border-emerald-200";
  if (score >= 70) return "bg-blue-50 text-blue-700 border-blue-200";
  if (score >= 50) return "bg-amber-50 text-amber-700 border-amber-200";
  return "bg-red-50 text-red-700 border-red-200";
}

function getSeoStatus(score: number) {
  if (score >= 85) return "عالی";
  if (score >= 70) return "خوب";
  if (score >= 50) return "متوسط";
  return "ضعیف";
}

function getSeoBarColor(score: number) {
  if (score >= 85) return "bg-emerald-500";
  if (score >= 70) return "bg-blue-500";
  if (score >= 50) return "bg-amber-500";
  return "bg-red-500";
}

/* -------------------------------------------------------------------------- */
/* Small UI                                                                   */
/* -------------------------------------------------------------------------- */

function MetaRow({
  label,
  value,
  dir,
}: {
  label: string;
  value: React.ReactNode;
  dir?: "ltr" | "rtl";
}) {
  return (
    <div className="flex items-start justify-between gap-4 py-2.5 border-b border-slate-100 last:border-0">
      <span className="text-xs text-slate-500 shrink-0">{label}</span>
      <span
        className="text-sm text-slate-800 text-right break-all"
        dir={dir || "rtl"}
      >
        {value || "—"}
      </span>
    </div>
  );
}

function SectionCard({
  title,
  icon,
  children,
  action,
}: {
  title: string;
  icon?: React.ReactNode;
  children: React.ReactNode;
  action?: React.ReactNode;
}) {
  return (
    <section className="rounded-2xl border border-slate-200 bg-white shadow-sm overflow-hidden">
      <div className="flex items-center justify-between border-b border-slate-100 px-5 py-3.5 bg-slate-50/60">
        <div className="flex items-center gap-2">
          {icon && <span className="text-slate-400">{icon}</span>}
          <h3 className="text-sm font-semibold text-slate-800">{title}</h3>
        </div>
        {action}
      </div>
      <div className="p-5">{children}</div>
    </section>
  );
}

/* -------------------------------------------------------------------------- */
/* Main component                                                             */
/* -------------------------------------------------------------------------- */

interface Props {
  post: PostDetail | null;
  /** اگر از Inertia prop می‌آید */
  //   id?: number;
}

export default function PostDetailPage({ post: postData }: Props) {
  console.log({ postData });
  const toast = useToast();

  const [loading, setLoading] = useState(true);
  const [post, setPost] = useState(postData);
  const [activeTab, setActiveTab] = useState<
    "content" | "seo" | "social" | "meta"
  >("content");
  const [deleting, setDeleting] = useState(false);
  const [toggling, setToggling] = useState(false);

  /* ---------------------------- Derived --------------------------------- */

  const seoScore = post?.meta?.seo?.seo_score ?? 0;

  const googlePreviewTitle =
    post?.meta?.seo?.meta_title || post?.title || "عنوان مقاله";
  const googlePreviewDesc =
    post?.meta?.seo?.meta_description || post?.excerpt || "توضیحات متا...";
  const googlePreviewUrl =
    post?.meta?.seo?.canonical_url ||
    (post?.slug ? `https://example.com/blog/${post.slug}` : "");

  /* ---------------------------- Actions --------------------------------- */

  const handleToggleActive = async () => {
    if (!post) return;
    setToggling(true);
    try {
      const res = await fetch(`/api/v1/posts/${post.id}/status`, {
        method: "PATCH",
        headers: {
          "Content-Type": "application/json",
          Accept: "application/json",
        },
        credentials: "include",
        body: JSON.stringify({ is_active: !post.is_active }),
      });
      const data = await res.json();
      if (!res.ok) throw new Error(data?.message || "تغییر وضعیت ناموفق");

      setPost((prev) =>
        prev
          ? { ...prev, is_active: data.data?.is_active ?? !prev.is_active }
          : prev,
      );
      toast.success(data.message || "وضعیت تغییر کرد");
    } catch (err) {
      toast.error(err instanceof Error ? err.message : "خطا");
    } finally {
      setToggling(false);
    }
  };

  const handleDelete = async () => {
    if (!post) return;
    const ok = window.confirm(
      `آیا از حذف دائمی مقاله «${post.title}» مطمئن هستید؟`,
    );
    if (!ok) return;

    setDeleting(true);
    try {
      const res = await fetch(`/api/v1/posts/${post.id}`, {
        method: "DELETE",
        headers: { Accept: "application/json" },
        credentials: "include",
      });
      const data = await res.json().catch(() => ({}));
      if (!res.ok) throw new Error(data?.message || "حذف ناموفق بود");

      toast.success("مقاله حذف شد");
      router.visit("/panel/posts");
    } catch (err) {
      toast.error(err instanceof Error ? err.message : "خطا در حذف");
    } finally {
      setDeleting(false);
    }
  };

  /* ---------------------------- Loading / Empty ------------------------- */

  //   if (loading) {
  //     return (
  //       <div
  //         dir="rtl"
  //         className="min-h-screen bg-slate-100 flex items-center justify-center"
  //       >
  //         <div className="flex flex-col items-center gap-3 text-slate-500">
  //           <Loader2 className="h-8 w-8 animate-spin text-indigo-600" />
  //           <p className="text-sm">در حال بارگذاری مقاله...</p>
  //         </div>
  //       </div>
  //     );
  //   }

  if (!post) {
    return (
      <div
        dir="rtl"
        className="min-h-screen bg-slate-100 flex items-center justify-center"
      >
        <div className="text-center">
          <p className="text-lg font-medium text-slate-700">مقاله یافت نشد</p>
          <Link
            href="/panel/posts"
            className="mt-4 inline-flex items-center gap-2 text-sm text-indigo-600 hover:underline"
          >
            <ArrowRight className="h-4 w-4" />
            بازگشت به لیست مقالات
          </Link>
        </div>
      </div>
    );
  }

  /* ---------------------------- Render ---------------------------------- */

  const tabs = [
    {
      id: "content" as const,
      label: "محتوا",
      icon: <FileText className="h-4 w-4" />,
    },
    { id: "seo" as const, label: "SEO", icon: <Hash className="h-4 w-4" /> },
    {
      id: "social" as const,
      label: "شبکه‌های اجتماعی",
      icon: <Link2 className="h-4 w-4" />,
    },
    {
      id: "meta" as const,
      label: "متادیتا",
      icon: <Eye className="h-4 w-4" />,
    },
  ];

  return (
    <div dir="rtl" className="min-h-screen bg-slate-50 text-slate-900">
      {/* Sticky Header */}
      <header className="sticky top-0 z-30 border-b border-slate-200 bg-white/95 backdrop-blur">
        <div className="mx-auto flex h-16 max-w-7xl items-center justify-between gap-4 px-4 sm:px-6 lg:px-8">
          <div className="flex items-center gap-3 min-w-0">
            <Link
              href="/panel/posts/list"
              className="flex h-9 w-9 shrink-0 items-center justify-center rounded-lg border border-slate-200 text-slate-500 hover:bg-slate-50 hover:text-slate-800"
              title="بازگشت"
            >
              <ArrowRight className="h-4 w-4" />
            </Link>
            <div className="min-w-0">
              <h1 className="truncate text-base font-bold text-slate-800 sm:text-lg">
                {post.title}
              </h1>
              <div className="mt-0.5 flex flex-wrap items-center gap-2 text-xs text-slate-500">
                <span
                  className={cn(
                    "inline-flex rounded-full border px-2 py-0.5 font-medium",
                    getVisibilityBadge(post.visibility),
                  )}
                >
                  {getVisibilityLabel(post.visibility)}
                </span>
                {!post.is_active && (
                  <span className="inline-flex items-center gap-1 rounded-full bg-red-50 px-2 py-0.5 text-red-600 border border-red-100">
                    <XCircle className="h-3 w-3" />
                    غیرفعال
                  </span>
                )}
                <span className="hidden sm:inline">•</span>
                <span className="hidden sm:inline" dir="ltr">
                  /{post.slug}
                </span>
              </div>
            </div>
          </div>

          <div className="flex shrink-0 items-center gap-2">
            <a
              href={`/blog/${post.slug}`}
              target="_blank"
              rel="noopener noreferrer"
              className="hidden sm:inline-flex items-center gap-1.5 rounded-lg border border-slate-200 px-3 py-2 text-sm text-slate-600 hover:bg-slate-50"
            >
              <ExternalLink className="h-4 w-4" />
              مشاهده در سایت
            </a>
            <Link
              href={`/panel/posts/${post.id}/edit`}
              className="inline-flex items-center gap-1.5 rounded-lg bg-indigo-600 px-4 py-2 text-sm font-medium text-white shadow-sm hover:bg-indigo-700"
            >
              <Edit3 className="h-4 w-4" />
              ویرایش
            </Link>
          </div>
        </div>
      </header>

      <main className="mx-auto max-w-7xl px-4 py-8 sm:px-6 lg:px-8">
        <div className="grid grid-cols-1 gap-8 lg:grid-cols-3">
          {/* ===================== MAIN COLUMN ===================== */}
          <div className="space-y-6 lg:col-span-2">
            {/* Tabs */}
            <div className="overflow-hidden rounded-2xl border border-slate-200 bg-white shadow-sm">
              <div className="flex overflow-x-auto border-b border-slate-200">
                {tabs.map((tab) => (
                  <button
                    key={tab.id}
                    type="button"
                    onClick={() => setActiveTab(tab.id)}
                    className={cn(
                      "flex min-w-fit flex-1 items-center justify-center gap-2 px-4 py-3.5 text-sm font-medium transition cursor-pointer",
                      activeTab === tab.id
                        ? "border-b-2 border-indigo-600 bg-indigo-50/60 text-indigo-700"
                        : "text-slate-500 hover:bg-slate-50 hover:text-slate-700",
                    )}
                  >
                    {tab.icon}
                    {tab.label}
                  </button>
                ))}
              </div>

              <div className="p-6">
                {/* ---- CONTENT TAB ---- */}
                {activeTab === "content" && (
                  <div className="space-y-6">
                    {post.featured_image && (
                      <div className="overflow-hidden rounded-xl border border-slate-200">
                        <img
                          src={post.featured_image}
                          alt={post.meta?.seo?.featured_image_alt || post.title}
                          className="h-56 w-full object-cover sm:h-72"
                        />
                        {post.meta?.seo?.featured_image_caption && (
                          <p className="bg-slate-50 px-4 py-2 text-center text-xs text-slate-500">
                            {post.meta?.seo?.featured_image_caption}
                          </p>
                        )}
                      </div>
                    )}

                    {post.excerpt && (
                      <div className="rounded-xl border border-amber-100 bg-amber-50/50 px-4 py-3">
                        <p className="text-xs font-medium text-amber-800 mb-1">
                          خلاصه (Excerpt)
                        </p>
                        <p className="text-sm leading-6 text-slate-700">
                          {post.excerpt}
                        </p>
                      </div>
                    )}

                    <div>
                      <p className="mb-3 text-xs font-medium text-slate-500">
                        محتوای کامل
                      </p>
                      <div
                        className="prose prose-slate max-w-none rounded-xl border border-slate-200 bg-white p-5 text-right prose-headings:font-bold prose-a:text-indigo-600"
                        dir="rtl"
                        dangerouslySetInnerHTML={{
                          __html: post.content || "<p>محتوایی وجود ندارد.</p>",
                        }}
                      />
                    </div>
                  </div>
                )}

                {/* ---- SEO TAB ---- */}
                {activeTab === "seo" && (
                  <div className="space-y-6">
                    {/* Score */}
                    <div className="rounded-xl border border-slate-200 bg-slate-50 p-5">
                      <div className="flex flex-wrap items-center justify-between gap-4">
                        <div>
                          <p className="text-sm font-semibold text-slate-800">
                            امتیاز SEO
                          </p>
                          <p className="mt-1 text-xs text-slate-500">
                            بر اساس چک‌لیست داخلی ویرایشگر
                          </p>
                        </div>
                        <div className="flex items-center gap-3">
                          <div className="h-2.5 w-36 overflow-hidden rounded-full bg-slate-200">
                            <div
                              className={`h-full transition-all ${getSeoBarColor(seoScore)}`}
                              style={{ width: `${seoScore}%` }}
                            />
                          </div>
                          <div className="text-left">
                            <div
                              className={`text-2xl font-bold ${
                                seoScore >= 70
                                  ? "text-emerald-600"
                                  : seoScore >= 50
                                    ? "text-amber-600"
                                    : "text-red-600"
                              }`}
                            >
                              {seoScore}
                            </div>
                            <div className="text-[11px] text-slate-500">
                              {getSeoStatus(seoScore)}
                            </div>
                          </div>
                        </div>
                      </div>
                    </div>

                    {/* Google Preview */}
                    <div>
                      <p className="mb-3 text-xs font-medium text-slate-500">
                        پیش‌نمایش گوگل
                      </p>
                      <div className="rounded-xl border border-slate-200 bg-white p-4 shadow-sm">
                        <p className="line-clamp-2 text-lg leading-snug text-blue-700">
                          {googlePreviewTitle}
                        </p>
                        <p
                          className="mt-1 truncate text-sm text-emerald-700"
                          dir="ltr"
                        >
                          {googlePreviewUrl}
                        </p>
                        <p className="mt-1 line-clamp-3 text-sm leading-6 text-slate-600">
                          {googlePreviewDesc}
                        </p>
                      </div>
                    </div>

                    <div className="grid gap-4 sm:grid-cols-1">
                      <MetaRow
                        label="عنوان گوگل"
                        value={post.meta?.seo?.meta_title}
                      />
                      <MetaRow
                        label="کلمه کلیدی اصلی"
                        value={post.meta?.seo?.focus_keyword || "—"}
                      />
                    </div>
                    <MetaRow
                      label="Meta Description"
                      value={post.meta?.seo?.meta_description}
                    />
                    <MetaRow
                      label="Canonical URL"
                      value={post.meta?.seo?.canonical_url}
                      dir="ltr"
                    />
                    <MetaRow
                      label="کلمات کلیدی فرعی"
                      value={
                        post.meta?.seo?.focus_keywords?.length
                          ? post.meta?.seo?.focus_keywords.join("، ")
                          : "—"
                      }
                    />

                    {/* Robots */}
                    <div className="rounded-xl border border-slate-200 bg-slate-50 p-4">
                      <p className="mb-3 text-xs font-medium text-slate-500">
                        Robots
                      </p>
                      <div className="grid grid-cols-2 gap-3 text-sm sm:grid-cols-4">
                        <div>
                          <span className="text-xs text-slate-400">Index</span>
                          <p className="font-medium">
                            {post.meta?.seo?.robots?.index || "—"}
                          </p>
                        </div>
                        <div>
                          <span className="text-xs text-slate-400">Follow</span>
                          <p className="font-medium">
                            {post.meta?.seo?.robots?.follow || "—"}
                          </p>
                        </div>
                        <div>
                          <span className="text-xs text-slate-400">
                            Max Snippet
                          </span>
                          <p className="font-medium">
                            {post.meta?.seo?.robots?.max_snippet ?? "—"}
                          </p>
                        </div>
                        <div>
                          <span className="text-xs text-slate-400">
                            Image Preview
                          </span>
                          <p className="font-medium">
                            {post.meta?.seo?.robots?.max_image_preview || "—"}
                          </p>
                        </div>
                      </div>
                    </div>
                  </div>
                )}

                {/* ---- SOCIAL TAB ---- */}
                {activeTab === "social" && (
                  <div className="space-y-8">
                    {/* Open Graph */}
                    <div>
                      <p className="mb-3 text-sm font-semibold text-slate-800">
                        Open Graph
                      </p>
                      <div className="overflow-hidden rounded-xl border border-slate-200">
                        {(post.meta?.seo?.og?.image || post.featured_image) && (
                          <img
                            src={
                              post.meta?.seo?.og?.image ||
                              post.featured_image ||
                              ""
                            }
                            alt={post.meta?.seo?.og?.image_alt || post.title}
                            className="h-48 w-full object-cover"
                          />
                        )}
                        <div className="p-4">
                          <p className="font-semibold text-slate-800">
                            {post.meta?.seo?.og?.title || post.title}
                          </p>
                          <p className="mt-1 line-clamp-2 text-sm text-slate-500">
                            {post.meta?.seo?.og?.description || post.excerpt}
                          </p>
                          <p className="mt-2 text-xs text-slate-400">
                            type: {post.meta?.seo?.og?.type || "article"}
                          </p>
                        </div>
                      </div>
                    </div>

                    {/* Twitter */}
                    <div>
                      <p className="mb-3 text-sm font-semibold text-slate-800">
                        Twitter / X Card
                      </p>
                      <div className="overflow-hidden rounded-xl border border-slate-200">
                        {(post.meta?.seo?.twitter?.image ||
                          post.featured_image) && (
                          <img
                            src={
                              post.meta?.seo?.twitter?.image ||
                              post.featured_image ||
                              ""
                            }
                            alt={
                              post.meta?.seo?.twitter?.image_alt || post.title
                            }
                            className="h-48 w-full object-cover"
                          />
                        )}
                        <div className="p-4">
                          <p className="font-semibold text-slate-800">
                            {post.meta?.seo?.twitter?.title || post.title}
                          </p>
                          <p className="mt-1 line-clamp-2 text-sm text-slate-500">
                            {post.meta?.seo?.twitter?.description ||
                              post.excerpt}
                          </p>
                          <p className="mt-2 text-xs text-slate-400">
                            card:{" "}
                            {post.meta?.seo?.twitter?.card ||
                              "summary_large_image"}
                          </p>
                        </div>
                      </div>
                    </div>
                  </div>
                )}

                {/* ---- META TAB ---- */}
                {activeTab === "meta" && (
                  <div className="space-y-1">
                    <MetaRow
                      label="Schema Type"
                      value={post.meta?.seo?.schema_type}
                    />
                    <MetaRow
                      label="Breadcrumb Title"
                      value={post.meta?.seo?.breadcrumb_title}
                    />
                    <MetaRow
                      label="نام نویسنده"
                      value={
                        post.meta?.seo?.author_name ||
                        post.author_name ||
                        post.author?.name ||
                        "ناشناس"
                      }
                    />
                    <MetaRow
                      label="Author URL"
                      value={post.meta?.seo?.author_url}
                      dir="ltr"
                    />
                    <MetaRow
                      label="Featured Image Alt"
                      value={post.meta?.seo?.featured_image_alt}
                    />
                    <MetaRow
                      label="Featured Image Caption"
                      value={post.meta?.seo?.featured_image_caption}
                    />
                    <MetaRow
                      label="Sitemap Priority"
                      value={post.meta?.seo?.sitemap_priority}
                    />
                    <MetaRow
                      label="Change Frequency"
                      value={post.meta?.seo?.sitemap_change_frequency}
                    />
                    <MetaRow
                      label="Meta Keywords (legacy)"
                      value={post.meta?.seo?.meta_keywords}
                    />
                  </div>
                )}
              </div>
            </div>
          </div>

          {/* ===================== SIDEBAR ===================== */}
          <aside className="space-y-6">
            {/* Publish box – شبیه وردپرس */}
            <SectionCard title="انتشار" icon={<Calendar className="h-4 w-4" />}>
              <div className="space-y-4 text-sm">
                <div className="flex items-center justify-between">
                  <span className="text-slate-500">وضعیت</span>
                  <span
                    className={`rounded-full border px-2.5 py-0.5 text-xs font-medium ${getVisibilityBadge(
                      post.visibility,
                    )}`}
                  >
                    {getVisibilityLabel(post.visibility)}
                  </span>
                </div>

                <div className="flex items-center justify-between">
                  <span className="text-slate-500">فعال بودن</span>
                  <button
                    type="button"
                    disabled={toggling}
                    onClick={handleToggleActive}
                    className={`relative h-6 w-11 rounded-full transition ${
                      post.is_active ? "bg-indigo-600" : "bg-slate-300"
                    } disabled:opacity-50`}
                  >
                    <span
                      className={`absolute top-0.5 h-5 w-5 rounded-full bg-white shadow transition ${
                        post.is_active ? "right-0.5" : "right-5"
                      }`}
                    />
                  </button>
                </div>

                <div className="flex items-center justify-between">
                  <span className="text-slate-500">تاریخ انتشار</span>
                  <span className="text-slate-800">
                    {formatDate(post.published_at)}
                  </span>
                </div>

                <div className="flex items-center justify-between">
                  <span className="text-slate-500">آخرین ویرایش</span>
                  <span className="text-slate-800">
                    {formatDate(post.updated_at)}
                  </span>
                </div>

                <div className="flex items-center justify-between">
                  <span className="text-slate-500">ایجاد شده</span>
                  <span className="text-slate-800">
                    {formatDate(post.created_at)}
                  </span>
                </div>

                <div className="pt-3 border-t border-slate-100 space-y-2">
                  <Link
                    href={`/panel/posts/${post.id}/edit`}
                    className="flex w-full items-center justify-center gap-2 rounded-lg bg-indigo-600 py-2.5 text-sm font-medium text-white hover:bg-indigo-700"
                  >
                    <Edit3 className="h-4 w-4" />
                    ویرایش مقاله
                  </Link>
                  <a
                    href={`/blog/${post.slug}`}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="flex w-full items-center justify-center gap-2 rounded-lg border border-slate-200 py-2.5 text-sm text-slate-700 hover:bg-slate-50"
                  >
                    <ExternalLink className="h-4 w-4" />
                    مشاهده در سایت
                  </a>
                  <button
                    type="button"
                    disabled={deleting}
                    onClick={handleDelete}
                    className="flex w-full items-center justify-center gap-2 rounded-lg border border-red-200 py-2.5 text-sm text-red-600 hover:bg-red-50 disabled:opacity-50"
                  >
                    {deleting ? (
                      <Loader2 className="h-4 w-4 animate-spin" />
                    ) : (
                      <Trash2 className="h-4 w-4" />
                    )}
                    حذف دائمی
                  </button>
                </div>
              </div>
            </SectionCard>

            {/* SEO Score box */}
            <SectionCard title="وضعیت SEO" icon={<Hash className="h-4 w-4" />}>
              <div className="flex items-center gap-3">
                <div
                  className={`flex h-14 w-14 shrink-0 items-center justify-center rounded-xl border text-xl font-bold ${getSeoBadge(
                    seoScore,
                  )}`}
                >
                  {seoScore}
                </div>
                <div>
                  <p className="font-medium text-slate-800">
                    {getSeoStatus(seoScore)}
                  </p>
                  <p className="text-xs text-slate-500 mt-0.5">از ۱۰۰ امتیاز</p>
                </div>
              </div>
              <div className="mt-4 h-2 overflow-hidden rounded-full bg-slate-100">
                <div
                  className={`h-full ${getSeoBarColor(seoScore)}`}
                  style={{ width: `${seoScore}%` }}
                />
              </div>
            </SectionCard>

            {/* Category & Author */}
            <SectionCard
              title="اطلاعات پایه"
              icon={<User className="h-4 w-4" />}
            >
              <div className="space-y-3 text-sm">
                <div className="flex justify-between">
                  <span className="text-slate-500">دسته‌بندی</span>
                  <span className="font-medium text-slate-800">
                    {post.category_title || post.category?.title || "بدون دسته"}
                  </span>
                </div>
                <div className="flex justify-between">
                  <span className="text-slate-500">نویسنده</span>
                  <span className="font-medium text-slate-800">
                    {post.author_name ||
                      post.meta?.seo?.author_name ||
                      post.author?.name ||
                      "—"}
                  </span>
                </div>
                <div className="flex justify-between">
                  <span className="text-slate-500">Slug</span>
                  <span className="font-mono text-xs text-slate-600" dir="ltr">
                    {post.slug}
                  </span>
                </div>
              </div>
            </SectionCard>

            {/* Stats */}
            <SectionCard
              title="آمار محتوا"
              icon={<Clock className="h-4 w-4" />}
            >
              <div className="grid grid-cols-2 gap-3">
                <div className="rounded-xl bg-slate-50 p-3 text-center">
                  <p className="text-lg font-bold text-slate-800">
                    {post.meta?.seo?.word_count ?? 0}
                  </p>
                  <p className="text-[11px] text-slate-500">کلمه</p>
                </div>
                <div className="rounded-xl bg-slate-50 p-3 text-center">
                  <p className="text-lg font-bold text-slate-800">
                    {post.meta?.seo?.reading_time ?? 0}
                  </p>
                  <p className="text-[11px] text-slate-500">دقیقه مطالعه</p>
                </div>
              </div>
            </SectionCard>

            {/* Featured image small */}
            {post.featured_image && (
              <SectionCard
                title="تصویر شاخص"
                icon={<ImageIcon className="h-4 w-4" />}
              >
                <img
                  src={post.featured_image}
                  alt={post.meta?.seo?.featured_image_alt || post.title}
                  className="w-full rounded-xl object-cover aspect-video"
                />
                {post.meta?.seo?.featured_image_alt && (
                  <p className="mt-2 text-xs text-slate-500">
                    Alt: {post.meta?.seo?.featured_image_alt}
                  </p>
                )}
              </SectionCard>
            )}
          </aside>
        </div>
      </main>
    </div>
  );
}

PostDetailPage.layout = (page: React.ReactNode) => (
  <AppLayout>{page}</AppLayout>
);
