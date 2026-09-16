import { useState } from "react";
import { router } from "@inertiajs/react";
import { PlusIcon } from "lucide-react";
import { Category } from "../types";
import { useToast } from "@/components/ui/Toastalert";

type Props = {
  categories: Category[];
};

export function AddCategoryForm({ categories }: Props) {
  const [form, setForm] = useState({
    title: "",
    slug: "",
    description: "",
    parent_id: "" as number | "",
  });
  const toast = useToast();
  const [slugManual, setSlugManual] = useState(false);
  const [processing, setProcessing] = useState(false);

  const generateSlug = (value: string) =>
    value
      .toLowerCase()
      .trim()
      .replace(/\s+/g, "-")
      .replace(/[^\w\-]+/g, "");

  const handleTitleChange = (value: string) => {
    setForm((prev) => ({
      ...prev,
      title: value,
      slug: slugManual ? prev.slug : generateSlug(value),
    }));
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!form.title.trim() || processing) return;

    setProcessing(true);

    router.post(
      "/api/v1/categories",
      {
        title: form.title.trim(),
        slug: form.slug.trim() || generateSlug(form.title),
        description: form.description.trim() || null,
        parent_id: form.parent_id === "" ? null : Number(form.parent_id),
        is_active: true,
      },
      {
        preserveScroll: true,
        onSuccess: () => {
          // فرم را پاک کن
          setForm({ title: "", slug: "", description: "", parent_id: "" });
          setSlugManual(false);
          toast.success("دسته‌بندی جدید شما با موفقیت ثبت و ایجاد شد.");
        },
        onError: (err: any) => {
          toast.error(err || "دسته‌بندی جدید شما با موفقیت ثبت و ایجاد شد.");
        },
        onFinish: () => setProcessing(false),
      },
    );
  };

  const parentCategories = categories.filter((c) => c.parent_id === null);

  return (
    <div className="xl:col-span-1">
      <div className="sticky top-24 rounded-xl border border-slate-200 bg-white shadow-sm">
        <div className="border-b border-slate-100 bg-slate-50/80 px-5 py-3.5">
          <h3 className="flex items-center gap-2 text-sm font-semibold text-slate-800">
            <PlusIcon className="h-4 w-4 text-[#2271b1]" />
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
          </div>

          {/* توضیحات */}
          <div>
            <label className="mb-1.5 block text-sm font-medium text-slate-700">
              توضیحات
            </label>
            <textarea
              value={form.description}
              onChange={(e) =>
                setForm((prev) => ({ ...prev, description: e.target.value }))
              }
              rows={3}
              className="w-full resize-none rounded-lg border border-slate-200 px-3 py-2.5 text-sm outline-none focus:border-[#2271b1] focus:ring-2 focus:ring-[#2271b1]/20"
            />
          </div>

          <button
            type="submit"
            disabled={processing}
            className="w-full rounded-lg bg-[#2271b1] py-2.5 text-sm font-medium text-white hover:bg-[#135e96] disabled:opacity-60"
          >
            {processing ? "در حال ذخیره..." : "افزودن دسته جدید"}
          </button>
        </form>
      </div>
    </div>
  );
}
