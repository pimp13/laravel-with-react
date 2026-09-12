import PanelLayout from "@/layouts/PanelLayout";
import { Link } from "@inertiajs/react";
import {
  CheckCircle2,
  MoreHorizontal,
  Plus,
  Search,
  Shield,
  Trash2,
  User,
  UserPlus,
  XCircle,
} from "lucide-react";
import React, { useMemo, useState } from "react";

/* -------------------------------------------------------------------------- */
/* Types                                                                      */
/* -------------------------------------------------------------------------- */

type UserRole =
  | "administrator"
  | "editor"
  | "author"
  | "contributor"
  | "subscriber";

interface UserItem {
  id: number;
  name: string;
  username: string;
  email: string;
  role: UserRole;
  avatar?: string | null;
  posts_count: number;
  is_active: boolean;
  registered_at: string;
  last_login?: string | null;
}

/* -------------------------------------------------------------------------- */
/* Mock data (بعداً از Inertia props می‌آید)                                  */
/* -------------------------------------------------------------------------- */

const MOCK_USERS: UserItem[] = [
  {
    id: 1,
    name: "علی رضایی",
    username: "alireza",
    email: "ali@example.com",
    role: "administrator",
    avatar: null,
    posts_count: 24,
    is_active: true,
    registered_at: "2025-03-12T10:00:00",
    last_login: "2026-09-12T08:30:00",
  },
  {
    id: 2,
    name: "سارا محمدی",
    username: "sara.m",
    email: "sara@example.com",
    role: "editor",
    avatar: null,
    posts_count: 18,
    is_active: true,
    registered_at: "2025-06-20T14:20:00",
    last_login: "2026-09-11T19:45:00",
  },
  {
    id: 3,
    name: "محمد کریمی",
    username: "mohammadk",
    email: "mohammad@example.com",
    role: "author",
    avatar: null,
    posts_count: 9,
    is_active: true,
    registered_at: "2025-09-05T09:10:00",
    last_login: "2026-09-10T11:20:00",
  },
  {
    id: 4,
    name: "زهرا حسینی",
    username: "zahra.h",
    email: "zahra@example.com",
    role: "contributor",
    avatar: null,
    posts_count: 3,
    is_active: true,
    registered_at: "2026-01-15T16:40:00",
    last_login: "2026-09-08T22:10:00",
  },
  {
    id: 5,
    name: "رضا نوری",
    username: "reza.n",
    email: "reza@example.com",
    role: "subscriber",
    avatar: null,
    posts_count: 0,
    is_active: false,
    registered_at: "2026-04-02T11:00:00",
    last_login: null,
  },
  {
    id: 6,
    name: "مریم اکبری",
    username: "maryam",
    email: "maryam@example.com",
    role: "author",
    avatar: null,
    posts_count: 5,
    is_active: true,
    registered_at: "2026-05-18T13:30:00",
    last_login: "2026-09-12T07:15:00",
  },
];

/* -------------------------------------------------------------------------- */
/* Helpers                                                                    */
/* -------------------------------------------------------------------------- */

const ROLE_LABELS: Record<UserRole, string> = {
  administrator: "مدیر کل",
  editor: "ویرایشگر",
  author: "نویسنده",
  contributor: "مشارکت‌کننده",
  subscriber: "مشترک",
};

const ROLE_COLORS: Record<UserRole, string> = {
  administrator: "bg-rose-50 text-rose-700 border-rose-200",
  editor: "bg-indigo-50 text-indigo-700 border-indigo-200",
  author: "bg-blue-50 text-blue-700 border-blue-200",
  contributor: "bg-amber-50 text-amber-700 border-amber-200",
  subscriber: "bg-slate-100 text-slate-600 border-slate-200",
};

