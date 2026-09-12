import { useToast } from "@/components/ui/Toastalert";
import AppLayout from "@/layouts/AppLayout";
import PanelLayout from "@/layouts/PanelLayout";
import { Head, Link } from "@inertiajs/react";
import { XIcon } from "lucide-react";
import React, { useEffect, useMemo, useState } from "react";

/* -------------------------------------------------------------------------- */
/* Types                                                                      */
/* -------------------------------------------------------------------------- */

type Visibility = "general" | "private" | "limited" | "draft";

interface Post {
  id: number;
  title: string;
  slug: string;
  excerpt: string;
  featured_image: string;
  category_id: number;
  category_title: string;
  visibility: Visibility;
  published_at: string;
  is_active: boolean;
  author_name: string;
  word_count: number;
  reading_time: number;
  seo_score: number;
  created_at: string;
  updated_at: string;
}

/* -------------------------------------------------------------------------- */
/* Mock data (replace with API later)                                         */
/* -------------------------------------------------------------------------- */

const MOCK_POSTS: Post[] = [
  {
    id: 1,
    title: "آموزش کامل Laravel 13 برای توسعه‌دهندگان بک‌اند",
    slug: "laravel-13-complete-guide",
    excerpt:
      "در این مقاله به صورت جامع Laravel 13 را از صفر تا صد بررسی می‌کنیم.",
    featured_image:
      "http://localhost:8000/storage/posts/images/fb5868c2-c050-4e4f-9b28-798e07bb8fc3.png",
    category_id: 1,
    category_title: "برنامه‌نویسی",
    visibility: "general",
    published_at: "2026-09-10T14:30",
    is_active: true,
    author_name: "علی رضایی",
    word_count: 1850,
    reading_time: 9,
    seo_score: 88,
    created_at: "2026-09-08T10:00",
    updated_at: "2026-09-10T14:30",
  },
  {
    id: 2,
    title: "بهینه‌سازی SEO در React و Next.js",
    slug: "seo-optimization-react-nextjs",
    excerpt: "راهنمای عملی برای بهبود سئو اپلیکیشن‌های React و Next.js.",
    featured_image:
      "http://localhost:8000/storage/posts/images/fb5868c2-c050-4e4f-9b28-798e07bb8fc3.png",
    category_id: 2,
    category_title: "سئو",
    visibility: "general",
    published_at: "2026-09-05T09:15",
    is_active: true,
    author_name: "سارا محمدی",
    word_count: 1240,
    reading_time: 6,
    seo_score: 92,
    created_at: "2026-09-03T16:20",
    updated_at: "2026-09-05T09:15",
  },
  {
    id: 3,
    title: "مقایسه TypeScript و JavaScript در پروژه‌های بزرگ",
    slug: "typescript-vs-javascript",
    excerpt: "چرا TypeScript برای پروژه‌های مقیاس بزرگ انتخاب بهتری است؟",
    featured_image: "",
    category_id: 1,
    category_title: "برنامه‌نویسی",
    visibility: "draft",
    published_at: "",
    is_active: true,
    author_name: "علی رضایی",
    word_count: 680,
    reading_time: 4,
    seo_score: 45,
    created_at: "2026-09-11T11:40",
    updated_at: "2026-09-11T18:00",
  },
  {
    id: 4,
    title: "طراحی سیستم‌های مقیاس‌پذیر با NestJS",
    slug: "scalable-systems-nestjs",
    excerpt: "معماری و الگوهای طراحی برای ساخت بک‌اند حرفه‌ای با NestJS.",
    featured_image:
      "http://localhost:8000/storage/posts/images/fb5868c2-c050-4e4f-9b28-798e07bb8fc3.png",
    category_id: 1,
    category_title: "برنامه‌نویسی",
    visibility: "private",
    published_at: "2026-08-28T20:00",
    is_active: true,
    author_name: "محمد کریمی",
    word_count: 2100,
    reading_time: 11,
    seo_score: 76,
    created_at: "2026-08-25T09:00",
    updated_at: "2026-08-28T20:00",
  },
  {
    id: 5,
    title: "راهنمای کامل Tailwind CSS برای طراحی سریع",
    slug: "tailwind-css-complete-guide",
    excerpt: "چگونه با Tailwind CSS رابط کاربری سریع و تمیز بسازیم.",
    featured_image: "",
    category_id: 3,
    category_title: "فرانت‌اند",
    visibility: "limited",
    published_at: "2026-09-01T12:00",
    is_active: false,
    author_name: "سارا محمدی",
    word_count: 950,
    reading_time: 5,
    seo_score: 61,
    created_at: "2026-08-30T14:10",
    updated_at: "2026-09-01T12:00",
  },
  {
    id: 6,
    title: "مدیریت state در اپلیکیشن‌های بزرگ React",
    slug: "state-management-large-react-apps",
    excerpt: "مقایسه Redux، Zustand، Jotai و Context API.",
    featured_image: "",
    category_id: 3,
    category_title: "فرانت‌اند",
    visibility: "draft",
    published_at: "",
    is_active: true,
    author_name: "علی رضایی",
    word_count: 420,
    reading_time: 2,
    seo_score: 28,
    created_at: "2026-09-12T08:15",
    updated_at: "2026-09-12T08:15",
  },
];

