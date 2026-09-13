import PanelLayout from "@/layouts/PanelLayout";
import {
  Bell,
  Database,
  Globe,
  Image,
  Link2,
  Lock,
  Mail,
  Palette,
  Save,
  Search,
  Settings as SettingsIcon,
  Share2,
  Shield,
  Type,
} from "lucide-react";
import React, { useState } from "react";

/* -------------------------------------------------------------------------- */
/* Types                                                                      */
/* -------------------------------------------------------------------------- */

type SettingsTab =
  | "general"
  | "writing"
  | "reading"
  | "discussion"
  | "media"
  | "permalinks"
  | "seo"
  | "social"
  | "privacy"
  | "advanced";

interface SettingsForm {
  // General
  site_title: string;
  tagline: string;
  admin_email: string;
  timezone: string;
  date_format: string;
  time_format: string;
  language: string;
  site_url: string;

  // Writing
  default_category: string;
  default_post_format: string;
  emojis_enabled: boolean;

  // Reading
  posts_per_page: number;
  show_on_front: "posts" | "page";
  page_on_front: string;
  page_for_posts: string;
  search_engine_visibility: boolean;

  // Discussion
  allow_comments: boolean;
  comment_moderation: boolean;
  comment_registration: boolean;
  close_comments_days: number;
  thread_comments: boolean;
  thread_comments_depth: number;

  // Media
  thumbnail_width: number;
  thumbnail_height: number;
  medium_width: number;
  medium_height: number;
  large_width: number;
  large_height: number;
  uploads_organize: boolean;

  // Permalinks
  permalink_structure: string;
  category_base: string;
  tag_base: string;

  // SEO
  meta_title_separator: string;
  homepage_meta_title: string;
  homepage_meta_description: string;
  noindex_archives: boolean;
  noindex_search: boolean;

  // Social
  facebook_url: string;
  twitter_url: string;
  instagram_url: string;
  linkedin_url: string;
  youtube_url: string;
  default_og_image: string;

  // Privacy
  privacy_policy_page: string;
  terms_page: string;
  cookie_notice: boolean;
  cookie_notice_text: string;

  // Advanced
  maintenance_mode: boolean;
  debug_mode: boolean;
  cache_enabled: boolean;
  cache_ttl: number;
  api_rate_limit: number;
}

/* -------------------------------------------------------------------------- */
/* Initial data (بعداً از Inertia props می‌آید)                                */
/* -------------------------------------------------------------------------- */

const INITIAL: SettingsForm = {
  site_title: "سایت من",
  tagline: "توضیح کوتاه سایت",
  admin_email: "admin@example.com",
  timezone: "Asia/Tehran",
  date_format: "Y/m/d",
  time_format: "H:i",
  language: "fa",
  site_url: "https://example.com",

  default_category: "1",
  default_post_format: "standard",
  emojis_enabled: true,

  posts_per_page: 10,
  show_on_front: "posts",
  page_on_front: "",
  page_for_posts: "",
  search_engine_visibility: false,

  allow_comments: true,
  comment_moderation: true,
  comment_registration: false,
  close_comments_days: 14,
  thread_comments: true,
  thread_comments_depth: 5,

  thumbnail_width: 150,
  thumbnail_height: 150,
  medium_width: 300,
  medium_height: 300,
  large_width: 1024,
  large_height: 1024,
  uploads_organize: true,

  permalink_structure: "/%postname%/",
  category_base: "category",
  tag_base: "tag",

  meta_title_separator: "|",
  homepage_meta_title: "",
  homepage_meta_description: "",
  noindex_archives: true,
  noindex_search: true,

  facebook_url: "",
  twitter_url: "",
  instagram_url: "",
  linkedin_url: "",
  youtube_url: "",
  default_og_image: "",

  privacy_policy_page: "",
  terms_page: "",
  cookie_notice: true,
  cookie_notice_text: "ما از کوکی برای بهبود تجربه شما استفاده می‌کنیم.",

  maintenance_mode: false,
  debug_mode: false,
  cache_enabled: true,
  cache_ttl: 300,
  api_rate_limit: 60,
};

