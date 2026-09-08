import React, { useState, useEffect, useMemo, useCallback } from "react";
import { useEditor, EditorContent } from "@tiptap/react";
import StarterKit from "@tiptap/starter-kit";
import Link from "@tiptap/extension-link";
import Image from "@tiptap/extension-image";
import Placeholder from "@tiptap/extension-placeholder";
import TextAlign from "@tiptap/extension-text-align";
import Underline from "@tiptap/extension-underline";
import { TextStyle } from "@tiptap/extension-text-style";
import { Color } from "@tiptap/extension-color";
import { Highlight } from "@tiptap/extension-highlight";

// ==================== Types ====================
interface Category {
  id: number;
  title: string;
  slug: string;
}

interface SeoMeta {
  // Basic
  meta_title: string;
  meta_description: string;
  meta_keywords: string;
  focus_keyword: string;
  canonical_url: string;
  robots: string;
  advanced_robots: string;

  // Open Graph
  og_title: string;
  og_description: string;
  og_image: string;
  og_type: string;

  // Twitter
  twitter_card: string;
  twitter_title: string;
  twitter_description: string;
  twitter_image: string;

  // Schema
  schema_type: string;
  schema_custom: string;

  // Extra professional
  breadcrumb_title: string;
  is_pillar: boolean;
  reading_time: number;
  tags: string[];
}

interface PostFormData {
  title: string;
  slug: string;
  content: string;
  excerpt: string;
  featured_image: string;
  category_id: number | "";
  visibility: "public" | "private" | "draft";
  published_at: string;
  is_active: boolean;
  meta: SeoMeta;
}

interface SeoCheck {
  id: string;
  label: string;
  status: "good" | "warning" | "bad" | "info";
  message: string;
}

// ==================== Mock Categories ====================
const MOCK_CATEGORIES: Category[] = [
  { id: 1, title: "برنامه‌نویسی", slug: "programming" },
  { id: 2, title: "فرانت‌اند", slug: "frontend" },
  { id: 3, title: "بک‌اند", slug: "backend" },
  { id: 4, title: "امنیت", slug: "security" },
  { id: 5, title: "بهینه‌سازی", slug: "optimization" },
  { id: 6, title: "دیتابیس", slug: "database" },
  { id: 7, title: "DevOps", slug: "devops" },
];

// ==================== Helpers ====================
const generateSlug = (title: string) => {
  return title
    .toLowerCase()
    .trim()
    .replace(/[^\w\s\u0600-\u06FF-]/g, "")
    .replace(/\s+/g, "-")
    .replace(/-+/g, "-");
};

const stripHtml = (html: string) => html.replace(/<[^>]*>/g, " ").replace(/\s+/g, " ").trim();

const estimateReadingTime = (html: string) => {
  const words = stripHtml(html).split(/\s+/).filter(Boolean).length;
  return Math.max(1, Math.ceil(words / 200));
};

const countKeyword = (text: string, keyword: string) => {
  if (!keyword.trim()) return 0;
  const regex = new RegExp(keyword.trim().replace(/[.*+?^${}()|[\]\\]/g, "\\$&"), "gi");
  return (text.match(regex) || []).length;
};

// ==================== Toolbar Button ====================
const ToolbarButton = ({
  onClick,
  isActive = false,
  disabled = false,
  children,
  title,
}: {
  onClick: () => void;
  isActive?: boolean;
  disabled?: boolean;
  children: React.ReactNode;
  title?: string;
}) => (
  <button
    type="button"
    onClick={onClick}
    disabled={disabled}
    title={title}
    className={`p-2 rounded-lg transition-colors ${
      isActive
        ? "bg-indigo-100 text-indigo-700"
        : "text-slate-600 hover:bg-slate-100 hover:text-slate-900"
    } disabled:opacity-40 disabled:cursor-not-allowed`}
  >
    {children}
  </button>
);

// ==================== SEO Status Icon ====================
const StatusIcon = ({ status }: { status: SeoCheck["status"] }) => {
  const colors = {
    good: "text-emerald-500",
    warning: "text-amber-500",
    bad: "text-red-500",
    info: "text-slate-400",
  };
  const icons = {
    good: "✓",
    warning: "!",
    bad: "✕",
    info: "i",
  };
  return (
    <span className={`w-5 h-5 rounded-full flex items-center justify-center text-xs font-bold ${colors[status]} bg-opacity-10`}>
      {icons[status]}
    </span>
  );
};