const CATEGORIES = [
  { id: 0, title: "همه دسته‌ها" },
  { id: 1, title: "برنامه‌نویسی" },
  { id: 2, title: "سئو" },
  { id: 3, title: "فرانت‌اند" },
];

/* -------------------------------------------------------------------------- */
/* Helpers                                                                    */
/* -------------------------------------------------------------------------- */

function formatDate(dateStr: string) {
  if (!dateStr) return "—";
  try {
    return new Date(dateStr).toLocaleDateString("fa-IR", {
      year: "numeric",
      month: "short",
      day: "numeric",
      hour: "2-digit",
      minute: "2-digit",
    });
  } catch {
    return dateStr;
  }
}

function getVisibilityLabel(v: Visibility) {
  switch (v) {
    case "general":
      return "عمومی";
    case "private":
      return "خصوصی";
    case "limited":
      return "محدود";
    case "draft":
      return "پیش‌نویس";
    default:
      return v;
  }
}

function getVisibilityBadge(v: Visibility) {
  switch (v) {
    case "general":
      return "bg-emerald-50 text-emerald-700 border-emerald-200";
    case "private":
      return "bg-slate-100 text-slate-600 border-slate-200";
    case "limited":
      return "bg-amber-50 text-amber-700 border-amber-200";
    case "draft":
      return "bg-blue-50 text-blue-700 border-blue-200";
    default:
      return "bg-slate-100 text-slate-600";
  }
}

function getSeoBadge(score: number) {
  if (score >= 85) return "bg-emerald-50 text-emerald-700";
  if (score >= 70) return "bg-blue-50 text-blue-700";
  if (score >= 50) return "bg-amber-50 text-amber-700";
  return "bg-red-50 text-red-700";
}

function getSeoStatus(score: number) {
  if (score >= 85) return "عالی";
  if (score >= 70) return "خوب";
  if (score >= 50) return "متوسط";
  return "ضعیف";
}

/* -------------------------------------------------------------------------- */
/* Small UI pieces                                                            */
/* -------------------------------------------------------------------------- */

function StatCard({
  label,
  value,
  color,
}: {
  label: string;
  value: number;
  color: string;
}) {
  return (
    <div className="rounded-2xl border border-slate-200 bg-white p-5 shadow-sm">
      <p className="text-xs text-slate-500">{label}</p>
      <p className={`mt-1 text-2xl font-bold ${color}`}>{value}</p>
    </div>
  );
}

/* -------------------------------------------------------------------------- */
/* Main component                                                             */
/* -------------------------------------------------------------------------- */