function formatDate(dateStr?: string | null) {
  if (!dateStr) return "—";
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

function getInitials(name: string) {
  return name
    .split(" ")
    .map((n) => n[0])
    .join("")
    .slice(0, 2);
}

/* -------------------------------------------------------------------------- */
/* Component                                                                  */
/* -------------------------------------------------------------------------- */

export default function UsersIndexPage() {
  const [users] = useState<UserItem[]>(MOCK_USERS);
  const [search, setSearch] = useState("");
  const [roleFilter, setRoleFilter] = useState<UserRole | "all">("all");
  const [statusFilter, setStatusFilter] = useState<
    "all" | "active" | "inactive"
  >("all");
  const [selectedIds, setSelectedIds] = useState<number[]>([]);
  const [openActionId, setOpenActionId] = useState<number | null>(null);

  /* ---------------------------- Filtered list --------------------------- */

  const filteredUsers = useMemo(() => {
    let result = [...users];

    if (search.trim()) {
      const q = search.trim().toLowerCase();
      result = result.filter(
        (u) =>
          u.name.toLowerCase().includes(q) ||
          u.username.toLowerCase().includes(q) ||
          u.email.toLowerCase().includes(q),
      );
    }

    if (roleFilter !== "all") {
      result = result.filter((u) => u.role === roleFilter);
    }

    if (statusFilter === "active") {
      result = result.filter((u) => u.is_active);
    } else if (statusFilter === "inactive") {
      result = result.filter((u) => !u.is_active);
    }

    return result;
  }, [users, search, roleFilter, statusFilter]);

  /* ---------------------------- Stats ----------------------------------- */

  const stats = useMemo(() => {
    return {
      total: users.length,
      administrators: users.filter((u) => u.role === "administrator").length,
      editors: users.filter((u) => u.role === "editor").length,
      authors: users.filter((u) => u.role === "author").length,
      active: users.filter((u) => u.is_active).length,
    };
  }, [users]);

  /* ---------------------------- Selection ------------------------------- */

  const toggleSelect = (id: number) => {
    setSelectedIds((prev) =>
      prev.includes(id) ? prev.filter((x) => x !== id) : [...prev, id],
    );
  };

  const toggleSelectAll = () => {
    if (selectedIds.length === filteredUsers.length) {
      setSelectedIds([]);
    } else {
      setSelectedIds(filteredUsers.map((u) => u.id));
    }
  };

  /* ---------------------------- Render ---------------------------------- */

  return (
    <PanelLayout title="کاربران">
      {/* هدر صفحه */}
      <div className="mb-6 flex flex-wrap items-center justify-between gap-4">
        <div>
          <h2 className="text-lg font-semibold text-slate-800">همه کاربران</h2>
          <p className="mt-0.5 text-sm text-slate-500">
            مدیریت کاربران و سطوح دسترسی
          </p>
        </div>

        <Link
          href="/panel/users/create"
          className="inline-flex items-center gap-2 rounded-lg bg-[#2271b1] px-4 py-2.5 text-sm font-medium text-white shadow-sm hover:bg-[#135e96]"
        >
          <UserPlus className="h-4 w-4" />
          افزودن کاربر
        </Link>
      </div>

      {/* آمار سریع */}
      <div className="mb-6 grid grid-cols-2 gap-3 sm:grid-cols-3 lg:grid-cols-5">
        {[
          { label: "کل کاربران", value: stats.total, color: "text-slate-800" },
          {
            label: "مدیر کل",
            value: stats.administrators,
            color: "text-rose-600",
          },
          { label: "ویرایشگر", value: stats.editors, color: "text-indigo-600" },
          { label: "نویسنده", value: stats.authors, color: "text-blue-600" },
          { label: "فعال", value: stats.active, color: "text-emerald-600" },
        ].map((item) => (
          <div
            key={item.label}
            className="rounded-xl border border-slate-200 bg-white px-4 py-3 shadow-sm"
          >
            <p className="text-xs text-slate-500">{item.label}</p>
            <p className={`mt-0.5 text-xl font-bold ${item.color}`}>
              {item.value}
            </p>
          </div>
        ))}
      </div>

      {/* فیلتر و جستجو */}
      <div className="mb-4 rounded-xl border border-slate-200 bg-white p-4 shadow-sm">
        <div className="flex flex-col gap-3 lg:flex-row lg:items-center lg:justify-between">
          {/* جستجو */}
          <div className="relative max-w-sm flex-1">
            <Search className="pointer-events-none absolute right-3 top-1/2 h-4 w-4 -translate-y-1/2 text-slate-400" />
            <input
              type="search"
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              placeholder="جستجو نام، نام کاربری یا ایمیل..."
              className="w-full rounded-lg border border-slate-200 py-2 pr-10 pl-3 text-sm outline-none focus:border-[#2271b1] focus:ring-2 focus:ring-[#2271b1]/20"
            />
          </div>

          <div className="flex flex-wrap items-center gap-2">
            {/* فیلتر نقش */}
            <select
              value={roleFilter}
              onChange={(e) =>
                setRoleFilter(e.target.value as UserRole | "all")
              }
              className="rounded-lg border border-slate-200 px-3 py-2 text-sm outline-none focus:border-[#2271b1]"
            >
              <option value="all">همه نقش‌ها</option>
              <option value="administrator">مدیر کل</option>
              <option value="editor">ویرایشگر</option>
              <option value="author">نویسنده</option>
              <option value="contributor">مشارکت‌کننده</option>
              <option value="subscriber">مشترک</option>
            </select>

            {/* فیلتر وضعیت */}
            <select
              value={statusFilter}
              onChange={(e) =>
                setStatusFilter(e.target.value as "all" | "active" | "inactive")
              }
              className="rounded-lg border border-slate-200 px-3 py-2 text-sm outline-none focus:border-[#2271b1]"
            >
              <option value="all">همه وضعیت‌ها</option>
              <option value="active">فعال</option>
              <option value="inactive">غیرفعال</option>
            </select>
          </div>
        </div>

        {/* عملیات گروهی */}
        {selectedIds.length > 0 && (
          <div className="mt-3 flex items-center gap-3 rounded-lg border border-blue-100 bg-blue-50/70 px-4 py-2.5">
            <span className="text-sm font-medium text-blue-800">
              {selectedIds.length} کاربر انتخاب شده
            </span>
            <button
              type="button"
              className="rounded-md bg-red-100 px-3 py-1 text-xs font-medium text-red-700 hover:bg-red-200"
            >
              حذف گروهی
            </button>
            <button
              type="button"
              className="rounded-md bg-slate-100 px-3 py-1 text-xs font-medium text-slate-700 hover:bg-slate-200"
            >
              تغییر نقش
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

      {/* تعداد نتایج */}
      <p className="mb-3 text-sm text-slate-500">
        نمایش {filteredUsers.length} از {users.length} کاربر
      </p>

      {/* جدول کاربران */}
      <div className="overflow-hidden rounded-xl border border-slate-200 bg-white shadow-sm">
        <div className="overflow-x-auto">
          <table className="w-full text-sm">
            <thead>
              <tr className="border-b border-slate-200 bg-slate-50 text-right text-xs font-medium text-slate-500">
                <th className="w-10 px-4 py-3">
                  <input
                    type="checkbox"
                    checked={
                      filteredUsers.length > 0 &&
                      selectedIds.length === filteredUsers.length
                    }
                    onChange={toggleSelectAll}
                    className="rounded border-slate-300 text-[#2271b1]"
                  />
                </th>
                <th className="px-4 py-3">کاربر</th>
                <th className="px-4 py-3">ایمیل</th>
                <th className="px-4 py-3">نقش</th>
                <th className="px-4 py-3">نوشته‌ها</th>
                <th className="px-4 py-3">وضعیت</th>
                <th className="px-4 py-3">تاریخ عضویت</th>
                <th className="px-4 py-3 text-left">عملیات</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100">
              {filteredUsers.length === 0 ? (
                <tr>
                  <td colSpan={8} className="px-4 py-16 text-center">
                    <User className="mx-auto h-10 w-10 text-slate-300" />
                    <p className="mt-3 text-sm font-medium text-slate-600">
                      کاربری یافت نشد
                    </p>
                    <p className="mt-1 text-xs text-slate-400">
                      فیلترها را تغییر دهید یا کاربر جدیدی اضافه کنید.
                    </p>
                  </td>
                </tr>
              ) : (
                filteredUsers.map((user) => (
                  <tr
                    key={user.id}
                    className={`transition hover:bg-slate-50/80 ${
                      selectedIds.includes(user.id) ? "bg-blue-50/40" : ""
                    }`}
                  >
                    <td className="px-4 py-3">
                      <input
                        type="checkbox"
                        checked={selectedIds.includes(user.id)}
                        onChange={() => toggleSelect(user.id)}
                        className="rounded border-slate-300 text-[#2271b1]"
                      />
                    </td>

                    {/* کاربر */}
                    <td className="px-4 py-3">
                      <div className="flex items-center gap-3">
                        <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-full bg-slate-200 text-sm font-semibold text-slate-600">
                          {user.avatar ? (
                            <img
                              src={user.avatar}
                              alt={user.name}
                              className="h-10 w-10 rounded-full object-cover"
                            />
                          ) : (
                            getInitials(user.name)
                          )}
                        </div>
                        <div className="min-w-0">
                          <p className="font-medium text-slate-800 line-clamp-1">
                            {user.name}
                          </p>
                          <p className="text-xs text-slate-400" dir="ltr">
                            @{user.username}
                          </p>
                        </div>
                      </div>
                    </td>

                    {/* ایمیل */}
                    <td className="px-4 py-3">
                      <a
                        href={`mailto:${user.email}`}
                        className="text-slate-600 hover:text-[#2271b1]"
                        dir="ltr"
                      >
                        {user.email}
                      </a>
                    </td>

                    {/* نقش */}
                    <td className="px-4 py-3">
                      <span
                        className={`inline-flex items-center gap-1 rounded-full border px-2.5 py-1 text-xs font-medium ${ROLE_COLORS[user.role]}`}
                      >
                        <Shield className="h-3 w-3" />
                        {ROLE_LABELS[user.role]}
                      </span>
                    </td>

                    {/* تعداد نوشته */}
                    <td className="px-4 py-3 text-slate-600">
                      {user.posts_count > 0 ? (
                        <Link
                          href={`/panel/posts?author=${user.id}`}
                          className="text-[#2271b1] hover:underline"
                        >
                          {user.posts_count}
                        </Link>
                      ) : (
                        <span className="text-slate-400">۰</span>
                      )}
                    </td>

                    {/* وضعیت */}
                    <td className="px-4 py-3">
                      {user.is_active ? (
                        <span className="inline-flex items-center gap-1 text-xs font-medium text-emerald-600">
                          <CheckCircle2 className="h-3.5 w-3.5" />
                          فعال
                        </span>
                      ) : (
                        <span className="inline-flex items-center gap-1 text-xs font-medium text-red-500">
                          <XCircle className="h-3.5 w-3.5" />
                          غیرفعال
                        </span>
                      )}
                    </td>

                    {/* تاریخ عضویت */}
                    <td className="px-4 py-3 text-xs text-slate-500">
                      {formatDate(user.registered_at)}
                    </td>

                    {/* عملیات */}
                    <td className="px-4 py-3">
                      <div className="relative flex items-center justify-end gap-1">
                        <Link
                          href={`/panel/users/${user.id}/edit`}
                          className="rounded-lg px-2.5 py-1.5 text-xs text-slate-600 hover:bg-slate-100 hover:text-[#2271b1]"
                        >
                          ویرایش
                        </Link>
                        <button
                          type="button"
                          onClick={() =>
                            setOpenActionId(
                              openActionId === user.id ? null : user.id,
                            )
                          }
                          className="rounded-lg p-1.5 text-slate-400 hover:bg-slate-100 hover:text-slate-600"
                        >
                          <MoreHorizontal className="h-4 w-4" />
                        </button>

                        {/* منوی بیشتر */}
                        {openActionId === user.id && (
                          <>
                            <div
                              className="fixed inset-0 z-10"
                              onClick={() => setOpenActionId(null)}
                            />
                            <div className="absolute left-0 top-8 z-20 w-40 overflow-hidden rounded-lg border border-slate-200 bg-white py-1 shadow-lg">
                              <Link
                                href={`/panel/users/${user.id}`}
                                className="block px-3 py-2 text-xs text-slate-700 hover:bg-slate-50"
                              >
                                مشاهده پروفایل
                              </Link>
                              <button
                                type="button"
                                className="block w-full px-3 py-2 text-right text-xs text-slate-700 hover:bg-slate-50"
                              >
                                {user.is_active ? "غیرفعال کردن" : "فعال کردن"}
                              </button>
                              <button
                                type="button"
                                className="block w-full px-3 py-2 text-right text-xs text-slate-700 hover:bg-slate-50"
                              >
                                ارسال ایمیل
                              </button>
                              <div className="my-1 border-t border-slate-100" />
                              <button
                                type="button"
                                className="flex w-full items-center gap-2 px-3 py-2 text-xs text-red-600 hover:bg-red-50"
                              >
                                <Trash2 className="h-3.5 w-3.5" />
                                حذف کاربر
                              </button>
                            </div>
                          </>
                        )}
                      </div>
                    </td>
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </div>
      </div>

      {/* راهنمای نقش‌ها (شبیه وردپرس) */}
      <div className="mt-6 rounded-xl border border-slate-200 bg-white p-5 shadow-sm">
        <h3 className="mb-3 text-sm font-semibold text-slate-800">
          سطوح دسترسی (نقش‌ها)
        </h3>
        <div className="grid gap-3 sm:grid-cols-2 lg:grid-cols-3">
          {(
            [
              {
                role: "administrator" as UserRole,
                desc: "دسترسی کامل به تمام بخش‌های پنل و تنظیمات",
              },
              {
                role: "editor" as UserRole,
                desc: "می‌تواند همه نوشته‌ها و صفحات را ویرایش و منتشر کند",
              },
              {
                role: "author" as UserRole,
                desc: "می‌تواند نوشته‌های خودش را منتشر و مدیریت کند",
              },
              {
                role: "contributor" as UserRole,
                desc: "می‌تواند نوشته بنویسد اما نمی‌تواند منتشر کند",
              },
              {
                role: "subscriber" as UserRole,
                desc: "فقط می‌تواند پروفایل خودش را مدیریت کند",
              },
            ] as const
          ).map((item) => (
            <div
              key={item.role}
              className="flex items-start gap-3 rounded-lg border border-slate-100 p-3"
            >
              <span
                className={`mt-0.5 inline-flex rounded-full border px-2 py-0.5 text-[11px] font-medium ${ROLE_COLORS[item.role]}`}
              >
                {ROLE_LABELS[item.role]}
              </span>
              <p className="text-xs leading-5 text-slate-500">{item.desc}</p>
            </div>
          ))}
        </div>
      </div>
    </PanelLayout>
  );
}

UsersIndexPage.layout = (page: React.ReactNode) => page;