/* -------------------------------------------------------------------------- */
/* UI Helpers                                                                 */
/* -------------------------------------------------------------------------- */

function Field({
  label,
  hint,
  children,
}: {
  label: string;
  hint?: string;
  children: React.ReactNode;
}) {
  return (
    <div className="space-y-1.5">
      <label className="block text-sm font-medium text-slate-700">
        {label}
      </label>
      {children}
      {hint && <p className="text-xs text-slate-400 leading-5">{hint}</p>}
    </div>
  );
}

function Section({
  title,
  description,
  children,
}: {
  title: string;
  description?: string;
  children: React.ReactNode;
}) {
  return (
    <section className="space-y-5">
      <div className="border-b border-slate-100 pb-3">
        <h3 className="text-base font-semibold text-slate-800">{title}</h3>
        {description && (
          <p className="mt-1 text-sm text-slate-500">{description}</p>
        )}
      </div>
      <div className="space-y-5">{children}</div>
    </section>
  );
}

function Toggle({
  checked,
  onChange,
  label,
  description,
}: {
  checked: boolean;
  onChange: (v: boolean) => void;
  label: string;
  description?: string;
}) {
  return (
    <div className="flex items-start justify-between gap-4 py-1">
      <div>
        <p className="text-sm font-medium text-slate-700">{label}</p>
        {description && (
          <p className="mt-0.5 text-xs text-slate-400">{description}</p>
        )}
      </div>
      <button
        type="button"
        onClick={() => onChange(!checked)}
        className={`relative h-6 w-11 shrink-0 rounded-full transition ${
          checked ? "bg-[#2271b1]" : "bg-slate-300"
        }`}
      >
        <span
          className={`absolute top-0.5 h-5 w-5 rounded-full bg-white shadow transition ${
            checked ? "right-0.5" : "right-5"
          }`}
        />
      </button>
    </div>
  );
}

const inputClass =
  "w-full rounded-lg border border-slate-200 px-3 py-2.5 text-sm outline-none focus:border-[#2271b1] focus:ring-2 focus:ring-[#2271b1]/20";

/* -------------------------------------------------------------------------- */
/* Tabs config                                                                */
/* -------------------------------------------------------------------------- */

const TABS: {
  id: SettingsTab;
  label: string;
  icon: React.ReactNode;
}[] = [
  { id: "general", label: "عمومی", icon: <Globe className="h-4 w-4" /> },
  { id: "writing", label: "نوشتن", icon: <Type className="h-4 w-4" /> },
  {
    id: "reading",
    label: "خواندن",
    icon: <SettingsIcon className="h-4 w-4" />,
  },
  { id: "discussion", label: "گفت‌وگو", icon: <Bell className="h-4 w-4" /> },
  { id: "media", label: "رسانه", icon: <Image className="h-4 w-4" /> },
  {
    id: "permalinks",
    label: "پیوند یکتا",
    icon: <Link2 className="h-4 w-4" />,
  },
  { id: "seo", label: "سئو", icon: <Search className="h-4 w-4" /> },
  {
    id: "social",
    label: "شبکه‌های اجتماعی",
    icon: <Share2 className="h-4 w-4" />,
  },
  { id: "privacy", label: "حریم خصوصی", icon: <Shield className="h-4 w-4" /> },
  { id: "advanced", label: "پیشرفته", icon: <Database className="h-4 w-4" /> },
];

/* -------------------------------------------------------------------------- */
/* Main Component                                                             */
/* -------------------------------------------------------------------------- */