export default function PostsListPage() {
  const toast = useToast();
  const [posts, setPosts] = useState<Post[]>(MOCK_POSTS);
  const [search, setSearch] = useState("");
  const [statusFilter, setStatusFilter] = useState<Visibility | "all">("all");
  const [categoryFilter, setCategoryFilter] = useState(0);
  const [activeOnly, setActiveOnly] = useState(false);
  const [selectedIds, setSelectedIds] = useState<number[]>([]);
  const [viewMode, setViewMode] = useState<"table" | "cards">("table");
  const [sortBy, setSortBy] = useState<"updated_at" | "seo_score" | "title">(
    "updated_at",
  );
  const [sortDir, setSortDir] = useState<"asc" | "desc">("desc");

  /* ---------------------------- Fetch Post Lists ----------------------------- */
  const [postsList, setPostsList] = useState<Post[]>([]);
  const [loading, setLoading] = useState(true);
  useEffect(() => {
    const fetchPosts = async () => {
      try {
        setLoading(true);

        const res = await fetch("/api/v1/posts");

        if (!res.ok) {
          throw new Error("خطا در دریافت مقالات");
        }

        const data = await res.json();

        if (data?.success && Array.isArray(data.data)) {
          setPostsList(data.data);
        } else {
          throw new Error(data?.message || "داده نامعتبر از سرور دریافت شد");
        }
      } catch (err) {
        console.error(err);

        toast.error(
          err instanceof Error ? err.message : "خطا در برقراری ارتباط با سرور",
        );
      } finally {
        setLoading(false);
      }
    };

    fetchPosts();
  }, []);

  /* ---------------------------- Derived data ----------------------------- */

  const filteredPosts = useMemo(() => {
    let result = [...postsList];

    if (search.trim()) {
      const q = search.trim().toLowerCase();
      result = result.filter(
        (p) =>
          p.title.toLowerCase().includes(q) ||
          p.slug.toLowerCase().includes(q) ||
          p.excerpt.toLowerCase().includes(q) ||
          (p.author_name || "").toLowerCase().includes(q),
      );
    }

    if (statusFilter !== "all") {
      result = result.filter((p) => p.visibility === statusFilter);
    }

    if (categoryFilter > 0) {
      result = result.filter((p) => p.category_id === categoryFilter);
    }

    if (activeOnly) {
      result = result.filter((p) => p.is_active);
    }

    result.sort((a, b) => {
      let cmp = 0;
      if (sortBy === "title") {
        cmp = a.title.localeCompare(b.title, "fa");
      } else if (sortBy === "seo_score") {
        cmp = a.seo_score - b.seo_score;
      } else {
        cmp =
          new Date(a.updated_at).getTime() - new Date(b.updated_at).getTime();
      }
      return sortDir === "asc" ? cmp : -cmp;
    });

    return result;
  }, [
    postsList,
    search,
    statusFilter,
    categoryFilter,
    activeOnly,
    sortBy,
    sortDir,
  ]);

  const stats = useMemo(() => {
    return {
      total: postsList.length,
      published: postsList.filter((p) => p.visibility === "general").length,
      drafts: postsList.filter((p) => p.visibility === "draft").length,
      private: postsList.filter((p) => p.visibility === "private").length,
      limited: postsList.filter((p) => p.visibility === "limited").length,
    };
  }, [postsList]);

  /* ---------------------------- Actions --------------------------------- */

  const toggleSelect = (id: number) => {
    setSelectedIds((prev) =>
      prev.includes(id) ? prev.filter((x) => x !== id) : [...prev, id],
    );
  };

  const toggleSelectAll = () => {
    if (selectedIds.length === filteredPosts.length) {
      setSelectedIds([]);
    } else {
      setSelectedIds(filteredPosts.map((p) => p.id));
    }
  };

  const handleBulkDelete = () => {
    if (selectedIds.length === 0) return;
    const ok = window.confirm(
      `آیا از حذف ${selectedIds.length} مقاله مطمئن هستید؟`,
    );
    if (!ok) return;
    setPosts((prev) => prev.filter((p) => !selectedIds.includes(p.id)));
    setSelectedIds([]);
  };

  const handleDelete = (id: number) => {
    const ok = window.confirm("آیا از حذف این مقاله مطمئن هستید؟");
    if (!ok) return;
    setPosts((prev) => prev.filter((p) => p.id !== id));
    setSelectedIds((prev) => prev.filter((x) => x !== id));
  };

  const handleToggleActive = async (post: Post) => {
    const newStatus = !post.is_active;

    try {
      const res = await fetch(`/api/v1/posts/${post.id}/status`, {
        method: "PATCH",
        headers: {
          "Content-Type": "application/json",
          Accept: "application/json",
        },
        credentials: "include",
        body: JSON.stringify({
          is_active: newStatus,
        }),
      });

      const data = await res.json();

      if (!res.ok) {
        throw new Error(data?.message || "تغییر وضعیت پست ناموفق بود.");
      }

      setPostsList((prev) =>
        prev.map((p) =>
          p.id === post.id
            ? {
                ...p,
                is_active: data.data.is_active,
              }
            : p,
        ),
      );

      toast.success(data.message || "وضعیت پست تغییر کرد.");
    } catch (error) {
      toast.error(
        error instanceof Error ? error.message : "خطا در تغییر وضعیت پست",
      );
    }
  };

  const handleChangeStatus = (id: number, visibility: Visibility) => {
    setPosts((prev) =>
      prev.map((p) => (p.id === id ? { ...p, visibility } : p)),
    );
  };

  /* ---------------------------- Render ---------------------------------- */

  return (
    <>
      <Head>
        <title>Your page title</title>
        <meta name="description" content="Your page description" />
      </Head>

      <PanelLayout title="مقالات">
        <div dir="rtl" className="min-h-screen bg-slate-100 text-slate-900">
          {/* Header */}
          <header className="sticky top-0 z-30 border-b border-slate-200 bg-white/95 backdrop-blur">
            <div className="mx-auto flex h-16 max-w-7xl items-center justify-between px-4 sm:px-6 lg:px-8">
              <div>
                <div className="flex items-center gap-3">
                  <h1 className="text-lg font-bold">مدیریت مقالات</h1>
                  <span className="rounded-full bg-indigo-50 px-2.5 py-1 text-xs font-medium text-indigo-700">
                    CMS
                  </span>
                </div>
                <p className="mt-0.5 text-xs text-slate-500">
                  پنل مدیریت محتوا • مشابه وردپرس
                </p>
              </div>

              <div className="flex items-center gap-2">
                <Link
                  href="/panel/posts/create"
                  className="flex items-center gap-2 rounded-lg bg-indigo-600 px-5 py-2.5 text-sm font-medium text-white shadow-sm transition hover:bg-indigo-700"
                >
                  <span className="text-lg leading-none">+</span>
                  مقاله جدید
                </Link>
              </div>
            </div>
          </header>

          <main className="mx-auto max-w-7xl px-4 py-8 sm:px-6 lg:px-8">
            {/* Stats */}
            <div className="mb-8 grid grid-cols-2 gap-4 sm:grid-cols-3 lg:grid-cols-5">
              <StatCard
                label="کل مقالات"
                value={stats.total}
                color="text-slate-800"
              />
              <StatCard
                label="منتشر شده"
                value={stats.published}
                color="text-emerald-600"
              />
              <StatCard
                label="پیش‌نویس"
                value={stats.drafts}
                color="text-blue-600"
              />
              <StatCard
                label="خصوصی"
                value={stats.private}
                color="text-slate-600"
              />
              <StatCard
                label="محدود"
                value={stats.limited}
                color="text-amber-600"
              />
            </div>

            {/* Filters & Toolbar */}
            <section className="mb-6 rounded-2xl border border-slate-200 bg-white p-5 shadow-sm">
              <div className="flex flex-col gap-4 lg:flex-row lg:items-center lg:justify-between">
                {/* Search */}
                <div className="relative flex-1 max-w-md">
                  <input
                    type="search"
                    value={search}
                    onChange={(e) => setSearch(e.target.value)}
                    placeholder="جستجو در عنوان، نامک، خلاصه یا نویسنده..."
                    className="w-full rounded-xl border border-slate-200 py-2.5 pr-10 pl-4 text-sm outline-none transition focus:border-indigo-400 focus:ring-2 focus:ring-indigo-500/20"
                  />
                  <span className="pointer-events-none absolute right-3 top-1/2 -translate-y-1/2 text-slate-400">
                    🔍
                  </span>
                </div>

                <div className="flex flex-wrap items-center gap-3">
                  {/* Status filter */}
                  <select
                    value={statusFilter}
                    onChange={(e) =>
                      setStatusFilter(e.target.value as Visibility | "all")
                    }
                    className="rounded-lg border border-slate-200 px-3 py-2 text-sm outline-none focus:border-indigo-400"
                  >
                    <option value="all">همه وضعیت‌ها</option>
                    <option value="general">عمومی</option>
                    <option value="draft">پیش‌نویس</option>
                    <option value="private">خصوصی</option>
                    <option value="limited">محدود</option>
                  </select>

                  {/* Category filter */}
                  <select
                    value={categoryFilter}
                    onChange={(e) => setCategoryFilter(Number(e.target.value))}
                    className="rounded-lg border border-slate-200 px-3 py-2 text-sm outline-none focus:border-indigo-400"
                  >
                    {CATEGORIES.map((c) => (
                      <option key={c.id} value={c.id}>
                        {c.title}
                      </option>
                    ))}
                  </select>

                  {/* Active only */}
                  <label className="flex items-center gap-2 text-sm text-slate-600">
                    <input
                      type="checkbox"
                      checked={activeOnly}
                      onChange={(e) => setActiveOnly(e.target.checked)}
                      className="rounded border-slate-300 text-indigo-600 focus:ring-indigo-500"
                    />
                    فقط فعال‌ها
                  </label>

                  {/* View mode */}
                  <div className="flex overflow-hidden rounded-lg border border-slate-200">
                    <button
                      type="button"
                      onClick={() => setViewMode("table")}
                      className={`px-3 py-2 text-sm ${
                        viewMode === "table"
                          ? "bg-indigo-50 text-indigo-700"
                          : "bg-white text-slate-500 hover:bg-slate-50"
                      }`}
                    >
                      جدول
                    </button>
                    <button
                      type="button"
                      onClick={() => setViewMode("cards")}
                      className={`px-3 py-2 text-sm ${
                        viewMode === "cards"
                          ? "bg-indigo-50 text-indigo-700"
                          : "bg-white text-slate-500 hover:bg-slate-50"
                      }`}
                    >
                      کارت
                    </button>
                  </div>
                </div>
              </div>

              {/* Bulk actions */}
              {selectedIds.length > 0 && (
                <div className="mt-4 flex items-center gap-3 rounded-xl border border-indigo-100 bg-indigo-50/60 px-4 py-3">
                  <span className="text-sm font-medium text-indigo-800">
                    {selectedIds.length} مورد انتخاب شده
                  </span>
                  <button
                    type="button"
                    onClick={handleBulkDelete}
                    className="rounded-lg bg-red-100 px-3 py-1.5 text-xs font-medium text-red-700 hover:bg-red-200"
                  >
                    حذف گروهی
                  </button>
                  <button
                    type="button"
                    onClick={() => setSelectedIds([])}
                    className="text-xs text-slate-500 hover:text-slate-700"
                  >
                    لغو انتخاب
                  </button>
                </div>
              )}
            </section>

            {/* Results count + Sort */}
            <div className="mb-4 flex items-center justify-between">
              <p className="text-sm text-slate-500">
                نمایش {filteredPosts.length} از {posts.length} مقاله
              </p>

              <div className="flex items-center gap-2 text-sm">
                <span className="text-slate-500">مرتب‌سازی:</span>
                <select
                  value={sortBy}
                  onChange={(e) =>
                    setSortBy(
                      e.target.value as "updated_at" | "seo_score" | "title",
                    )
                  }
                  className="rounded-lg border border-slate-200 px-2.5 py-1.5 text-sm"
                >
                  <option value="updated_at">آخرین ویرایش</option>
                  <option value="seo_score">امتیاز SEO</option>
                  <option value="title">عنوان</option>
                </select>
                <button
                  type="button"
                  onClick={() =>
                    setSortDir((d) => (d === "asc" ? "desc" : "asc"))
                  }
                  className="rounded-lg border border-slate-200 px-2.5 py-1.5 text-sm hover:bg-slate-50"
                >
                  {sortDir === "asc" ? "↑ صعودی" : "↓ نزولی"}
                </button>
              </div>
            </div>

            {/* Content */}
            {loading ? (
              <div>Loading...</div>
            ) : filteredPosts.length === 0 ? (
              <div className="rounded-2xl border border-dashed border-slate-300 bg-white py-20 text-center">
                <p className="text-lg font-medium text-slate-600">
                  مقاله‌ای یافت نشد
                </p>
                <p className="mt-2 text-sm text-slate-400">
                  فیلترها را تغییر دهید یا مقاله جدیدی بسازید.
                </p>
                <button
                  type="button"
                  onClick={() => {
                    window.location.href = "/posts/create";
                  }}
                  className="mt-6 rounded-lg bg-indigo-600 px-5 py-2.5 text-sm font-medium text-white hover:bg-indigo-700"
                >
                  ساخت مقاله جدید
                </button>
              </div>
            ) : viewMode === "table" ? (
              /* ===================== TABLE VIEW ===================== */
              <div className="overflow-hidden rounded-2xl border border-slate-200 bg-white shadow-sm">
                <div className="overflow-x-auto">
                  <table className="w-full text-sm">
                    <thead>
                      <tr className="border-b border-slate-200 bg-slate-50 text-right text-xs font-medium text-slate-500">
                        <th className="w-10 px-4 py-3">
                          <input
                            type="checkbox"
                            checked={
                              filteredPosts.length > 0 &&
                              selectedIds.length === filteredPosts.length
                            }
                            onChange={toggleSelectAll}
                            className="rounded border-slate-300 text-indigo-600"
                          />
                        </th>
                        <th className="px-4 py-3">عنوان</th>
                        <th className="px-4 py-3">وضعیت</th>
                        <th className="px-4 py-3">دسته</th>
                        <th className="px-4 py-3">SEO</th>
                        <th className="px-4 py-3">نویسنده</th>
                        <th className="px-4 py-3">آخرین ویرایش</th>
                        <th className="px-4 py-3 text-left">عملیات</th>
                      </tr>
                    </thead>
                    <tbody className="divide-y divide-slate-100">
                      {filteredPosts.map((post) => (
                        <tr
                          key={post.id}
                          className={`transition hover:bg-slate-50/80 ${
                            selectedIds.includes(post.id)
                              ? "bg-indigo-50/40"
                              : ""
                          }`}
                        >
                          <td className="px-4 py-3">
                            <input
                              type="checkbox"
                              checked={selectedIds.includes(post.id)}
                              onChange={() => toggleSelect(post.id)}
                              className="rounded border-slate-300 text-indigo-600"
                            />
                          </td>

                          <td className="px-4 py-3">
                            <div className="flex items-start gap-3">
                              {post.featured_image ? (
                                <img
                                  src={post.featured_image}
                                  alt=""
                                  className="h-12 w-16 shrink-0 rounded-lg object-cover"
                                />
                              ) : (
                                <div className="flex h-12 w-16 shrink-0 items-center justify-center rounded-lg bg-slate-100 text-xs text-slate-400">
                                  بدون تصویر
                                </div>
                              )}
                              <div className="min-w-0">
                                <p className="font-medium text-slate-800 line-clamp-1">
                                  {post.title}
                                </p>
                                <p
                                  className="mt-0.5 text-xs text-slate-400"
                                  dir="ltr"
                                >
                                  /{post.slug}
                                </p>
                                <div className="mt-1 flex items-center gap-2 text-[11px] text-slate-400">
                                  <span>{post.word_count} کلمه</span>
                                  <span>•</span>
                                  <span>{post.reading_time} دقیقه</span>
                                  {!post.is_active && (
                                    <>
                                      <span>•</span>
                                      <span className="text-red-500">
                                        غیرفعال
                                      </span>
                                    </>
                                  )}
                                </div>
                              </div>
                            </div>
                          </td>

                          <td className="px-4 py-3">
                            <span
                              className={`inline-flex rounded-full border px-2.5 py-1 text-xs font-medium ${getVisibilityBadge(
                                post.visibility,
                              )}`}
                            >
                              {getVisibilityLabel(post.visibility)}
                            </span>
                          </td>

                          <td className="px-4 py-3 text-slate-600">
                            {post.category_title || (
                              <XIcon className="size-5 text-rose-500" />
                            )}
                          </td>

                          <td className="px-4 py-3">
                            <div className="flex items-center gap-2">
                              <span
                                className={`inline-flex h-7 w-10 items-center justify-center rounded-lg text-xs font-bold ${getSeoBadge(
                                  post.seo_score,
                                )}`}
                              >
                                {post.seo_score}
                              </span>
                              <span className="text-[11px] text-slate-400">
                                {getSeoStatus(post.seo_score)}
                              </span>
                            </div>
                          </td>

                          <td className="px-4 py-3 text-slate-600">
                            {post.author_name}
                          </td>

                          <td className="px-4 py-3 text-xs text-slate-500">
                            {formatDate(post.updated_at)}
                          </td>

                          <td className="px-4 py-3">
                            <div className="flex items-center justify-end gap-1">
                              <button
                                type="button"
                                title="ویرایش"
                                onClick={() => {
                                  // Navigate to edit page
                                  window.location.href = `/posts/${post.id}/edit`;
                                }}
                                className="rounded-lg px-2.5 py-1.5 text-xs text-slate-600 hover:bg-slate-100 hover:text-indigo-600"
                              >
                                ویرایش
                              </button>
                              <Link
                                href={`/panel/posts/${post.id}/show`}
                                title="مشاهده جزئیات"
                                className="rounded-lg px-2.5 py-1.5 text-xs text-slate-600 hover:bg-slate-100 hover:text-indigo-600"
                              >
                                مشاهده
                              </Link>
                              <button
                                type="button"
                                title={
                                  post.is_active ? "غیرفعال کردن" : "فعال کردن"
                                }
                                onClick={() => handleToggleActive(post)}
                                className="rounded-lg px-2.5 py-1.5 text-xs text-slate-600 hover:bg-slate-100"
                              >
                                {post.is_active ? "غیرفعال" : "فعال"}
                              </button>
                              <button
                                type="button"
                                title="حذف"
                                onClick={() => handleDelete(post.id)}
                                className="rounded-lg px-2.5 py-1.5 text-xs text-red-600 hover:bg-red-5 0"
                              >
                                حذف
                              </button>
                            </div>
                          </td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
              </div>
            ) : (
              /* ===================== CARDS VIEW ===================== */
              <div className="grid grid-cols-1 gap-5 sm:grid-cols-2 xl:grid-cols-3">
                {filteredPosts.map((post) => (
                  <article
                    key={post.id}
                    className={`group overflow-hidden rounded-2xl border bg-white shadow-sm transition hover:shadow-md ${
                      selectedIds.includes(post.id)
                        ? "border-indigo-300 ring-2 ring-indigo-100"
                        : "border-slate-200"
                    }`}
                  >
                    {/* Image */}
                    <div className="relative h-40 bg-slate-100">
                      {post.featured_image ? (
                        <img
                          src={post.featured_image}
                          alt={post.title}
                          className="h-full w-full object-cover"
                        />
                      ) : (
                        <div className="flex h-full items-center justify-center text-sm text-slate-400">
                          بدون تصویر شاخص
                        </div>
                      )}

                      <div className="absolute left-3 top-3">
                        <input
                          type="checkbox"
                          checked={selectedIds.includes(post.id)}
                          onChange={() => toggleSelect(post.id)}
                          className="h-4 w-4 rounded border-white/80 bg-white/90 text-indigo-600 shadow"
                        />
                      </div>

                      <div className="absolute right-3 top-3">
                        <span
                          className={`inline-flex rounded-full border px-2.5 py-1 text-xs font-medium backdrop-blur ${getVisibilityBadge(
                            post.visibility,
                          )}`}
                        >
                          {getVisibilityLabel(post.visibility)}
                        </span>
                      </div>
                    </div>

                    {/* Body */}
                    <div className="p-5">
                      <div className="mb-2 flex items-center justify-between gap-2">
                        <span className="text-xs text-slate-400">
                          {post.category_title}
                        </span>
                        <span
                          className={`inline-flex h-6 min-w-[2.25rem] items-center justify-center rounded-md px-1.5 text-xs font-bold ${getSeoBadge(
                            post.seo_score,
                          )}`}
                        >
                          {post.seo_score}
                        </span>
                      </div>

                      <h3 className="line-clamp-2 text-base font-semibold text-slate-800 group-hover:text-indigo-700">
                        {post.title}
                      </h3>

                      <p className="mt-2 line-clamp-2 text-xs leading-5 text-slate-500">
                        {post.excerpt || "بدون خلاصه"}
                      </p>

                      <div className="mt-4 flex items-center justify-between text-xs text-slate-400">
                        <span>{post.author_name}</span>
                        <span>{formatDate(post.updated_at)}</span>
                      </div>

                      <div className="mt-4 flex items-center gap-2 border-t border-slate-100 pt-4">
                        <button
                          type="button"
                          onClick={() => {
                            window.location.href = `/posts/${post.id}/edit`;
                          }}
                          className="flex-1 rounded-lg bg-slate-100 py-2 text-xs font-medium text-slate-700 hover:bg-indigo-50 hover:text-indigo-700"
                        >
                          ویرایش
                        </button>
                        <button
                          type="button"
                          onClick={() => handleDelete(post.id)}
                          className="rounded-lg px-3 py-2 text-xs text-red-600 hover:bg-red-50"
                        >
                          حذف
                        </button>
                      </div>
                    </div>
                  </article>
                ))}
              </div>
            )}
          </main>
        </div>
      </PanelLayout>
    </>
  );
}

PostsListPage.layout = (page: React.ReactNode) => <AppLayout>{page}</AppLayout>;
