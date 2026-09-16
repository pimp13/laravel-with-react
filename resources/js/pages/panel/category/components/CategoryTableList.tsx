import { useState } from "react";
import { router, Link } from "@inertiajs/react";
import { SearchIcon, FolderTree, MoreHorizontal, Trash2 } from "lucide-react";
import { Category } from "../types";

type Props = {
  search: string;
  setSearch: React.Dispatch<React.SetStateAction<string>>;
  filteredCategories: Category[];
  categories: Category[];
};

export function CategoryTableList({
  search,
  setSearch,
  filteredCategories,
  categories,
}: Props) {
  const [selectedIds, setSelectedIds] = useState<number[]>([]);
  const [openActionId, setOpenActionId] = useState<number | null>(null);
  const [processingId, setProcessingId] = useState<number | null>(null);

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

  const getParentTitle = (parentId: number | null) => {
    if (!parentId) return null;
    return categories.find((c) => c.id === parentId)?.title || null;
  };

  // حذف تکی
  const handleDelete = (id: number) => {
    if (!confirm("آیا از حذف این دسته مطمئن هستید؟")) return;

    setProcessingId(id);
    setOpenActionId(null);

    router.delete(`/api/v1/categories/${id}`, {
      preserveScroll: true,
      onFinish: () => setProcessingId(null),
    });
  };

  // فعال / غیرفعال کردن
  const handleToggleActive = (id: number) => {
    setProcessingId(id);
    setOpenActionId(null);

    router.patch(
      `/api/v1/categories/${id}/toggle-active`,
      {},
      {
        preserveScroll: true,
        onFinish: () => setProcessingId(null),
      },
    );
  };

  return (
    <>
      {/* جستجو و عملیات گروهی */}
      <div className="rounded-xl border border-slate-200 bg-white p-4 shadow-sm">
        <div className="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
          <div className="relative max-w-xs flex-1">
            <SearchIcon className="pointer-events-none absolute right-3 top-1/2 h-4 w-4 -translate-y-1/2 text-slate-400" />
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
            {/* thead مثل قبل */}
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
                  const isProcessing = processingId === cat.id;

                  return (
                    <tr
                      key={cat.id}
                      className={
                        selectedIds.includes(cat.id) ? "bg-blue-50/40" : ""
                      }
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
                          {isChild && <span className="text-slate-300">↳</span>}
                          <div>
                            <p className="font-medium text-slate-800">
                              {cat.title}
                            </p>
                            {parentTitle && (
                              <p className="text-[11px] text-slate-400">
                                                                زیرمجموعه «
                                {parentTitle}»
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

                      {/* ستون عملیات */}
                      <td className="px-4 py-3">
                        <div className="relative flex items-center justify-end gap-1">
                          <button
                            type="button"
                            className="rounded-lg px-2.5 py-1.5 text-xs text-slate-600 hover:bg-slate-100"
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
                            disabled={isProcessing}
                            className="rounded-lg p-1.5 text-slate-400 hover:bg-slate-100"
                          >
                            <MoreHorizontal className="h-4 w-4" />
                          </button>

                          {openActionId === cat.id && (
                            <>
                              <div
                                className="fixed inset-0 z-10"
                                onClick={() => setOpenActionId(null)}
                              />
                              <div className="absolute left-0 top-8 z-20 w-44 overflow-hidden rounded-lg border border-slate-200 bg-white py-1 shadow-lg">
                                <button
                                  type="button"
                                  className="block w-full px-3 py-2 text-right text-xs text-slate-700 hover:bg-slate-50"
                                >
                                  مشاهده نوشته‌ها
                                </button>

                                <button
                                  type="button"
                                  onClick={() => handleToggleActive(cat.id)}
                                  className="block w-full px-3 py-2 text-right text-xs text-slate-700 hover:bg-slate-50"
                                >
                                  {cat.is_active ? "غیرفعال کردن" : "فعال کردن"}
                                </button>

                                <div className="my-1 border-t border-slate-100" />

                                <button
                                  type="button"
                                  onClick={() => handleDelete(cat.id)}
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
    </>
  );
}
