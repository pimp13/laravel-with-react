import PanelLayout from "@/layouts/PanelLayout";
import { Link } from "@inertiajs/react";
import {
  ChevronDown,
  FolderTree,
  MoreHorizontal,
  Plus,
  Search,
  Trash2,
} from "lucide-react";
import React, { useMemo, useState } from "react";

/* -------------------------------------------------------------------------- */
/* Types                                                                      */
/* -------------------------------------------------------------------------- */

interface Category {
  id: number;
  title: string;
  slug: string;
  description: string;
  parent_id: number | null;
  posts_count: number;
  is_active: boolean;
  created_at: string;
}

/* -------------------------------------------------------------------------- */
/* Mock data                                                                  */
/* -------------------------------------------------------------------------- */

const MOCK_CATEGORIES: Category[] = [
  {
    id: 1,
    title: "برنامه‌نویسی",
    slug: "programming",
    description: "مقالات مربوط به برنامه‌نویسی و توسعه نرم‌افزار",
    parent_id: null,
    posts_count: 18,
    is_active: true,
    created_at: "2025-04-10T10:00:00",
  },
  {
    id: 2,
    title: "سئو",
    slug: "seo",
    description: "بهینه‌سازی موتورهای جستجو",
    parent_id: null,
    posts_count: 9,
    is_active: true,
    created_at: "2025-05-12T14:20:00",
  },
  {
    id: 3,
    title: "فرانت‌اند",
    slug: "frontend",
    description: "React، Vue، Tailwind و ...",
    parent_id: 1,
    posts_count: 7,
    is_active: true,
    created_at: "2025-06-01T09:15:00",
  },
  {
    id: 4,
    title: "بک‌اند",
    slug: "backend",
    description: "Laravel، NestJS، Node.js",
    parent_id: 1,
    posts_count: 11,
    is_active: true,
    created_at: "2025-06-01T09:20:00",
  },
  {
    id: 5,
    title: "طراحی UI/UX",
    slug: "ui-ux",
    description: "",
    parent_id: null,
    posts_count: 4,
    is_active: true,
    created_at: "2025-08-20T16:40:00",
  },
  {
    id: 6,
    title: "DevOps",
    slug: "devops",
    description: "داکر، CI/CD، سرور",
    parent_id: null,
    posts_count: 2,
    is_active: false,
    created_at: "2026-01-15T11:00:00",
  },
];

/* -------------------------------------------------------------------------- */
/* Helpers                                                                    */
/* -------------------------------------------------------------------------- */

function formatDate(dateStr: string) {
  try {
    return new Date(dateStr).toLocaleDateString("fa-IR", {
      year: "numeric",
      month: "short",
      day: "numeric",
    });
  } catch {
    return dateStr;
  }
}

function generateSlug(text: string) {
  return text
    .trim()
    .toLowerCase()
    .replace(/\s+/g, "-")
    .replace(/[^\w\u0600-\u06FF-]+/g, "");
}

/* -------------------------------------------------------------------------- */
/* Component                                                                  */
/* -------------------------------------------------------------------------- */