export default function SettingsPage() {
  const [activeTab, setActiveTab] = useState<SettingsTab>("general");
  const [form, setForm] = useState<SettingsForm>(INITIAL);
  const [saving, setSaving] = useState(false);
  const [saved, setSaved] = useState(false);

  const set = <K extends keyof SettingsForm>(
    key: K,
    value: SettingsForm[K],
  ) => {
    setForm((prev) => ({ ...prev, [key]: value }));
    setSaved(false);
  };

  const handleSave = (e: React.FormEvent) => {
    e.preventDefault();
    setSaving(true);

    // فعلاً فقط UI — بعداً به API وصل می‌شود
    setTimeout(() => {
      setSaving(false);
      setSaved(true);
      setTimeout(() => setSaved(false), 3000);
    }, 800);
  };

  return (
    <PanelLayout title="تنظیمات">
      <div className="mb-6 flex flex-wrap items-center justify-between gap-4">
        <div>
          <h2 className="text-lg font-semibold text-slate-800">تنظیمات سایت</h2>
          <p className="mt-0.5 text-sm text-slate-500">
            مدیریت کامل تنظیمات وبسایت و اپلیکیشن
          </p>
        </div>

        <button
          type="submit"
          form="settings-form"
          disabled={saving}
          className="inline-flex items-center gap-2 rounded-lg bg-[#2271b1] px-5 py-2.5 text-sm font-medium text-white shadow-sm hover:bg-[#135e96] disabled:opacity-60"
        >
          <Save className="h-4 w-4" />
          {saving ? "در حال ذخیره..." : saved ? "ذخیره شد ✓" : "ذخیره تغییرات"}
        </button>
      </div>

      <div className="grid grid-cols-1 gap-6 lg:grid-cols-4">
        {/* ===================== سایدبار تب‌ها ===================== */}
        <aside className="lg:col-span-1">
          <nav className="sticky top-24 space-y-1 rounded-xl border border-slate-200 bg-white p-2 shadow-sm">
            {TABS.map((tab) => (
              <button
                key={tab.id}
                type="button"
                onClick={() => setActiveTab(tab.id)}
                className={`flex w-full items-center gap-3 rounded-lg px-3 py-2.5 text-sm transition ${
                  activeTab === tab.id
                    ? "bg-[#2271b1] text-white"
                    : "text-slate-600 hover:bg-slate-50 hover:text-slate-900"
                }`}
              >
                {tab.icon}
                {tab.label}
              </button>
            ))}
          </nav>
        </aside>

        {/* ===================== محتوای تنظیمات ===================== */}
        <div className="lg:col-span-3">
          <form
            id="settings-form"
            onSubmit={handleSave}
            className="rounded-xl border border-slate-200 bg-white shadow-sm"
          >
            <div className="p-6 sm:p-8">
              {/* ---------- GENERAL ---------- */}
              {activeTab === "general" && (
                <Section
                  title="تنظیمات عمومی"
                  description="اطلاعات پایه سایت که در عنوان مرورگر و جاهای مختلف نمایش داده می‌شود."
                >
                  <Field label="عنوان سایت" hint="نام اصلی وبسایت شما">
                    <input
                      className={inputClass}
                      value={form.site_title}
                      onChange={(e) => set("site_title", e.target.value)}
                    />
                  </Field>

                  <Field
                    label="معرفی کوتاه (Tagline)"
                    hint="یک جمله کوتاه درباره سایت"
                  >
                    <input
                      className={inputClass}
                      value={form.tagline}
                      onChange={(e) => set("tagline", e.target.value)}
                    />
                  </Field>

                  <Field
                    label="آدرس سایت (URL)"
                    hint="مثال: https://example.com"
                  >
                    <input
                      className={inputClass}
                      dir="ltr"
                      value={form.site_url}
                      onChange={(e) => set("site_url", e.target.value)}
                    />
                  </Field>

                  <Field
                    label="ایمیل مدیریت"
                    hint="برای اعلان‌های مهم استفاده می‌شود"
                  >
                    <input
                      type="email"
                      className={inputClass}
                      dir="ltr"
                      value={form.admin_email}
                      onChange={(e) => set("admin_email", e.target.value)}
                    />
                  </Field>

                  <div className="grid gap-5 sm:grid-cols-2">
                    <Field label="منطقه زمانی">
                      <select
                        className={inputClass}
                        value={form.timezone}
                        onChange={(e) => set("timezone", e.target.value)}
                      >
                        <option value="Asia/Tehran">تهران (Asia/Tehran)</option>
                        <option value="UTC">UTC</option>
                        <option value="Europe/London">لندن</option>
                        <option value="America/New_York">نیویورک</option>
                      </select>
                    </Field>

                    <Field label="زبان سایت">
                      <select
                        className={inputClass}
                        value={form.language}
                        onChange={(e) => set("language", e.target.value)}
                      >
                        <option value="fa">فارسی</option>
                        <option value="en">English</option>
                      </select>
                    </Field>
                  </div>

                  <div className="grid gap-5 sm:grid-cols-2">
                    <Field label="فرمت تاریخ">
                      <select
                        className={inputClass}
                        value={form.date_format}
                        onChange={(e) => set("date_format", e.target.value)}
                      >
                        <option value="Y/m/d">۱۴۰۵/۰۶/۲۲</option>
                        <option value="d F Y">۲۲ شهریور ۱۴۰۵</option>
                        <option value="Y-m-d">2026-09-13</option>
                      </select>
                    </Field>

                    <Field label="فرمت ساعت">
                      <select
                        className={inputClass}
                        value={form.time_format}
                        onChange={(e) => set("time_format", e.target.value)}
                      >
                        <option value="H:i">۱۴:۳۰</option>
                        <option value="h:i a">۲:۳۰ ب.ظ</option>
                      </select>
                    </Field>
                  </div>
                </Section>
              )}

              {/* ---------- WRITING ---------- */}
              {activeTab === "writing" && (
                <Section
                  title="تنظیمات نوشتن"
                  description="پیش‌فرض‌های مربوط به ایجاد محتوا."
                >
                  <Field label="دسته پیش‌فرض نوشته‌ها">
                    <select
                      className={inputClass}
                      value={form.default_category}
                      onChange={(e) => set("default_category", e.target.value)}
                    >
                      <option value="1">برنامه‌نویسی</option>
                      <option value="2">سئو</option>
                      <option value="3">فرانت‌اند</option>
                    </select>
                  </Field>

                  <Field label="فرمت پیش‌فرض نوشته">
                    <select
                      className={inputClass}
                      value={form.default_post_format}
                      onChange={(e) =>
                        set("default_post_format", e.target.value)
                      }
                    >
                      <option value="standard">استاندارد</option>
                      <option value="aside">یادداشت</option>
                      <option value="gallery">گالری</option>
                      <option value="video">ویدیو</option>
                    </select>
                  </Field>

                  <Toggle
                    label="تبدیل اموجی به تصویر"
                    description="اموجی‌های متن به تصویر تبدیل شوند"
                    checked={form.emojis_enabled}
                    onChange={(v) => set("emojis_enabled", v)}
                  />
                </Section>
              )}

              {/* ---------- READING ---------- */}
              {activeTab === "reading" && (
                <Section
                  title="تنظیمات خواندن"
                  description="نحوه نمایش محتوا در صفحه اصلی و آرشیوها."
                >
                  <Field label="صفحه اصلی نمایش دهد">
                    <div className="space-y-3">
                      <label className="flex items-center gap-2 text-sm">
                        <input
                          type="radio"
                          checked={form.show_on_front === "posts"}
                          onChange={() => set("show_on_front", "posts")}
                          className="text-[#2271b1]"
                        />
                        آخرین نوشته‌ها
                      </label>
                      <label className="flex items-center gap-2 text-sm">
                        <input
                          type="radio"
                          checked={form.show_on_front === "page"}
                          onChange={() => set("show_on_front", "page")}
                          className="text-[#2271b1]"
                        />
                        یک صفحه ثابت
                      </label>
                    </div>
                  </Field>

                  <Field label="تعداد نوشته در هر صفحه">
                    <input
                      type="number"
                      min={1}
                      max={50}
                      className={inputClass}
                      value={form.posts_per_page}
                      onChange={(e) =>
                        set("posts_per_page", Number(e.target.value))
                      }
                    />
                  </Field>

                  <Toggle
                    label="مخفی کردن سایت از موتورهای جستجو"
                    description="با فعال کردن این گزینه، درخواست می‌شود که موتورهای جستجو سایت را ایندکس نکنند"
                    checked={form.search_engine_visibility}
                    onChange={(v) => set("search_engine_visibility", v)}
                  />
                </Section>
              )}

              {/* ---------- DISCUSSION ---------- */}
              {activeTab === "discussion" && (
                <Section
                  title="تنظیمات گفت‌وگو (نظرات)"
                  description="کنترل سیستم نظرات سایت."
                >
                  <Toggle
                    label="اجازه ثبت نظر روی نوشته‌های جدید"
                    checked={form.allow_comments}
                    onChange={(v) => set("allow_comments", v)}
                  />
                  <Toggle
                    label="نظرات باید تأیید شوند"
                    description="نظرات قبل از نمایش نیاز به تأیید مدیر دارند"
                    checked={form.comment_moderation}
                    onChange={(v) => set("comment_moderation", v)}
                  />
                  <Toggle
                    label="کاربر باید برای نظر دادن ثبت‌نام کند"
                    checked={form.comment_registration}
                    onChange={(v) => set("comment_registration", v)}
                  />
                  <Toggle
                    label="نظرات تو در تو (Threaded)"
                    checked={form.thread_comments}
                    onChange={(v) => set("thread_comments", v)}
                  />

                  <div className="grid gap-5 sm:grid-cols-2">
                    <Field label="بستن نظرات پس از چند روز">
                      <input
                        type="number"
                        min={0}
                        className={inputClass}
                        value={form.close_comments_days}
                        onChange={(e) =>
                          set("close_comments_days", Number(e.target.value))
                        }
                      />
                    </Field>
                    <Field label="عمق نظرات تو در تو">
                      <input
                        type="number"
                        min={1}
                        max={10}
                        className={inputClass}
                        value={form.thread_comments_depth}
                        onChange={(e) =>
                          set("thread_comments_depth", Number(e.target.value))
                        }
                      />
                    </Field>
                  </div>
                </Section>
              )}

              {/* ---------- MEDIA ---------- */}
              {activeTab === "media" && (
                <Section
                  title="تنظیمات رسانه"
                  description="اندازه تصاویر بندانگشتی و سازماندهی فایل‌ها."
                >
                  <div className="grid gap-5 sm:grid-cols-3">
                    <Field label="بندانگشتی (عرض)">
                      <input
                        type="number"
                        className={inputClass}
                        value={form.thumbnail_width}
                        onChange={(e) =>
                          set("thumbnail_width", Number(e.target.value))
                        }
                      />
                    </Field>
                    <Field label="بندانگشتی (ارتفاع)">
                      <input
                        type="number"
                        className={inputClass}
                        value={form.thumbnail_height}
                        onChange={(e) =>
                          set("thumbnail_height", Number(e.target.value))
                        }
                      />
                    </Field>
                    <div className="flex items-end pb-2 text-xs text-slate-400">
                      پیکسل
                    </div>
                  </div>

                  <div className="grid gap-5 sm:grid-cols-3">
                    <Field label="متوسط (عرض)">
                      <input
                        type="number"
                        className={inputClass}
                        value={form.medium_width}
                        onChange={(e) =>
                          set("medium_width", Number(e.target.value))
                        }
                      />
                    </Field>
                    <Field label="متوسط (ارتفاع)">
                      <input
                        type="number"
                        className={inputClass}
                        value={form.medium_height}
                        onChange={(e) =>
                          set("medium_height", Number(e.target.value))
                        }
                      />
                    </Field>
                  </div>

                  <div className="grid gap-5 sm:grid-cols-3">
                    <Field label="بزرگ (عرض)">
                      <input
                        type="number"
                        className={inputClass}
                        value={form.large_width}
                        onChange={(e) =>
                          set("large_width", Number(e.target.value))
                        }
                      />
                    </Field>
                    <Field label="بزرگ (ارتفاع)">
                      <input
                        type="number"
                        className={inputClass}
                        value={form.large_height}
                        onChange={(e) =>
                          set("large_height", Number(e.target.value))
                        }
                      />
                    </Field>
                  </div>

                  <Toggle
                    label="سازماندهی آپلودها بر اساس سال/ماه"
                    description="فایل‌ها در پوشه‌های سال و ماه ذخیره شوند"
                    checked={form.uploads_organize}
                    onChange={(v) => set("uploads_organize", v)}
                  />
                </Section>
              )}

              {/* ---------- PERMALINKS ---------- */}
              {activeTab === "permalinks" && (
                <Section
                  title="پیوندهای یکتا"
                  description="ساختار URL نوشته‌ها و صفحات."
                >
                  <Field label="ساختار پیوند نوشته‌ها">
                    <div className="space-y-2">
                      {[
                        {
                          value: "/%postname%/",
                          label: "نام نوشته",
                          example: "/sample-post/",
                        },
                        {
                          value: "/%year%/%monthnum%/%postname%/",
                          label: "تاریخ و نام",
                          example: "/2026/09/sample-post/",
                        },
                        {
                          value: "/blog/%postname%/",
                          label: "با پیشوند blog",
                          example: "/blog/sample-post/",
                        },
                        { value: "custom", label: "سفارشی", example: "" },
                      ].map((item) => (
                        <label
                          key={item.value}
                          className="flex items-center gap-3 rounded-lg border border-slate-200 px-4 py-3 cursor-pointer hover:bg-slate-50"
                        >
                          <input
                            type="radio"
                            name="permalink"
                            checked={form.permalink_structure === item.value}
                            onChange={() =>
                              set("permalink_structure", item.value)
                            }
                            className="text-[#2271b1]"
                          />
                          <div>
                            <p className="text-sm font-medium text-slate-700">
                              {item.label}
                            </p>
                            {item.example && (
                              <p className="text-xs text-slate-400" dir="ltr">
                                {item.example}
                              </p>
                            )}
                          </div>
                        </label>
                      ))}
                    </div>
                  </Field>

                  <div className="grid gap-5 sm:grid-cols-2">
                    <Field label="پایه دسته‌ها" hint="پیش‌فرض: category">
                      <input
                        className={inputClass}
                        dir="ltr"
                        value={form.category_base}
                        onChange={(e) => set("category_base", e.target.value)}
                      />
                    </Field>
                    <Field label="پایه برچسب‌ها" hint="پیش‌فرض: tag">
                      <input
                        className={inputClass}
                        dir="ltr"
                        value={form.tag_base}
                        onChange={(e) => set("tag_base", e.target.value)}
                      />
                    </Field>
                  </div>
                </Section>
              )}

              {/* ---------- SEO ---------- */}
              {activeTab === "seo" && (
                <Section
                  title="تنظیمات سئو"
                  description="تنظیمات پایه بهینه‌سازی موتورهای جستجو."
                >
                  <Field label="جداکننده عنوان">
                    <select
                      className={inputClass}
                      value={form.meta_title_separator}
                      onChange={(e) =>
                        set("meta_title_separator", e.target.value)
                      }
                    >
                      <option value="|">|</option>
                      <option value="-">-</option>
                      <option value="•">•</option>
                      <option value="—">—</option>
                    </select>
                  </Field>

                  <Field label="عنوان متا صفحه اصلی">
                    <input
                      className={inputClass}
                      value={form.homepage_meta_title}
                      onChange={(e) =>
                        set("homepage_meta_title", e.target.value)
                      }
                      placeholder="اگر خالی باشد از عنوان سایت استفاده می‌شود"
                    />
                  </Field>

                  <Field label="توضیحات متا صفحه اصلی">
                    <textarea
                      className={inputClass}
                      rows={3}
                      value={form.homepage_meta_description}
                      onChange={(e) =>
                        set("homepage_meta_description", e.target.value)
                      }
                      placeholder="خلاصه سایت برای نتایج جستجو..."
                    />
                  </Field>

                  <Toggle
                    label="noindex برای آرشیوها"
                    description="صفحات آرشیو، دسته و برچسب ایندکس نشوند"
                    checked={form.noindex_archives}
                    onChange={(v) => set("noindex_archives", v)}
                  />
                  <Toggle
                    label="noindex برای نتایج جستجو"
                    checked={form.noindex_search}
                    onChange={(v) => set("noindex_search", v)}
                  />
                </Section>
              )}

              {/* ---------- SOCIAL ---------- */}
              {activeTab === "social" && (
                <Section
                  title="شبکه‌های اجتماعی"
                  description="لینک حساب‌ها و تصویر پیش‌فرض اشتراک‌گذاری."
                >
                  <div className="grid gap-5 sm:grid-cols-2">
                    <Field label="فیسبوک">
                      <input
                        className={inputClass}
                        dir="ltr"
                        placeholder="https://facebook.com/..."
                        value={form.facebook_url}
                        onChange={(e) => set("facebook_url", e.target.value)}
                      />
                    </Field>
                    <Field label="توییتر / X">
                      <input
                        className={inputClass}
                        dir="ltr"
                        placeholder="https://x.com/..."
                        value={form.twitter_url}
                        onChange={(e) => set("twitter_url", e.target.value)}
                      />
                    </Field>
                    <Field label="اینستاگرام">
                      <input
                        className={inputClass}
                        dir="ltr"
                        placeholder="https://instagram.com/..."
                        value={form.instagram_url}
                        onChange={(e) => set("instagram_url", e.target.value)}
                      />
                    </Field>
                    <Field label="لینکدین">
                      <input
                        className={inputClass}
                        dir="ltr"
                        placeholder="https://linkedin.com/..."
                        value={form.linkedin_url}
                        onChange={(e) => set("linkedin_url", e.target.value)}
                      />
                    </Field>
                    <Field label="یوتیوب">
                      <input
                        className={inputClass}
                        dir="ltr"
                        placeholder="https://youtube.com/..."
                        value={form.youtube_url}
                        onChange={(e) => set("youtube_url", e.target.value)}
                      />
                    </Field>
                  </div>

                  <Field
                    label="تصویر پیش‌فرض Open Graph"
                    hint="وقتی نوشته تصویر شاخص نداشته باشد از این استفاده می‌شود"
                  >
                    <input
                      className={inputClass}
                      dir="ltr"
                      placeholder="https://example.com/og-default.jpg"
                      value={form.default_og_image}
                      onChange={(e) => set("default_og_image", e.target.value)}
                    />
                  </Field>
                </Section>
              )}

              {/* ---------- PRIVACY ---------- */}
              {activeTab === "privacy" && (
                <Section
                  title="حریم خصوصی و قوانین"
                  description="صفحات قانونی و اعلان کوکی."
                >
                  <Field label="صفحه سیاست حریم خصوصی">
                    <select
                      className={inputClass}
                      value={form.privacy_policy_page}
                      onChange={(e) =>
                        set("privacy_policy_page", e.target.value)
                      }
                    >
                      <option value="">— انتخاب صفحه —</option>
                      <option value="1">حریم خصوصی</option>
                      <option value="2">قوانین و مقررات</option>
                    </select>
                  </Field>

                  <Field label="صفحه قوانین و شرایط">
                    <select
                      className={inputClass}
                      value={form.terms_page}
                      onChange={(e) => set("terms_page", e.target.value)}
                    >
                      <option value="">— انتخاب صفحه —</option>
                      <option value="1">حریم خصوصی</option>
                      <option value="2">قوانین و مقررات</option>
                    </select>
                  </Field>

                  <Toggle
                    label="نمایش اعلان کوکی"
                    checked={form.cookie_notice}
                    onChange={(v) => set("cookie_notice", v)}
                  />

                  <Field label="متن اعلان کوکی">
                    <textarea
                      className={inputClass}
                      rows={3}
                      value={form.cookie_notice_text}
                      onChange={(e) =>
                        set("cookie_notice_text", e.target.value)
                      }
                    />
                  </Field>
                </Section>
              )}

              {/* ---------- ADVANCED ---------- */}
              {activeTab === "advanced" && (
                <Section
                  title="تنظیمات پیشرفته"
                  description="گزینه‌های فنی و عملکردی. با احتیاط تغییر دهید."
                >
                  <Toggle
                    label="حالت تعمیر و نگهداری"
                    description="سایت برای بازدیدکنندگان عادی غیرفعال می‌شود"
                    checked={form.maintenance_mode}
                    onChange={(v) => set("maintenance_mode", v)}
                  />
                  <Toggle
                    label="حالت دیباگ"
                    description="نمایش خطاهای دقیق (فقط در محیط توسعه)"
                    checked={form.debug_mode}
                    onChange={(v) => set("debug_mode", v)}
                  />
                  <Toggle
                    label="فعال‌سازی کش"
                    description="کش کردن داده‌ها برای افزایش سرعت"
                    checked={form.cache_enabled}
                    onChange={(v) => set("cache_enabled", v)}
                  />

                  <div className="grid gap-5 sm:grid-cols-2">
                    <Field label="مدت کش (ثانیه)" hint="پیش‌فرض: ۳۰۰">
                      <input
                        type="number"
                        min={0}
                        className={inputClass}
                        value={form.cache_ttl}
                        onChange={(e) =>
                          set("cache_ttl", Number(e.target.value))
                        }
                      />
                    </Field>
                    <Field label="محدودیت نرخ API (در دقیقه)">
                      <input
                        type="number"
                        min={1}
                        className={inputClass}
                        value={form.api_rate_limit}
                        onChange={(e) =>
                          set("api_rate_limit", Number(e.target.value))
                        }
                      />
                    </Field>
                  </div>

                  <div className="rounded-lg border border-amber-200 bg-amber-50 px-4 py-3 text-xs text-amber-800">
                    تغییر تنظیمات پیشرفته می‌تواند روی عملکرد و امنیت سایت تأثیر
                    بگذارد. فقط در صورت اطمینان تغییر دهید.
                  </div>
                </Section>
              )}
            </div>

            {/* فوتر فرم */}
            <div className="flex items-center justify-between border-t border-slate-100 bg-slate-50/80 px-6 py-4">
              <p className="text-xs text-slate-400">
                تغییرات تا زمان ذخیره اعمال نمی‌شوند.
              </p>
              <button
                type="submit"
                disabled={saving}
                className="inline-flex items-center gap-2 rounded-lg bg-[#2271b1] px-5 py-2.5 text-sm font-medium text-white hover:bg-[#135e96] disabled:opacity-60"
              >
                <Save className="h-4 w-4" />
                {saving ? "در حال ذخیره..." : "ذخیره تغییرات"}
              </button>
            </div>
          </form>
        </div>
      </div>
    </PanelLayout>
  );
}

SettingsPage.layout = (page: React.ReactNode) => page;
