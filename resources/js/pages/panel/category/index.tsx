import PanelLayout from "@/layouts/PanelLayout";
import { Head, Link } from "@inertiajs/react";
import React, { useMemo, useState } from "react";
import { Category } from "./types";
import { AddCategoryForm } from "./components/AddCategoryForm";
import { CategoryTableList } from "./components/CategoryTableList";
import { FlashMessage } from "@/components/ui/FlashMessage";
import AppLayout from "@/layouts/AppLayout";

export default function CategoriesIndexPage({
  categories,
}: {
  categories: any;
}) {
  const [search, setSearch] = useState("");

  const filteredCategories = useMemo(() => {
    let result = [...categories];

    if (search.trim()) {
      const q = search.trim().toLowerCase();
      result = result.filter(
        (c) =>
          c.title.toLowerCase().includes(q) ||
          c.slug.toLowerCase().includes(q) ||
          (c.description || "").toLowerCase().includes(q),
      );
    }

    return result;
  }, [categories, search]);

  return (
    <>
      <Head title="Category Page" />

      <PanelLayout title="دسته‌بندی‌ها">
        {/* هدر */}
        <div className="mb-6">
          <h2 className="text-lg font-semibold text-slate-800">
            لیست دسته‌بندی‌ها و مدیریت دسته‌ها
          </h2>
          <p className="mt-0.5 text-sm text-slate-500">
            دسته‌بندی نوشته‌ها را مدیریت کنید
          </p>
        </div>

        <FlashMessage />

        <div className="grid grid-cols-1 gap-8 xl:grid-cols-3">
          {/* ===================== فرم افزودن دسته (راست) ===================== */}
          <AddCategoryForm categories={categories} />

          {/* ===================== جدول دسته‌ها (چپ) ===================== */}
          <div className="xl:col-span-2 space-y-4">
            <CategoryTableList
              categories={categories}
              filteredCategories={filteredCategories}
              search={search}
              setSearch={setSearch}
            />

            {/* راهنما */}
            <div className="rounded-xl border border-slate-200 bg-slate-50 px-5 py-4 text-xs leading-6 text-slate-500">
              <p className="font-medium text-slate-700 mb-1">نکته:</p>
              <p>
                با حذف یک دسته، نوشته‌های آن حذف نمی‌شوند. فقط ارتباطشان با این
                دسته قطع می‌شود. دسته‌های فرزند بعد از حذف دسته مادر، به سطح
                اصلی منتقل می‌شوند.
              </p>
            </div>
          </div>
        </div>
      </PanelLayout>
    </>
  );
}

CategoriesIndexPage.layout = (page: React.ReactNode) => (
  <AppLayout>{page}</AppLayout>
);