export default function CategoriesIndexPage() {
  const [categories, setCategories] = useState<Category[]>(MOCK_CATEGORIES);
  const [search, setSearch] = useState("");
  const [selectedIds, setSelectedIds] = useState<number[]>([]);
  const [openActionId, setOpenActionId] = useState<number | null>(null);

  // فرم افزودن دسته
  const [form, setForm] = useState({
    title: "",
    slug: "",
    description: "",
    parent_id: "" as number | "",
  });
  const [slugManual, setSlugManual] = useState(false);

  /* ---------------------------- Derived --------------------------------- */

  const filteredCategories = useMemo(() => {
    let result = [...categories];

    if (search.trim()) {
      const q = search.trim().toLowerCase();
      result = result.filter(
        (c) =>
          c.title.toLowerCase().includes(q) ||
          c.slug.toLowerCase().includes(q) ||
          c.description.toLowerCase().includes(q),
      );
    }

    return result;
  }, [categories, search]);

  // برای نمایش سلسله‌مراتبی
  const parentCategories = categories.filter((c) => c.parent_id === null);

  const getChildren = (parentId: number) =>
    categories.filter((c) => c.parent_id === parentId);

  const getParentTitle = (parentId: number | null) => {
    if (!parentId) return null;
    return categories.find((c) => c.id === parentId)?.title || null;
  };

  /* ---------------------------- Form handlers --------------------------- */

  const handleTitleChange = (value: string) => {
    setForm((prev) => ({
      ...prev,
      title: value,
      slug: slugManual ? prev.slug : generateSlug(value),
    }));
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!form.title.trim()) return;

    // فعلاً فقط UI — بعداً به API وصل می‌شود
    const newCategory: Category = {
      id: Date.now(),
      title: form.title.trim(),
      slug: form.slug.trim() || generateSlug(form.title),
      description: form.description.trim(),
      parent_id: form.parent_id === "" ? null : Number(form.parent_id),
      posts_count: 0,
      is_active: true,
      created_at: new Date().toISOString(),
    };

    setCategories((prev) => [newCategory, ...prev]);
    setForm({ title: "", slug: "", description: "", parent_id: "" });
    setSlugManual(false);
  };

  /* ---------------------------- Selection ------------------------------- */

  const toggleSelect = (id: number) => {
    setSelectedIds((prev) =>
      prev.includes(id) ? prev.filter((x) => x !== id) : [...prev, id],
    );
  };

  const toggleSelectAll = () => {
    if (selectedIds.length === filteredCategories.length) {
      setSelectedIds([]);
    } else {
      setSelectedIds(filteredCategories.map((c) => c.id));
    }
  };

  /* ---------------------------- Render ---------------------------------- */

  return (
    <PanelLayout title="دسته‌ها">
      {/* هدر */}
      <div className="mb-6">
        <h2 className="text-lg font-semibold text-slate-800">دسته‌ها</h2>
        <p className="mt-0.5 text-sm text-slate-500">
          دسته‌بندی نوشته‌ها را مدیریت کنید
        </p>
      </div>

      <div className="grid grid-cols-1 gap-8 xl:grid-cols-3">
        {/* ===================== فرم افزودن دسته (راست) ===================== */}
        <div className="xl:col-span-1">
          <div className="sticky top-24 rounded-xl border border-slate-200 bg-white shadow-sm">
            <div className="border-b border-slate-100 bg-slate-50/80 px-5 py-3.5">
              <h3 className="flex items-center gap-2 text-sm font-semibold text-slate-800">
                <Plus className="h-4 w-4 text-[#2271b1]" />
                افزودن دسته جدید
              </h3>
            </div>

            <form onSubmit={handleSubmit} className="space-y-4 p-5">
              {/* نام */}
              <div>
                <label className="mb-1.5 block text-sm font-medium text-slate-700">
                  نام
                </label>
                <input
                  type="text"
                  value={form.title}
                  onChange={(e) => handleTitleChange(e.target.value)}
                  placeholder="مثلاً برنامه‌نویسی"
                  className="w-full rounded-lg border border-slate-200 px-3 py-2.5 text-sm outline-none focus:border-[#2271b1] focus:ring-2 focus:ring-[#2271b1]/20"
                  required
                />
                <p className="mt-1 text-xs text-slate-400">
                  نامی که در سایت نمایش داده می‌شود.
                </p>
              </div>

              {/* نامک */}
              <div>
                <div className="mb-1.5 flex items-center justify-between">
                  <label className="text-sm font-medium text-slate-700">
                    نامک (Slug)
                  </label>
                  <button
                    type="button"
                    onClick={() => setSlugManual((v) => !v)}
                    className="text-xs text-[#2271b1] hover:underline"
                  >
                    {slugManual ? "تولید خودکار" : "ویرایش دستی"}
                  </button>
                </div>
                <input
                  type="text"
                  value={form.slug}
                  onChange={(e) => {
                    setSlugManual(true);
                    setForm((prev) => ({
                      ...prev,
                      slug: e.target.value.toLowerCase().replace(/\s+/g, "-"),
                    }));
                  }}
                  dir="ltr"
                  className="w-full rounded-lg border border-slate-200 px-3 py-2.5 text-sm outline-none focus:border-[#2271b1] focus:ring-2 focus:ring-[#2271b1]/20"
                />
                <p className="mt-1 text-xs text-slate-400">
                  نسخه URL-friendly نام.
                </p>
              </div>

              {/* دسته مادر */}
              <div>
                <label className="mb-1.5 block text-sm font-medium text-slate-700">
                  دسته مادر
                </label>
                <select
                  value={form.parent_id}
                  onChange={(e) =>
                    setForm((prev) => ({
                      ...prev,
                      parent_id:
                        e.target.value === "" ? "" : Number(e.target.value),
                    }))
                  }
                  className="w-full rounded-lg border border-slate-200 px-3 py-2.5 text-sm outline-none focus:border-[#2271b1]"
                >
                  <option value="">بدون دسته مادر</option>
                  {parentCategories.map((cat) => (
                    <option key={cat.id} value={cat.id}>
                      {cat.title}
                    </option>
                  ))}
                </select>
                <p className="mt-1 text-xs text-slate-400">
                  دسته‌ها می‌توانند سلسله‌مراتبی باشند.
                </p>
              </div>

              {/* توضیحات */}
              <div>
                <label className="mb-1.5 block text-sm font-medium text-slate-700">
                  توضیحات
                </label>
                <textarea
                  value={form.description}
                  onChange={(e) =>
                    setForm((prev) => ({
                      ...prev,
                      description: e.target.value,
                    }))
                  }
                  rows={3}
                  placeholder="توضیح کوتاه درباره این دسته..."
                  className="w-full resize-none rounded-lg border border-slate-200 px-3 py-2.5 text-sm outline-none focus:border-[#2271b1] focus:ring-2 focus:ring-[#2271b1]/20"
                />
                <p className="mt-1 text-xs text-slate-400">
                  اختیاری است. در برخی پوسته‌ها نمایش داده می‌شود.
                </p>
              </div>

              <button
                type="submit"
                className="w-full rounded-lg bg-[#2271b1] py-2.5 text-sm font-medium text-white hover:bg-[#135e96]"
              >
                افزودن دسته جدید
              </button>
            </form>
          </div>
        </div>

        {/* ===================== جدول دسته‌ها (چپ) ===================== */}
        <div className="xl:col-span-2 space-y-4">
          {/* جستجو و عملیات */}
          <div className="rounded-xl border border-slate-200 bg-white p-4 shadow-sm">
            <div className="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
              <div className="relative max-w-xs flex-1">
                <Search className="pointer-events-none absolute right-3 top-1/2 h-4 w-4 -translate-y-1/2 text-slate-400" />
                <input
                  type="search"
                  value={search}
                  onChange={(e) => setSearch(e.target.value)}
                  placeholder="جستجوی دسته..."
                  className="w-full rounded-lg border border-slate-200 py-2 pr-10 pl-3 text-sm outline-none focus:border-[#2271b1] focus:ring-2 focus:ring-[#2271b1]/20"
                />
              </div>

              <p className="text-sm text-slate-500">
                {filteredCategories.length} دسته
              </p>
            </div>

            {selectedIds.length > 0 && (
              <div className="mt-3 flex items-center gap-3 rounded-lg border border-blue-100 bg-blue-50/70 px-4 py-2.5">
                <span className="text-sm font-medium text-blue-800">
                  {selectedIds.length} مورد انتخاب شده
                </span>
                <button
                  type="button"
                  className="rounded-md bg-red-100 px-3 py-1 text-xs font-medium text-red-700 hover:bg-red-200"
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
          </div>

          {/* جدول */}
          <div className="overflow-hidden rounded-xl border border-slate-200 bg-white shadow-sm">
            <div className="overflow-x-auto">
              <table className="w-full text-sm">
                <thead>
                  <tr className="border-b border-slate-200 bg-slate-50 text-right text-xs font-medium text-slate-500">
                    <th className="w-10 px-4 py-3">
                      <input
                        type="checkbox"
                        checked={
                          filteredCategories.length > 0 &&
                          selectedIds.length === filteredCategories.length
                        }
                        onChange={toggleSelectAll}
                        className="rounded border-slate-300 text-[#2271b1]"
                      />
                    </th>
                    <th className="px-4 py-3">نام</th>
                    <th className="px-4 py-3">توضیحات</th>
                    <th className="px-4 py-3">نامک</th>
                    <th className="px-4 py-3">تعداد</th>
                    <th className="px-4 py-3 text-left">عملیات</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-100">
                  {filteredCategories.length === 0 ? (
                    <tr>
                      <td colSpan={6} className="px-4 py-16 text-center">
                        <FolderTree className="mx-auto h-10 w-10 text-slate-300" />
                        <p className="mt-3 text-sm font-medium text-slate-600">
                          دسته‌ای یافت نشد
                        </p>
                        <p className="mt-1 text-xs text-slate-400">
                          اولین دسته را از فرم سمت راست اضافه کنید.
                        </p>
                      </td>
                    </tr>
                  ) : (
                    filteredCategories.map((cat) => {
                      const parentTitle = getParentTitle(cat.parent_id);
                      const isChild = cat.parent_id !== null;

                      return (
                        <tr
                          key={cat.id}
                          className={`transition hover:bg-slate-50/80 ${
                            selectedIds.includes(cat.id) ? "bg-blue-50/40" : ""
                          }`}
                        >
                          <td className="px-4 py-3">
                            <input
                              type="checkbox"
                              checked={selectedIds.includes(cat.id)}
                              onChange={() => toggleSelect(cat.id)}
                              className="rounded border-slate-300 text-[#2271b1]"
                            />
                          </td>

                          {/* نام */}
                          <td className="px-4 py-3">
                            <div
                              className={`flex items-center gap-2 ${isChild ? "pr-5" : ""}`}
                            >
                              {isChild && (
                                <span className="text-slate-300">↳</span>
                              )}
                              <div>
                                <p className="font-medium text-slate-800">
                                  {cat.title}
                                </p>
                                {parentTitle && (
                                  <p className="text-[11px] text-slate-400">
                                    زیرمجموعه «{parentTitle}»
                                  </p>
                                )}
                                {!cat.is_active && (
                                  <span className="mt-0.5 inline-block text-[11px] text-red-500">
                                    غیرفعال
                                  </span>
                                )}
                              </div>
                            </div>
                          </td>

                          {/* توضیحات */}
                          <td className="px-4 py-3 max-w-[200px]">
                            <p className="line-clamp-2 text-xs text-slate-500">
                              {cat.description || (
                                <span className="text-slate-300">—</span>
                              )}
                            </p>
                          </td>

                          {/* نامک */}
                          <td className="px-4 py-3">
                            <span
                              className="font-mono text-xs text-slate-500"
                              dir="ltr"
                            >
                              {cat.slug}
                            </span>
                          </td>

                          {/* تعداد نوشته */}
                          <td className="px-4 py-3">
                            {cat.posts_count > 0 ? (
                              <Link
                                href={`/panel/posts?category=${cat.id}`}
                                className="font-medium text-[#2271b1] hover:underline"
                              >
                                {cat.posts_count}
                              </Link>
                            ) : (
                              <span className="text-slate-400">۰</span>
                            )}
                          </td>

                          {/* عملیات */}
                          <td className="px-4 py-3">
                            <div className="relative flex items-center justify-end gap-1">
                              <button
                                type="button"
                                className="rounded-lg px-2.5 py-1.5 text-xs text-slate-600 hover:bg-slate-100 hover:text-[#2271b1]"
                              >
                                ویرایش
                              </button>
                              <button
                                type="button"
                                onClick={() =>
                                  setOpenActionId(
                                    openActionId === cat.id ? null : cat.id,
                                  )
                                }
                                className="rounded-lg p-1.5 text-slate-400 hover:bg-slate-100 hover:text-slate-600"
                              >
                                <MoreHorizontal className="h-4 w-4" />
                              </button>

                              {openActionId === cat.id && (
                                <>
                                  <div
                                    className="fixed inset-0 z-10"
                                    onClick={() => setOpenActionId(null)}
                                  />
                                  <div className="absolute left-0 top-8 z-20 w-40 overflow-hidden rounded-lg border border-slate-200 bg-white py-1 shadow-lg">
                                    <button
                                      type="button"
                                      className="block w-full px-3 py-2 text-right text-xs text-slate-700 hover:bg-slate-50"
                                    >
                                      مشاهده نوشته‌ها
                                    </button>
                                    <button
                                      type="button"
                                      className="block w-full px-3 py-2 text-right text-xs text-slate-700 hover:bg-slate-50"
                                    >
                                      {cat.is_active
                                        ? "غیرفعال کردن"
                                        : "فعال کردن"}
                                    </button>
                                    <div className="my-1 border-t border-slate-100" />
                                    <button
                                      type="button"
                                      className="flex w-full items-center gap-2 px-3 py-2 text-xs text-red-600 hover:bg-red-50"
                                    >
                                      <Trash2 className="h-3.5 w-3.5" />
                                      حذف دسته
                                    </button>
                                  </div>
                                </>
                              )}
                            </div>
                          </td>
                        </tr>
                      );
                    })
                  )}
                </tbody>
              </table>
            </div>
          </div>

          {/* راهنما */}
          <div className="rounded-xl border border-slate-200 bg-slate-50 px-5 py-4 text-xs leading-6 text-slate-500">
            <p className="font-medium text-slate-700 mb-1">نکته:</p>
            <p>
              با حذف یک دسته، نوشته‌های آن حذف نمی‌شوند. فقط ارتباطشان با این
              دسته قطع می‌شود. دسته‌های فرزند بعد از حذف دسته مادر، به سطح اصلی
              منتقل می‌شوند.
            </p>
          </div>
        </div>
      </div>
    </PanelLayout>
  );
}

CategoriesIndexPage.layout = (page: React.ReactNode) => page;
