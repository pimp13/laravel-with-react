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
  meta_title: string;
  meta_description: string;
  meta_keywords: string;
  focus_keyword: string;
  canonical_url: string;
  robots: string;
  og_title: string;
  og_description: string;
  og_image: string;
  og_type: string;
  twitter_card: string;
  twitter_title: string;
  twitter_description: string;
  twitter_image: string;
  schema_type: string;
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

const estimateReadingTime = (html: string) => {
  const text = html.replace(/<[^>]*>/g, " ");
  const words = text.trim().split(/\s+/).filter(Boolean).length;
  return Math.max(1, Math.ceil(words / 200));
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
    className={`p-2 rounded-lg transition-colors ${isActive
      ? "bg-indigo-100 text-indigo-700"
      : "text-slate-600 hover:bg-slate-100 hover:text-slate-900"
      } disabled:opacity-40 disabled:cursor-not-allowed`}
  >
    {children}
  </button>
);

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
      og_title: "",
      og_description: "",
      og_image: "",
      og_type: "article",
      twitter_card: "summary_large_image",
      twitter_title: "",
      twitter_description: "",
      twitter_image: "",
      schema_type: "BlogPosting",
      reading_time: 5,
      tags: [],
    },
  });

  const [activeTab, setActiveTab] = useState<"content" | "seo" | "settings">("content");
  const [slugManual, setSlugManual] = useState(false);
  const [saving, setSaving] = useState(false);
  const [tagInput, setTagInput] = useState("");

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

    // await axios.post('/api/posts', payload);

    setTimeout(() => {
      setSaving(false);
      alert("✅ پست با موفقیت ذخیره شد! (فعلاً فقط در کنسول چاپ شده)");
    }, 800);
  };

  const seoScore = useMemo(() => {
    let score = 0;
    if (form.meta.meta_title.length >= 30 && form.meta.meta_title.length <= 60) score += 20;
    if (form.meta.meta_description.length >= 120 && form.meta.meta_description.length <= 160) score += 20;
    if (form.meta.focus_keyword) score += 15;
    if (form.meta.canonical_url) score += 10;
    if (form.featured_image) score += 10;
    if (form.meta.og_title && form.meta.og_description) score += 10;
    if (form.meta.tags.length > 0) score += 10;
    if (form.excerpt) score += 5;
    return Math.min(100, score);
  }, [form]);

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
              {saving ? (
                <>
                  <svg className="animate-spin w-4 h-4" viewBox="0 0 24 24">
                    <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" fill="none" />
                    <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4z" />
                  </svg>
                  در حال ذخیره...
                </>
              ) : (
                "انتشار پست"
              )}
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
                  { id: "seo", label: "سئو تکنیکال" },
                  { id: "settings", label: "تنظیمات" },
                ].map((tab) => (
                  <button
                    key={tab.id}
                    type="button"
                    onClick={() => setActiveTab(tab.id as any)}
                    className={`flex-1 py-3.5 text-sm font-medium transition ${activeTab === tab.id
                      ? "text-indigo-600 border-b-2 border-indigo-600 bg-indigo-50/50"
                      : "text-slate-500 hover:text-slate-700 hover:bg-slate-50"
                      }`}
                  >
                    {tab.label}
                  </button>
                ))}
              </div>

              <div className="p-6">
                {/* ========== Content Tab ========== */}
                {activeTab === "content" && (
                  <div className="space-y-6">
                    <div>
                      <label className="block text-sm font-medium text-slate-700 mb-3">
                        محتوای پست
                      </label>

                      {/* Toolbar */}
                      {editor && (
                        <div className="border border-slate-200 rounded-t-xl bg-slate-50 p-2 flex flex-wrap gap-1">
                          <ToolbarButton
                            onClick={() => editor.chain().focus().toggleBold().run()}
                            isActive={editor.isActive("bold")}
                            title="ضخیم"
                          >
                            <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2.5} d="M6 4h8a4 4 0 014 4 4 4 0 01-4 4H6z" />
                              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2.5} d="M6 12h9a4 4 0 014 4 4 4 0 01-4 4H6z" />
                            </svg>
                          </ToolbarButton>

                          <ToolbarButton
                            onClick={() => editor.chain().focus().toggleItalic().run()}
                            isActive={editor.isActive("italic")}
                            title="ایتالیک"
                          >
                            <span className="font-serif italic text-sm">I</span>
                          </ToolbarButton>

                          <ToolbarButton
                            onClick={() => editor.chain().focus().toggleUnderline().run()}
                            isActive={editor.isActive("underline")}
                            title="زیرخط"
                          >
                            <span className="underline text-sm font-medium">U</span>
                          </ToolbarButton>

                          <ToolbarButton
                            onClick={() => editor.chain().focus().toggleStrike().run()}
                            isActive={editor.isActive("strike")}
                            title="خط خورده"
                          >
                            <span className="line-through text-sm">S</span>
                          </ToolbarButton>

                          <div className="w-px h-6 bg-slate-300 mx-1 self-center" />

                          <ToolbarButton
                            onClick={() => editor.chain().focus().toggleHeading({ level: 2 }).run()}
                            isActive={editor.isActive("heading", { level: 2 })}
                            title="عنوان ۲"
                          >
                            H2
                          </ToolbarButton>
                          <ToolbarButton
                            onClick={() => editor.chain().focus().toggleHeading({ level: 3 }).run()}
                            isActive={editor.isActive("heading", { level: 3 })}
                            title="عنوان ۳"
                          >
                            H3
                          </ToolbarButton>

                          <div className="w-px h-6 bg-slate-300 mx-1 self-center" />

                          <ToolbarButton
                            onClick={() => editor.chain().focus().toggleBulletList().run()}
                            isActive={editor.isActive("bulletList")}
                            title="لیست نقطه‌ای"
                          >
                            <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 6h16M4 12h16M4 18h16" />
                            </svg>
                          </ToolbarButton>
                          <ToolbarButton
                            onClick={() => editor.chain().focus().toggleOrderedList().run()}
                            isActive={editor.isActive("orderedList")}
                            title="لیست شماره‌ای"
                          >
                            <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M7 20h14M7 12h14M7 4h14M3 20h.01M3 12h.01M3 4h.01" />
                            </svg>
                          </ToolbarButton>

                          <div className="w-px h-6 bg-slate-300 mx-1 self-center" />

                          <ToolbarButton
                            onClick={() => editor.chain().focus().setTextAlign("right").run()}
                            isActive={editor.isActive({ textAlign: "right" })}
                            title="راست‌چین"
                          >
                            راست
                          </ToolbarButton>
                          <ToolbarButton
                            onClick={() => editor.chain().focus().setTextAlign("center").run()}
                            isActive={editor.isActive({ textAlign: "center" })}
                            title="وسط‌چین"
                          >
                            وسط
                          </ToolbarButton>
                          <ToolbarButton
                            onClick={() => editor.chain().focus().setTextAlign("left").run()}
                            isActive={editor.isActive({ textAlign: "left" })}
                            title="چپ‌چین"
                          >
                            چپ
                          </ToolbarButton>

                          <div className="w-px h-6 bg-slate-300 mx-1 self-center" />

                          <ToolbarButton onClick={setLink} isActive={editor.isActive("link")} title="لینک">
                            <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13.828 10.172a4 4 0 00-5.656 0l-4 4a4 4 0 105.656 5.656l1.102-1.101m-.758-4.899a4 4 0 005.656 0l4-4a4 4 0 00-5.656-5.656l-1.1 1.1" />
                            </svg>
                          </ToolbarButton>

                          <ToolbarButton onClick={addImage} title="تصویر">
                            <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 16l4.586-4.586a2 2 0 012.828 0L16 16m-2-2l1.586-1.586a2 2 0 012.828 0L20 14m-6-6h.01M6 20h12a2 2 0 002-2V6a2 2 0 00-2-2H6a2 2 0 00-2 2v12a2 2 0 002 2z" />
                            </svg>
                          </ToolbarButton>

                          <ToolbarButton
                            onClick={() => editor.chain().focus().toggleBlockquote().run()}
                            isActive={editor.isActive("blockquote")}
                            title="نقل قول"
                          >
                            <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8 10h.01M12 10h.01M16 10h.01M9 16H5a2 2 0 01-2-2V6a2 2 0 012-2h14a2 2 0 012 2v8a2 2 0 01-2 2h-5l-5 5v-5z" />
                            </svg>
                          </ToolbarButton>

                          <ToolbarButton
                            onClick={() => editor.chain().focus().toggleCodeBlock().run()}
                            isActive={editor.isActive("codeBlock")}
                            title="بلوک کد"
                          >
                            <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M10 20l4-16m4 4l4 4-4 4M6 16l-4-4 4-4" />
                            </svg>
                          </ToolbarButton>
                        </div>
                      )}

                      {/* Editor */}
                      <div className="border border-t-0 border-slate-200 rounded-b-xl overflow-hidden bg-white">
                        <EditorContent editor={editor} />
                      </div>

                      <p className="mt-2 text-xs text-slate-500">
                        زمان مطالعه تخمینی:{" "}
                        <span className="font-medium text-slate-700">
                          {form.meta.reading_time} دقیقه
                        </span>
                      </p>
                    </div>

                    <div>
                      <label className="block text-sm font-medium text-slate-700 mb-2">
                        خلاصه (Excerpt)
                      </label>
                      <textarea
                        value={form.excerpt}
                        onChange={(e) => handleChange("excerpt", e.target.value)}
                        rows={3}
                        placeholder="یک خلاصه کوتاه و جذاب برای نمایش در لیست پست‌ها..."
                        className="w-full px-4 py-3 border border-slate-200 rounded-xl focus:ring-2 focus:ring-indigo-500/30 focus:border-indigo-400 outline-none resize-none"
                      />
                      <p className="mt-1 text-xs text-slate-500">
                        {form.excerpt.length}/160 کاراکتر (پیشنهادی)
                      </p>
                    </div>
                  </div>
                )}

                {/* ========== SEO Tab ========== */}
                {activeTab === "seo" && (
                  <div className="space-y-8">
                    {/* SEO Score */}
                    <div className="flex items-center justify-between p-4 bg-slate-50 rounded-xl">
                      <div>
                        <p className="text-sm font-medium text-slate-700">امتیاز سئو</p>
                        <p className="text-xs text-slate-500 mt-0.5">بر اساس فیلدهای پر شده</p>
                      </div>
                      <div className="flex items-center gap-3">
                        <div className="w-32 h-2 bg-slate-200 rounded-full overflow-hidden">
                          <div
                            className={`h-full transition-all duration-500 ${seoScore >= 80
                              ? "bg-emerald-500"
                              : seoScore >= 50
                                ? "bg-amber-500"
                                : "bg-red-500"
                              }`}
                            style={{ width: `${seoScore}%` }}
                          />
                        </div>
                        <span className="text-lg font-bold text-slate-800">{seoScore}</span>
                      </div>
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
                          placeholder="عنوان نمایش داده شده در گوگل"
                        />
                        <p className="mt-1 text-xs text-slate-500">{form.meta.meta_title.length}/60 کاراکتر</p>
                      </div>

                      <div>
                        <label className="block text-sm font-medium text-slate-700 mb-1.5">Meta Description</label>
                        <textarea
                          value={form.meta.meta_description}
                          onChange={(e) => handleMetaChange("meta_description", e.target.value)}
                          rows={3}
                          className="w-full px-3 py-2.5 border border-slate-200 rounded-lg text-sm focus:ring-2 focus:ring-indigo-500/30 outline-none resize-none"
                          placeholder="توضیح کوتاه برای نتایج جستجو"
                        />
                        <p className="mt-1 text-xs text-slate-500">{form.meta.meta_description.length}/160 کاراکتر</p>
                      </div>

                      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                        <div>
                          <label className="block text-sm font-medium text-slate-700 mb-1.5">Focus Keyword</label>
                          <input
                            type="text"
                            value={form.meta.focus_keyword}
                            onChange={(e) => handleMetaChange("focus_keyword", e.target.value)}
                            className="w-full px-3 py-2.5 border border-slate-200 rounded-lg text-sm focus:ring-2 focus:ring-indigo-500/30 outline-none"
                            placeholder="کلمه کلیدی اصلی"
                          />
                        </div>
                        <div>
                          <label className="block text-sm font-medium text-slate-700 mb-1.5">Meta Keywords</label>
                          <input
                            type="text"
                            value={form.meta.meta_keywords}
                            onChange={(e) => handleMetaChange("meta_keywords", e.target.value)}
                            className="w-full px-3 py-2.5 border border-slate-200 rounded-lg text-sm focus:ring-2 focus:ring-indigo-500/30 outline-none"
                            placeholder="کلمه1, کلمه2, کلمه3"
                          />
                        </div>
                      </div>

                      <div>
                        <label className="block text-sm font-medium text-slate-700 mb-1.5">Canonical URL</label>
                        <input
                          type="url"
                          value={form.meta.canonical_url}
                          onChange={(e) => handleMetaChange("canonical_url", e.target.value)}
                          className="w-full px-3 py-2.5 border border-slate-200 rounded-lg text-sm focus:ring-2 focus:ring-indigo-500/30 outline-none"
                          placeholder="https://example.com/blog/post-slug"
                          dir="ltr"
                        />
                      </div>

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
                    </div>

                    {/* Open Graph */}
                    <div className="space-y-5">
                      <h3 className="text-sm font-semibold text-slate-800 border-b pb-2">Open Graph</h3>
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
                          <label className="block text-sm font-medium text-slate-700 mb-1.5">OG Type</label>
                          <select
                            value={form.meta.og_type}
                            onChange={(e) => handleMetaChange("og_type", e.target.value)}
                            className="w-full px-3 py-2.5 border border-slate-200 rounded-lg text-sm focus:ring-2 focus:ring-indigo-500/30 outline-none"
                          >
                            <option value="article">article</option>
                            <option value="website">website</option>
                            <option value="blog">blog</option>
                          </select>
                        </div>
                      </div>
                      <div>
                        <label className="block text-sm font-medium text-slate-700 mb-1.5">OG Description</label>
                        <textarea
                          value={form.meta.og_description}
                          onChange={(e) => handleMetaChange("og_description", e.target.value)}
                          rows={2}
                          className="w-full px-3 py-2.5 border border-slate-200 rounded-lg text-sm focus:ring-2 focus:ring-indigo-500/30 outline-none resize-none"
                        />
                      </div>
                      <div>
                        <label className="block text-sm font-medium text-slate-700 mb-1.5">OG Image URL</label>
                        <input
                          type="url"
                          value={form.meta.og_image}
                          onChange={(e) => handleMetaChange("og_image", e.target.value)}
                          className="w-full px-3 py-2.5 border border-slate-200 rounded-lg text-sm focus:ring-2 focus:ring-indigo-500/30 outline-none"
                          dir="ltr"
                        />
                      </div>
                    </div>

                    {/* Twitter + Schema */}
                    <div className="space-y-5">
                      <h3 className="text-sm font-semibold text-slate-800 border-b pb-2">Twitter Card & Schema</h3>
                      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
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
                        <div>
                          <label className="block text-sm font-medium text-slate-700 mb-1.5">Schema Type</label>
                          <select
                            value={form.meta.schema_type}
                            onChange={(e) => handleMetaChange("schema_type", e.target.value)}
                            className="w-full px-3 py-2.5 border border-slate-200 rounded-lg text-sm focus:ring-2 focus:ring-indigo-500/30 outline-none"
                          >
                            <option value="BlogPosting">BlogPosting</option>
                            <option value="Article">Article</option>
                            <option value="NewsArticle">NewsArticle</option>
                            <option value="TechArticle">TechArticle</option>
                          </select>
                        </div>
                      </div>
                    </div>
                  </div>
                )}

                {/* ========== Settings Tab ========== */}
                {activeTab === "settings" && (
                  <div className="space-y-6">
                    <div>
                      <label className="block text-sm font-medium text-slate-700 mb-2">
                        تصویر شاخص (Featured Image)
                      </label>
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
                  </div>
                )}
              </div>
            </div>
          </div>

          {/* ==================== Sidebar ==================== */}
          <div className="space-y-6">
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
                  className={`relative w-11 h-6 rounded-full transition ${form.is_active ? "bg-indigo-600" : "bg-slate-300"
                    }`}
                >
                  <span
                    className={`absolute top-0.5 right-0.5 w-5 h-5 bg-white rounded-full shadow transition ${form.is_active ? "-translate-x-5" : ""
                      }`}
                  />
                </button>
              </div>
            </div>

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

            {/* Google Preview */}
            <div className="bg-white rounded-2xl shadow-sm border border-slate-200 p-5">
              <h3 className="font-semibold text-slate-800 mb-4">پیش‌نمایش گوگل</h3>
              <div className="space-y-1">
                <p className="text-blue-700 text-lg leading-snug hover:underline cursor-pointer line-clamp-1">
                  {form.meta.meta_title || form.title || "عنوان پست"}
                </p>
                <p className="text-emerald-700 text-sm" dir="ltr">
                  example.com/blog/{form.slug || "post-slug"}
                </p>
                <p className="text-slate-600 text-sm leading-relaxed line-clamp-2">
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