// ==================== Main Component ====================
export default function CreatePostPage() {
  const [form, setForm] = useState<PostFormData>({
    title: "",
    slug: "",
    content: "",
    excerpt: "",
    featured_image: "",
    category_id: "",
    visibility: "draft",
    published_at: new Date().toISOString().slice(0, 16),
    is_active: true,
    meta: {
      meta_title: "",
      meta_description: "",
      meta_keywords: "",
      focus_keyword: "",
      canonical_url: "",
      robots: "index, follow",
      advanced_robots: "",
      og_title: "",
      og_description: "",
      og_image: "",
      og_type: "article",
      twitter_card: "summary_large_image",
      twitter_title: "",
      twitter_description: "",
      twitter_image: "",
      schema_type: "BlogPosting",
      schema_custom: "",
      breadcrumb_title: "",
      is_pillar: false,
      reading_time: 5,
      tags: [],
    },
  });

  const [activeTab, setActiveTab] = useState<"content" | "seo" | "settings">("content");
  const [slugManual, setSlugManual] = useState(false);
  const [saving, setSaving] = useState(false);
  const [tagInput, setTagInput] = useState("");
  const [snippetView, setSnippetView] = useState<"desktop" | "mobile">("desktop");

  // ==================== Tiptap Editor ====================
  const editor = useEditor({
    extensions: [
      StarterKit.configure({
        heading: { levels: [1, 2, 3, 4] },
      }),
      Underline,
      TextStyle,
      Color,
      Highlight.configure({ multicolor: true }),
      Link.configure({
        openOnClick: false,
        HTMLAttributes: { class: "text-indigo-600 underline" },
      }),
      Image.configure({
        HTMLAttributes: { class: "rounded-xl max-w-full my-4" },
      }),
      TextAlign.configure({
        types: ["heading", "paragraph"],
      }),
      Placeholder.configure({
        placeholder: "محتوای پست خود را اینجا بنویسید...",
      }),
    ],
    content: form.content,
    onUpdate: ({ editor }) => {
      const html = editor.getHTML();
      setForm((prev) => ({ ...prev, content: html }));
    },
    editorProps: {
      attributes: {
        class:
          "prose prose-slate max-w-none min-h-[380px] p-4 focus:outline-none text-right",
        dir: "rtl",
      },
    },
  });

  // تولید خودکار slug
  useEffect(() => {
    if (!slugManual && form.title) {
      setForm((prev) => ({ ...prev, slug: generateSlug(prev.title) }));
    }
  }, [form.title, slugManual]);

  // محاسبه زمان مطالعه
  useEffect(() => {
    const time = estimateReadingTime(form.content);
    setForm((prev) => ({
      ...prev,
      meta: { ...prev.meta, reading_time: time },
    }));
  }, [form.content]);

  // همگام‌سازی فیلدهای SEO
  useEffect(() => {
    setForm((prev) => ({
      ...prev,
      meta: {
        ...prev.meta,
        meta_title: prev.meta.meta_title || prev.title,
        og_title: prev.meta.og_title || prev.title,
        twitter_title: prev.meta.twitter_title || prev.title,
        meta_description: prev.meta.meta_description || prev.excerpt,
        og_description: prev.meta.og_description || prev.excerpt,
        twitter_description: prev.meta.twitter_description || prev.excerpt,
        og_image: prev.meta.og_image || prev.featured_image,
        twitter_image: prev.meta.twitter_image || prev.featured_image,
        breadcrumb_title: prev.meta.breadcrumb_title || prev.title,
      },
    }));
  }, [form.title, form.excerpt, form.featured_image]);

  const handleChange = (field: keyof PostFormData, value: any) => {
    setForm((prev) => ({ ...prev, [field]: value }));
  };

  const handleMetaChange = (field: keyof SeoMeta, value: any) => {
    setForm((prev) => ({
      ...prev,
      meta: { ...prev.meta, [field]: value },
    }));
  };

  const addTag = () => {
    if (tagInput.trim() && !form.meta.tags.includes(tagInput.trim())) {
      handleMetaChange("tags", [...form.meta.tags, tagInput.trim()]);
      setTagInput("");
    }
  };

  const removeTag = (tag: string) => {
    handleMetaChange(
      "tags",
      form.meta.tags.filter((t) => t !== tag)
    );
  };

  const setLink = useCallback(() => {
    if (!editor) return;
    const previousUrl = editor.getAttributes("link").href;
    const url = window.prompt("آدرس لینک را وارد کنید:", previousUrl);
    if (url === null) return;
    if (url === "") {
      editor.chain().focus().extendMarkRange("link").unsetLink().run();
      return;
    }
    editor.chain().focus().extendMarkRange("link").setLink({ href: url }).run();
  }, [editor]);

  const addImage = useCallback(() => {
    if (!editor) return;
    const url = window.prompt("آدرس تصویر را وارد کنید:");
    if (url) {
      editor.chain().focus().setImage({ src: url }).run();
    }
  }, [editor]);

  // ==================== SEO Analysis ====================
  const plainContent = useMemo(() => stripHtml(form.content), [form.content]);
  const wordCount = useMemo(() => plainContent.split(/\s+/).filter(Boolean).length, [plainContent]);
  const keyword = form.meta.focus_keyword.trim().toLowerCase();

  const seoChecks: SeoCheck[] = useMemo(() => {
    const checks: SeoCheck[] = [];

    // 1. Focus Keyword
    if (!keyword) {
      checks.push({ id: "kw", label: "کلمه کلیدی اصلی", status: "bad", message: "کلمه کلیدی اصلی را وارد کنید" });
    } else {
      checks.push({ id: "kw", label: "کلمه کلیدی اصلی", status: "good", message: `کلمه کلیدی: «${form.meta.focus_keyword}»` });
    }

    // 2. Keyword in Title
    if (keyword) {
      const inTitle = form.title.toLowerCase().includes(keyword);
      checks.push({
        id: "kw-title",
        label: "کلمه کلیدی در عنوان",
        status: inTitle ? "good" : "bad",
        message: inTitle ? "کلمه کلیدی در عنوان وجود دارد" : "کلمه کلیدی در عنوان وجود ندارد",
      });
    }

    // 3. Keyword in Meta Title
    if (keyword) {
      const inMetaTitle = form.meta.meta_title.toLowerCase().includes(keyword);
      checks.push({
        id: "kw-meta-title",
        label: "کلمه کلیدی در Meta Title",
        status: inMetaTitle ? "good" : "warning",
        message: inMetaTitle ? "در Meta Title وجود دارد" : "بهتر است در Meta Title باشد",
      });
    }

    // 4. Keyword in Meta Description
    if (keyword) {
      const inMetaDesc = form.meta.meta_description.toLowerCase().includes(keyword);
      checks.push({
        id: "kw-meta-desc",
        label: "کلمه کلیدی در Meta Description",
        status: inMetaDesc ? "good" : "warning",
        message: inMetaDesc ? "در توضیحات متا وجود دارد" : "بهتر است در توضیحات متا باشد",
      });
    }

    // 5. Keyword in Content
    if (keyword) {
      const count = countKeyword(plainContent, keyword);
      const density = wordCount > 0 ? (count / wordCount) * 100 : 0;
      let status: SeoCheck["status"] = "bad";
      let message = "کلمه کلیدی در محتوا وجود ندارد";
      if (count > 0) {
        if (density >= 0.5 && density <= 2.5) {
          status = "good";
          message = `چگالی مناسب (${density.toFixed(1)}٪ - ${count} بار)`;
        } else if (density > 2.5) {
          status = "warning";
          message = `چگالی کمی بالا است (${density.toFixed(1)}٪)`;
        } else {
          status = "warning";
          message = `چگالی پایین است (${density.toFixed(1)}٪)`;
        }
      }
      checks.push({ id: "kw-content", label: "کلمه کلیدی در محتوا", status, message });
    }

    // 6. Keyword in URL
    if (keyword) {
      const inSlug = form.slug.toLowerCase().includes(keyword.replace(/\s+/g, "-"));
      checks.push({
        id: "kw-slug",
        label: "کلمه کلیدی در URL",
        status: inSlug ? "good" : "warning",
        message: inSlug ? "در نامک وجود دارد" : "بهتر است در نامک باشد",
      });
    }

    // 7. Meta Title Length
    const titleLen = form.meta.meta_title.length;
    checks.push({
      id: "title-len",
      label: "طول Meta Title",
      status: titleLen >= 30 && titleLen <= 60 ? "good" : titleLen > 0 ? "warning" : "bad",
      message: titleLen === 0 ? "Meta Title خالی است" : `${titleLen} کاراکتر (ایده‌آل: ۳۰-۶۰)`,
    });

    // 8. Meta Description Length
    const descLen = form.meta.meta_description.length;
    checks.push({
      id: "desc-len",
      label: "طول Meta Description",
      status: descLen >= 120 && descLen <= 160 ? "good" : descLen > 0 ? "warning" : "bad",
      message: descLen === 0 ? "Meta Description خالی است" : `${descLen} کاراکتر (ایده‌آل: ۱۲۰-۱۶۰)`,
    });

    // 9. Content Length
    checks.push({
      id: "content-len",
      label: "طول محتوا",
      status: wordCount >= 600 ? "good" : wordCount >= 300 ? "warning" : "bad",
      message: `${wordCount} کلمه ${wordCount < 300 ? "(حداقل ۳۰۰ کلمه پیشنهاد می‌شود)" : wordCount < 600 ? "(برای سئو بهتر ۶۰۰+ کلمه)" : ""}`,
    });

    // 10. Featured Image
    checks.push({
      id: "image",
      label: "تصویر شاخص",
      status: form.featured_image ? "good" : "warning",
      message: form.featured_image ? "تصویر شاخص تنظیم شده" : "تصویر شاخص ندارد",
    });

    // 11. Excerpt
    checks.push({
      id: "excerpt",
      label: "خلاصه پست",
      status: form.excerpt.length >= 50 ? "good" : form.excerpt ? "warning" : "bad",
      message: form.excerpt ? `${form.excerpt.length} کاراکتر` : "خلاصه نوشته نشده",
    });

    // 12. Internal Links (simple check)
    const linkCount = (form.content.match(/<a /gi) || []).length;
    checks.push({
      id: "links",
      label: "لینک‌های داخلی/خارجی",
      status: linkCount >= 2 ? "good" : linkCount === 1 ? "warning" : "info",
      message: linkCount > 0 ? `${linkCount} لینک در محتوا` : "هنوز لینکی اضافه نشده",
    });

    return checks;
  }, [form, keyword, plainContent, wordCount]);

  const seoScore = useMemo(() => {
    const good = seoChecks.filter((c) => c.status === "good").length;
    const total = seoChecks.length;
    return Math.round((good / total) * 100);
  }, [seoChecks]);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setSaving(true);

    const payload = {
      title: form.title,
      slug: form.slug,
      content: form.content,
      excerpt: form.excerpt,
      featured_image: form.featured_image,
      category_id: form.category_id,
      visibility: form.visibility,
      published_at: form.published_at || null,
      is_active: form.is_active,
      meta: form.meta,
    };

    console.log("Payload آماده ارسال به API:", payload);

    setTimeout(() => {
      setSaving(false);
      alert("✅ پست با موفقیت ذخیره شد!");
    }, 800);
  };

  return (
    <div className="min-h-screen bg-slate-100" dir="rtl">
      {/* Top Bar */}
      <header className="bg-white border-b border-slate-200 sticky top-0 z-30">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 h-16 flex items-center justify-between">
          <div className="flex items-center gap-4">
            <h1 className="text-xl font-bold text-slate-800">ساخت پست جدید</h1>
            <span className="text-xs bg-indigo-50 text-indigo-700 px-2.5 py-1 rounded-full font-medium">
              پنل ادمین
            </span>
          </div>

          <div className="flex items-center gap-3">
            <div className="hidden sm:flex items-center gap-2 text-sm">
              <span className="text-slate-500">امتیاز سئو:</span>
              <span
                className={`font-bold ${
                  seoScore >= 80 ? "text-emerald-600" : seoScore >= 50 ? "text-amber-600" : "text-red-600"
                }`}
              >
                {seoScore}/100
              </span>
            </div>
            <button
              type="button"
              onClick={() => handleChange("visibility", "draft")}
              className="px-4 py-2 text-sm font-medium text-slate-600 hover:bg-slate-100 rounded-lg transition"
            >
              ذخیره پیش‌نویس
            </button>
            <button
              type="submit"
              form="create-post-form"
              disabled={saving || !form.title}
              className="px-6 py-2.5 bg-indigo-600 hover:bg-indigo-700 disabled:opacity-50 text-white text-sm font-medium rounded-lg shadow-sm transition flex items-center gap-2"
            >
              {saving ? "در حال ذخیره..." : "انتشار پست"}
            </button>
          </div>
        </div>
      </header>

      <form id="create-post-form" onSubmit={handleSubmit} className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
          {/* ==================== Main Content ==================== */}
          <div className="lg:col-span-2 space-y-6">
            {/* Title & Slug */}
            <div className="bg-white rounded-2xl shadow-sm border border-slate-200 p-6 space-y-5">
              <div>
                <label className="block text-sm font-medium text-slate-700 mb-2">
                  عنوان پست <span className="text-red-500">*</span>
                </label>
                <input
                  type="text"
                  value={form.title}
                  onChange={(e) => handleChange("title", e.target.value)}
                  placeholder="عنوان جذاب و واضح بنویسید..."
                  className="w-full px-4 py-3 text-lg border border-slate-200 rounded-xl focus:ring-2 focus:ring-indigo-500/30 focus:border-indigo-400 outline-none transition"
                  required
                />
              </div>

              <div>
                <div className="flex items-center justify-between mb-2">
                  <label className="block text-sm font-medium text-slate-700">نامک (Slug)</label>
                  <button
                    type="button"
                    onClick={() => setSlugManual(!slugManual)}
                    className="text-xs text-indigo-600 hover:underline"
                  >
                    {slugManual ? "تولید خودکار" : "ویرایش دستی"}
                  </button>
                </div>
                <div className="flex items-center gap-2">
                  <span className="text-slate-400 text-sm">/blog/</span>
                  <input
                    type="text"
                    value={form.slug}
                    onChange={(e) => {
                      setSlugManual(true);
                      handleChange("slug", e.target.value);
                    }}
                    className="flex-1 px-3 py-2 border border-slate-200 rounded-lg text-sm focus:ring-2 focus:ring-indigo-500/30 focus:border-indigo-400 outline-none"
                    dir="ltr"
                  />
                </div>
              </div>
            </div>

            {/* Tabs */}
            <div className="bg-white rounded-2xl shadow-sm border border-slate-200 overflow-hidden">
              <div className="flex border-b border-slate-200">
                {[
                  { id: "content", label: "محتوا" },
                  { id: "seo", label: "سئو پیشرفته" },
                  { id: "settings", label: "تنظیمات" },
                ].map((tab) => (
                  <button
                    key={tab.id}
                    type="button"
                    onClick={() => setActiveTab(tab.id as any)}
                    className={`flex-1 py-3.5 text-sm font-medium transition ${
                      activeTab === tab.id
                        ? "text-indigo-600 border-b-2 border-indigo-600 bg-indigo-50/50"
                        : "text-slate-500 hover:text-slate-700 hover:bg-slate-50"
                    }`}
                  >
                    {tab.label}
                  </button>
                ))}
              </div>

              <div className="p-6">
                {/* Content Tab */}
                {activeTab === "content" && (
                  <div className="space-y-6">
                    <div>
                      <label className="block text-sm font-medium text-slate-700 mb-3">محتوای پست</label>

                      {editor && (
                        <div className="border border-slate-200 rounded-t-xl bg-slate-50 p-2 flex flex-wrap gap-1">
                          <ToolbarButton onClick={() => editor.chain().focus().toggleBold().run()} isActive={editor.isActive("bold")} title="ضخیم">
                            <strong>B</strong>
                          </ToolbarButton>
                          <ToolbarButton onClick={() => editor.chain().focus().toggleItalic().run()} isActive={editor.isActive("italic")} title="ایتالیک">
                            <em>I</em>
                          </ToolbarButton>
                          <ToolbarButton onClick={() => editor.chain().focus().toggleUnderline().run()} isActive={editor.isActive("underline")} title="زیرخط">
                            <span className="underline">U</span>
                          </ToolbarButton>
                          <ToolbarButton onClick={() => editor.chain().focus().toggleStrike().run()} isActive={editor.isActive("strike")} title="خط خورده">
                            <span className="line-through">S</span>
                          </ToolbarButton>

                          <div className="w-px h-6 bg-slate-300 mx-1 self-center" />

                          <ToolbarButton onClick={() => editor.chain().focus().toggleHeading({ level: 2 }).run()} isActive={editor.isActive("heading", { level: 2 })}>
                            H2
                          </ToolbarButton>
                          <ToolbarButton onClick={() => editor.chain().focus().toggleHeading({ level: 3 }).run()} isActive={editor.isActive("heading", { level: 3 })}>
                            H3
                          </ToolbarButton>

                          <div className="w-px h-6 bg-slate-300 mx-1 self-center" />

                          <ToolbarButton onClick={() => editor.chain().focus().toggleBulletList().run()} isActive={editor.isActive("bulletList")}>
                            • لیست
                          </ToolbarButton>
                          <ToolbarButton onClick={() => editor.chain().focus().toggleOrderedList().run()} isActive={editor.isActive("orderedList")}>
                            ۱. لیست
                          </ToolbarButton>

                          <div className="w-px h-6 bg-slate-300 mx-1 self-center" />

                          <ToolbarButton onClick={() => editor.chain().focus().setTextAlign("right").run()} isActive={editor.isActive({ textAlign: "right" })}>
                            راست
                          </ToolbarButton>
                          <ToolbarButton onClick={() => editor.chain().focus().setTextAlign("center").run()} isActive={editor.isActive({ textAlign: "center" })}>
                            وسط
                          </ToolbarButton>
                          <ToolbarButton onClick={() => editor.chain().focus().setTextAlign("left").run()} isActive={editor.isActive({ textAlign: "left" })}>
                            چپ
                          </ToolbarButton>

                          <div className="w-px h-6 bg-slate-300 mx-1 self-center" />

                          <ToolbarButton onClick={setLink} isActive={editor.isActive("link")} title="لینک">
                            لینک
                          </ToolbarButton>
                          <ToolbarButton onClick={addImage} title="تصویر">
                            تصویر
                          </ToolbarButton>
                          <ToolbarButton onClick={() => editor.chain().focus().toggleBlockquote().run()} isActive={editor.isActive("blockquote")}>
                            نقل‌قول
                          </ToolbarButton>
                          <ToolbarButton onClick={() => editor.chain().focus().toggleCodeBlock().run()} isActive={editor.isActive("codeBlock")}>
                            کد
                          </ToolbarButton>
                        </div>
                      )}

                      <div className="border border-t-0 border-slate-200 rounded-b-xl overflow-hidden bg-white">
                        <EditorContent editor={editor} />
                      </div>

                      <div className="mt-2 flex items-center justify-between text-xs text-slate-500">
                        <span>
                          زمان مطالعه: <strong>{form.meta.reading_time} دقیقه</strong>
                        </span>
                        <span>
                          تعداد کلمات: <strong>{wordCount}</strong>
                        </span>
                      </div>
                    </div>

                    <div>
                      <label className="block text-sm font-medium text-slate-700 mb-2">خلاصه (Excerpt)</label>
                      <textarea
                        value={form.excerpt}
                        onChange={(e) => handleChange("excerpt", e.target.value)}
                        rows={3}
                        placeholder="یک خلاصه کوتاه و جذاب..."
                        className="w-full px-4 py-3 border border-slate-200 rounded-xl focus:ring-2 focus:ring-indigo-500/30 focus:border-indigo-400 outline-none resize-none"
                      />
                    </div>
                  </div>
                )}

                {/* SEO Tab */}
                {activeTab === "seo" && (
                  <div className="space-y-8">
                    {/* Focus Keyword */}
                    <div className="p-4 bg-indigo-50 rounded-xl border border-indigo-100">
                      <label className="block text-sm font-semibold text-indigo-900 mb-2">
                        کلمه کلیدی اصلی (Focus Keyword)
                      </label>
                      <input
                        type="text"
                        value={form.meta.focus_keyword}
                        onChange={(e) => handleMetaChange("focus_keyword", e.target.value)}
                        className="w-full px-4 py-2.5 border border-indigo-200 rounded-lg text-sm focus:ring-2 focus:ring-indigo-500/30 outline-none"
                        placeholder="مثلاً: آموزش لاراول"
                      />
                      <p className="mt-1.5 text-xs text-indigo-700">
                        این کلمه برای تحلیل سئو استفاده می‌شود (شبیه Rank Math / Yoast)
                      </p>
                    </div>

                    {/* Basic SEO */}
                    <div className="space-y-5">
                      <h3 className="text-sm font-semibold text-slate-800 border-b pb-2">سئو پایه</h3>

                      <div>
                        <label className="block text-sm font-medium text-slate-700 mb-1.5">Meta Title</label>
                        <input
                          type="text"
                          value={form.meta.meta_title}
                          onChange={(e) => handleMetaChange("meta_title", e.target.value)}
                          className="w-full px-3 py-2.5 border border-slate-200 rounded-lg text-sm focus:ring-2 focus:ring-indigo-500/30 outline-none"
                        />
                        <p className="mt-1 text-xs text-slate-500">{form.meta.meta_title.length}/60</p>
                      </div>

                      <div>
                        <label className="block text-sm font-medium text-slate-700 mb-1.5">Meta Description</label>
                        <textarea
                          value={form.meta.meta_description}
                          onChange={(e) => handleMetaChange("meta_description", e.target.value)}
                          rows={3}
                          className="w-full px-3 py-2.5 border border-slate-200 rounded-lg text-sm focus:ring-2 focus:ring-indigo-500/30 outline-none resize-none"
                        />
                        <p className="mt-1 text-xs text-slate-500">{form.meta.meta_description.length}/160</p>
                      </div>

                      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                        <div>
                          <label className="block text-sm font-medium text-slate-700 mb-1.5">Canonical URL</label>
                          <input
                            type="url"
                            value={form.meta.canonical_url}
                            onChange={(e) => handleMetaChange("canonical_url", e.target.value)}
                            className="w-full px-3 py-2.5 border border-slate-200 rounded-lg text-sm focus:ring-2 focus:ring-indigo-500/30 outline-none"
                            dir="ltr"
                          />
                        </div>
                        <div>
                          <label className="block text-sm font-medium text-slate-700 mb-1.5">Breadcrumb Title</label>
                          <input
                            type="text"
                            value={form.meta.breadcrumb_title}
                            onChange={(e) => handleMetaChange("breadcrumb_title", e.target.value)}
                            className="w-full px-3 py-2.5 border border-slate-200 rounded-lg text-sm focus:ring-2 focus:ring-indigo-500/30 outline-none"
                          />
                        </div>
                      </div>

                      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                        <div>
                          <label className="block text-sm font-medium text-slate-700 mb-1.5">Robots</label>
                          <select
                            value={form.meta.robots}
                            onChange={(e) => handleMetaChange("robots", e.target.value)}
                            className="w-full px-3 py-2.5 border border-slate-200 rounded-lg text-sm focus:ring-2 focus:ring-indigo-500/30 outline-none"
                          >
                            <option value="index, follow">index, follow</option>
                            <option value="noindex, follow">noindex, follow</option>
                            <option value="index, nofollow">index, nofollow</option>
                            <option value="noindex, nofollow">noindex, nofollow</option>
                          </select>
                        </div>
                        <div>
                          <label className="block text-sm font-medium text-slate-700 mb-1.5">Advanced Robots</label>
                          <input
                            type="text"
                            value={form.meta.advanced_robots}
                            onChange={(e) => handleMetaChange("advanced_robots", e.target.value)}
                            placeholder="max-snippet:-1, max-image-preview:large"
                            className="w-full px-3 py-2.5 border border-slate-200 rounded-lg text-sm focus:ring-2 focus:ring-indigo-500/30 outline-none"
                            dir="ltr"
                          />
                        </div>
                      </div>
                    </div>

                    {/* Social */}
                    <div className="space-y-5">
                      <h3 className="text-sm font-semibold text-slate-800 border-b pb-2">شبکه‌های اجتماعی (Open Graph & Twitter)</h3>
                      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                        <div>
                          <label className="block text-sm font-medium text-slate-700 mb-1.5">OG Title</label>
                          <input
                            type="text"
                            value={form.meta.og_title}
                            onChange={(e) => handleMetaChange("og_title", e.target.value)}
                            className="w-full px-3 py-2.5 border border-slate-200 rounded-lg text-sm focus:ring-2 focus:ring-indigo-500/30 outline-none"
                          />
                        </div>
                        <div>
                          <label className="block text-sm font-medium text-slate-700 mb-1.5">Twitter Card</label>
                          <select
                            value={form.meta.twitter_card}
                            onChange={(e) => handleMetaChange("twitter_card", e.target.value)}
                            className="w-full px-3 py-2.5 border border-slate-200 rounded-lg text-sm focus:ring-2 focus:ring-indigo-500/30 outline-none"
                          >
                            <option value="summary">summary</option>
                            <option value="summary_large_image">summary_large_image</option>
                          </select>
                        </div>
                      </div>
                      <div>
                        <label className="block text-sm font-medium text-slate-700 mb-1.5">OG / Twitter Description</label>
                        <textarea
                          value={form.meta.og_description}
                          onChange={(e) => handleMetaChange("og_description", e.target.value)}
                          rows={2}
                          className="w-full px-3 py-2.5 border border-slate-200 rounded-lg text-sm focus:ring-2 focus:ring-indigo-500/30 outline-none resize-none"
                        />
                      </div>
                      <div>
                        <label className="block text-sm font-medium text-slate-700 mb-1.5">OG / Twitter Image</label>
                        <input
                          type="url"
                          value={form.meta.og_image}
                          onChange={(e) => handleMetaChange("og_image", e.target.value)}
                          className="w-full px-3 py-2.5 border border-slate-200 rounded-lg text-sm focus:ring-2 focus:ring-indigo-500/30 outline-none"
                          dir="ltr"
                        />
                      </div>
                    </div>

                    {/* Schema */}
                    <div className="space-y-5">
                      <h3 className="text-sm font-semibold text-slate-800 border-b pb-2">Schema Markup</h3>
                      <div>
                        <label className="block text-sm font-medium text-slate-700 mb-1.5">نوع Schema</label>
                        <select
                          value={form.meta.schema_type}
                          onChange={(e) => handleMetaChange("schema_type", e.target.value)}
                          className="w-full px-3 py-2.5 border border-slate-200 rounded-lg text-sm focus:ring-2 focus:ring-indigo-500/30 outline-none"
                        >
                          <option value="BlogPosting">BlogPosting</option>
                          <option value="Article">Article</option>
                          <option value="NewsArticle">NewsArticle</option>
                          <option value="TechArticle">TechArticle</option>
                          <option value="WebPage">WebPage</option>
                        </select>
                      </div>
                      <div>
                        <label className="block text-sm font-medium text-slate-700 mb-1.5">
                          Schema سفارشی (JSON-LD)
                        </label>
                        <textarea
                          value={form.meta.schema_custom}
                          onChange={(e) => handleMetaChange("schema_custom", e.target.value)}
                          rows={5}
                          placeholder='{"@context":"https://schema.org","@type":"BlogPosting",...}'
                          className="w-full px-3 py-2.5 border border-slate-200 rounded-lg text-sm font-mono focus:ring-2 focus:ring-indigo-500/30 outline-none resize-none"
                          dir="ltr"
                        />
                      </div>
                    </div>
                  </div>
                )}

                {/* Settings Tab */}
                {activeTab === "settings" && (
                  <div className="space-y-6">
                    <div>
                      <label className="block text-sm font-medium text-slate-700 mb-2">تصویر شاخص</label>
                      <input
                        type="url"
                        value={form.featured_image}
                        onChange={(e) => handleChange("featured_image", e.target.value)}
                        placeholder="https://example.com/image.jpg"
                        className="w-full px-4 py-2.5 border border-slate-200 rounded-xl text-sm focus:ring-2 focus:ring-indigo-500/30 outline-none"
                        dir="ltr"
                      />
                      {form.featured_image && (
                        <img
                          src={form.featured_image}
                          alt="Preview"
                          className="mt-3 w-full h-48 object-cover rounded-xl border border-slate-200"
                        />
                      )}
                    </div>

                    <div>
                      <label className="block text-sm font-medium text-slate-700 mb-2">تگ‌ها</label>
                      <div className="flex gap-2">
                        <input
                          type="text"
                          value={tagInput}
                          onChange={(e) => setTagInput(e.target.value)}
                          onKeyDown={(e) => e.key === "Enter" && (e.preventDefault(), addTag())}
                          placeholder="تگ جدید + Enter"
                          className="flex-1 px-3 py-2 border border-slate-200 rounded-lg text-sm focus:ring-2 focus:ring-indigo-500/30 outline-none"
                        />
                        <button
                          type="button"
                          onClick={addTag}
                          className="px-4 py-2 bg-slate-100 hover:bg-slate-200 text-slate-700 text-sm rounded-lg transition"
                        >
                          افزودن
                        </button>
                      </div>
                      <div className="flex flex-wrap gap-2 mt-3">
                        {form.meta.tags.map((tag) => (
                          <span
                            key={tag}
                            className="inline-flex items-center gap-1.5 px-3 py-1 bg-indigo-50 text-indigo-700 text-xs rounded-full"
                          >
                            {tag}
                            <button type="button" onClick={() => removeTag(tag)} className="hover:text-indigo-900">
                              ×
                            </button>
                          </span>
                        ))}
                      </div>
                    </div>

                    <div className="flex items-center justify-between p-4 bg-slate-50 rounded-xl">
                      <div>
                        <p className="text-sm font-medium text-slate-800">محتوای ستون‌دار (Pillar Content)</p>
                        <p className="text-xs text-slate-500 mt-0.5">این پست به عنوان محتوای اصلی موضوع علامت‌گذاری شود</p>
                      </div>
                      <button
                        type="button"
                        onClick={() => handleMetaChange("is_pillar", !form.meta.is_pillar)}
                        className={`relative w-11 h-6 rounded-full transition ${
                          form.meta.is_pillar ? "bg-indigo-600" : "bg-slate-300"
                        }`}
                      >
                        <span
                          className={`absolute top-0.5 right-0.5 w-5 h-5 bg-white rounded-full shadow transition ${
                            form.meta.is_pillar ? "-translate-x-5" : ""
                          }`}
                        />
                      </button>
                    </div>
                  </div>
                )}
              </div>
            </div>
          </div>

          {/* ==================== Sidebar ==================== */}
          <div className="space-y-6">
            {/* SEO Score & Analysis */}
            <div className="bg-white rounded-2xl shadow-sm border border-slate-200 p-5">
              <div className="flex items-center justify-between mb-4">
                <h3 className="font-semibold text-slate-800">تحلیل سئو</h3>
                <span
                  className={`text-2xl font-bold ${
                    seoScore >= 80 ? "text-emerald-600" : seoScore >= 50 ? "text-amber-600" : "text-red-600"
                  }`}
                >
                  {seoScore}
                </span>
              </div>

              <div className="w-full h-2 bg-slate-100 rounded-full overflow-hidden mb-5">
                <div
                  className={`h-full transition-all duration-500 ${
                    seoScore >= 80 ? "bg-emerald-500" : seoScore >= 50 ? "bg-amber-500" : "bg-red-500"
                  }`}
                  style={{ width: `${seoScore}%` }}
                />
              </div>

              <div className="space-y-3 max-h-80 overflow-y-auto pr-1">
                {seoChecks.map((check) => (
                  <div key={check.id} className="flex items-start gap-2.5 text-sm">
                    <StatusIcon status={check.status} />
                    <div>
                      <p className="font-medium text-slate-700">{check.label}</p>
                      <p className="text-xs text-slate-500 mt-0.5">{check.message}</p>
                    </div>
                  </div>
                ))}
              </div>
            </div>

            {/* Publish Box */}
            <div className="bg-white rounded-2xl shadow-sm border border-slate-200 p-5 space-y-5">
              <h3 className="font-semibold text-slate-800">انتشار</h3>

              <div>
                <label className="block text-sm font-medium text-slate-700 mb-1.5">وضعیت</label>
                <select
                  value={form.visibility}
                  onChange={(e) => handleChange("visibility", e.target.value)}
                  className="w-full px-3 py-2.5 border border-slate-200 rounded-lg text-sm focus:ring-2 focus:ring-indigo-500/30 outline-none"
                >
                  <option value="draft">پیش‌نویس</option>
                  <option value="public">عمومی</option>
                  <option value="private">خصوصی</option>
                </select>
              </div>

              <div>
                <label className="block text-sm font-medium text-slate-700 mb-1.5">تاریخ انتشار</label>
                <input
                  type="datetime-local"
                  value={form.published_at}
                  onChange={(e) => handleChange("published_at", e.target.value)}
                  className="w-full px-3 py-2.5 border border-slate-200 rounded-lg text-sm focus:ring-2 focus:ring-indigo-500/30 outline-none"
                />
              </div>

              <div className="flex items-center justify-between">
                <span className="text-sm text-slate-700">فعال باشد</span>
                <button
                  type="button"
                  onClick={() => handleChange("is_active", !form.is_active)}
                  className={`relative w-11 h-6 rounded-full transition ${
                    form.is_active ? "bg-indigo-600" : "bg-slate-300"
                  }`}
                >
                  <span
                    className={`absolute top-0.5 right-0.5 w-5 h-5 bg-white rounded-full shadow transition ${
                      form.is_active ? "-translate-x-5" : ""
                    }`}
                  />
                </button>
              </div>
            </div>

            {/* Category */}
            <div className="bg-white rounded-2xl shadow-sm border border-slate-200 p-5">
              <h3 className="font-semibold text-slate-800 mb-4">دسته‌بندی</h3>
              <select
                value={form.category_id}
                onChange={(e) => handleChange("category_id", Number(e.target.value) || "")}
                className="w-full px-3 py-2.5 border border-slate-200 rounded-lg text-sm focus:ring-2 focus:ring-indigo-500/30 outline-none"
                required
              >
                <option value="">انتخاب دسته‌بندی</option>
                {MOCK_CATEGORIES.map((cat) => (
                  <option key={cat.id} value={cat.id}>
                    {cat.title}
                  </option>
                ))}
              </select>
            </div>

            {/* Google Snippet Preview */}
            <div className="bg-white rounded-2xl shadow-sm border border-slate-200 p-5">
              <div className="flex items-center justify-between mb-4">
                <h3 className="font-semibold text-slate-800">پیش‌نمایش گوگل</h3>
                <div className="flex gap-1 bg-slate-100 rounded-lg p-0.5">
                  <button
                    type="button"
                    onClick={() => setSnippetView("desktop")}
                    className={`px-2.5 py-1 text-xs rounded-md transition ${
                      snippetView === "desktop" ? "bg-white shadow text-slate-800" : "text-slate-500"
                    }`}
                  >
                    دسکتاپ
                  </button>
                  <button
                    type="button"
                    onClick={() => setSnippetView("mobile")}
                    className={`px-2.5 py-1 text-xs rounded-md transition ${
                      snippetView === "mobile" ? "bg-white shadow text-slate-800" : "text-slate-500"
                    }`}
                  >
                    موبایل
                  </button>
                </div>
              </div>

              <div className={`${snippetView === "mobile" ? "max-w-[280px]" : ""}`}>
                <p className="text-[#1a0dab] text-lg leading-snug hover:underline cursor-pointer line-clamp-1">
                  {form.meta.meta_title || form.title || "عنوان پست"}
                </p>
                <p className="text-[#006621] text-sm mt-0.5" dir="ltr">
                  example.com › blog › {form.slug || "post-slug"}
                </p>
                <p className="text-[#4d5156] text-sm leading-relaxed mt-1 line-clamp-2">
                  {form.meta.meta_description || form.excerpt || "توضیحات متا اینجا نمایش داده می‌شود..."}
                </p>
              </div>
            </div>
          </div>
        </div>
      </form>
    </div>
  );
}