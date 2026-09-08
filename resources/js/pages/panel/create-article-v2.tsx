import React, { useCallback, useEffect, useMemo, useState } from "react";
import { EditorContent, useEditor } from "@tiptap/react";
import StarterKit from "@tiptap/starter-kit";
import Link from "@tiptap/extension-link";
import Image from "@tiptap/extension-image";
import Placeholder from "@tiptap/extension-placeholder";
import TextAlign from "@tiptap/extension-text-align";
import Underline from "@tiptap/extension-underline";
import { TextStyle } from "@tiptap/extension-text-style";
import { Color } from "@tiptap/extension-color";
import { Highlight } from "@tiptap/extension-highlight";
import { clamp, countOccurrences, countWords, estimateReadingTime, extractHeadings, extractImages, extractLinks, generateSlug, getDefaultCanonical, getSeoStatus, getStatusClass, isInternalUrl, isValidHttpUrl, normalizeText, SITE_URL, stripHtml } from "@/lib/helpers";

/**
 * WordPress / Yoast / RankMath-style post editor.
 *
 * Notes:
 * - The SEO score is an editorial heuristic, not a Google ranking score.
 * - meta_keywords is retained only for CMS compatibility; it should not be
 *   treated as an important Google ranking signal.
 * - The backend should validate and normalize the final payload.
 * - api.createPost() and api.uploadImage() are intentionally left compatible
 *   with the API functions already used by the original page.
 */

interface Category {
  id: number;
  title: string;
  slug: string;
}

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

  /** Kept for backward compatibility with the existing API. */
  meta_keywords: string;

  focus_keyword: string;
  focus_keywords: string[];

  canonical_url: string;

  robots: RobotsMeta;

  og: SocialMeta & {
    type: "article" | "website";
  };

  twitter: SocialMeta & {
    card: "summary" | "summary_large_image";
  };

  schema_type: SchemaType;

  author_name: string;
  author_url: string;

  featured_image_alt: string;
  featured_image_caption: string;

  breadcrumb_title: string;

  reading_time: number;
  word_count: number;

  sitemap_priority: number;
  sitemap_change_frequency:
  | "always"
  | "hourly"
  | "daily"
  | "weekly"
  | "monthly"
  | "yearly"
  | "never";

  seo_score: number;
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
  title: string;
  description: string;
  passed: boolean;
  important: boolean;
  points: number;
}

interface Api {
  createPost: (payload: unknown) => Promise<unknown>;
  uploadImage: (
    file: File,
  ) => Promise<string | { url?: string; path?: string }>;
}

/**
 * Replace this import with your existing API client if it is imported from
 * another module in your project.
 *
 * Example:
 *  */

/* -------------------------------------------------------------------------- */
/* Helpers                                                                    */
/* -------------------------------------------------------------------------- */


/* -------------------------------------------------------------------------- */
/* Initial data                                                               */
/* -------------------------------------------------------------------------- */

const INITIAL_FORM: PostFormData = {
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
    focus_keywords: [],
    canonical_url: "",
    robots: {
      index: "index",
      follow: "follow",
      archive: true,
      snippet: true,
      image_index: true,
      max_snippet: -1,
      max_image_preview: "large",
    },
    og: {
      title: "",
      description: "",
      image: "",
      image_alt: "",
      type: "article",
    },
    twitter: {
      card: "summary_large_image",
      title: "",
      description: "",
      image: "",
      image_alt: "",
    },
    schema_type: "BlogPosting",
    author_name: "",
    author_url: "",
    featured_image_alt: "",
    featured_image_caption: "",
    breadcrumb_title: "",
    reading_time: 1,
    word_count: 0,
    sitemap_priority: 0.7,
    sitemap_change_frequency: "weekly",
    seo_score: 0,
  },
};

/* -------------------------------------------------------------------------- */
/* Small UI components                                                        */
/* -------------------------------------------------------------------------- */

function ToolbarButton({
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
}) {
  return (
    <button
      type="button"
      onClick={onClick}
      disabled={disabled}
      title={title}
      className={`rounded-lg px-2.5 py-2 text-sm transition ${isActive
        ? "bg-indigo-100 text-indigo-700"
        : "text-slate-600 hover:bg-slate-100 hover:text-slate-900"
        } disabled:cursor-not-allowed disabled:opacity-40`}
    >
      {children}
    </button>
  );
}

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
    <div>
      <div className="mb-1.5 flex items-center justify-between gap-3">
        <label className="text-sm font-medium text-slate-700">
          {label}
        </label>
        {hint && <span className="text-xs text-slate-400">{hint}</span>}
      </div>
      {children}
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
      <div className="border-b border-slate-200 pb-3">
        <h3 className="font-semibold text-slate-800">{title}</h3>
        {description && (
          <p className="mt-1 text-xs leading-5 text-slate-500">
            {description}
          </p>
        )}
      </div>
      {children}
    </section>
  );
}

function Counter({
  value,
  recommended,
}: {
  value: number;
  recommended?: string;
}) {
  return (
    <p className="mt-1 text-xs text-slate-500">
      {value} کاراکتر
      {recommended ? ` • ${recommended}` : ""}
    </p>
  );
}

/* -------------------------------------------------------------------------- */
/* Main component                                                             */
/* -------------------------------------------------------------------------- */

export default function CreatePostPage() {
  const [form, setForm] = useState<PostFormData>(INITIAL_FORM);
  const [activeTab, setActiveTab] = useState<
    "content" | "seo" | "social" | "settings"
  >("content");
  const [slugManual, setSlugManual] = useState(false);
  const [saving, setSaving] = useState(false);
  const [tagInput, setTagInput] = useState("");
  const [keywordInput, setKeywordInput] = useState("");
  const [uploadingImage, setUploadingImage] = useState(false);
  const [uploadingEditorImage, setUploadingEditorImage] = useState(false);

  const setField = useCallback(
    <K extends keyof PostFormData>(field: K, value: PostFormData[K]) => {
      setForm((prev) => ({ ...prev, [field]: value }));
    },
    [],
  );

  const setMeta = useCallback(
    <K extends keyof SeoMeta>(field: K, value: SeoMeta[K]) => {
      setForm((prev) => ({
        ...prev,
        meta: {
          ...prev.meta,
          [field]: value,
        },
      }));
    },
    [],
  );

  const setRobots = useCallback(
    <K extends keyof RobotsMeta>(field: K, value: RobotsMeta[K]) => {
      setForm((prev) => ({
        ...prev,
        meta: {
          ...prev.meta,
          robots: {
            ...prev.meta.robots,
            [field]: value,
          },
        },
      }));
    },
    [],
  );

  const setSocial = useCallback(
    (social: "og" | "twitter", field: keyof SocialMeta, value: string) => {
      setForm((prev) => ({
        ...prev,
        meta: {
          ...prev.meta,
          [social]: {
            ...prev.meta[social],
            [field]: value,
          },
        },
      }));
    },
    [],
  );

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
        HTMLAttributes: {
          class: "text-indigo-600 underline",
        },
      }),
      Image.configure({
        HTMLAttributes: {
          class: "my-4 max-w-full rounded-xl",
        },
      }),
      TextAlign.configure({
        types: ["heading", "paragraph"],
      }),
      Placeholder.configure({
        placeholder: "محتوای مقاله را اینجا بنویسید...",
      }),
    ],
    content: form.content,
    onUpdate: ({ editor: currentEditor }) => {
      const html = currentEditor.getHTML();
      setForm((prev) => ({
        ...prev,
        content: html,
      }));
    },
    editorProps: {
      attributes: {
        class: "prose prose-slate max-w-none min-h-[440px] p-5 focus:outline-none text-right",
        dir: "rtl",
      },
    },
  });

  /* ------------------------------ Derived data --------------------------- */

  const plainText = useMemo(() => stripHtml(form.content), [form.content]);

  const headings = useMemo(
    () => extractHeadings(form.content),
    [form.content],
  );

  const links = useMemo(() => extractLinks(form.content), [form.content]);

  const images = useMemo(() => extractImages(form.content), [form.content]);

  const internalLinks = useMemo(
    () => links.filter((link) => isInternalUrl(link.href)),
    [links],
  );

  const externalLinks = useMemo(
    () => links.filter((link) => !isInternalUrl(link.href)),
    [links],
  );

  const firstParagraph = useMemo(() => {
    const match = form.content.match(/<p[^>]*>([\s\S]*?)<\/p>/i);
    return match ? stripHtml(match[1]) : "";
  }, [form.content]);

  const allKeywords = useMemo(() => {
    return [form.meta.focus_keyword, ...form.meta.focus_keywords]
      .map(normalizeText)
      .filter(Boolean);
  }, [form.meta.focus_keyword, form.meta.focus_keywords]);

  const focusKeyword = normalizeText(form.meta.focus_keyword);

  const keywordCount = useMemo(
    () => countOccurrences(plainText, focusKeyword),
    [plainText, focusKeyword],
  );

  const keywordDensity = useMemo(() => {
    if (!focusKeyword || !plainText) return 0;
    return (keywordCount / Math.max(1, countWords(plainText))) * 100;
  }, [focusKeyword, keywordCount, plainText]);

  const seoChecks = useMemo<SeoCheck[]>(() => {
    const titleLength = form.title.trim().length;
    const metaTitleLength = form.meta.meta_title.trim().length;
    const metaDescriptionLength = form.meta.meta_description.trim().length;
    const wordCount = countWords(plainText);

    const titleHasKeyword =
      !!focusKeyword && normalizeText(form.title).includes(focusKeyword);

    const metaTitleHasKeyword =
      !!focusKeyword &&
      normalizeText(form.meta.meta_title).includes(focusKeyword);

    const descriptionHasKeyword =
      !!focusKeyword &&
      normalizeText(form.meta.meta_description).includes(focusKeyword);

    const slugHasKeyword =
      !!focusKeyword &&
      normalizeText(form.slug.replace(/-/g, " ")).includes(focusKeyword);

    const firstParagraphHasKeyword =
      !!focusKeyword &&
      normalizeText(firstParagraph).includes(focusKeyword);

    const headingHasKeyword =
      !!focusKeyword &&
      headings.some((heading) =>
        normalizeText(heading.text).includes(focusKeyword),
      );

    const hasOneH1 =
      headings.filter((heading) => heading.level === 1).length === 1;

    const hasH2 = headings.some((heading) => heading.level === 2);

    const hierarchyValid = headings.every((heading, index) => {
      if (index === 0) return heading.level <= 2;
      const previous = headings[index - 1].level;
      return heading.level <= previous + 1;
    });

    const hasImageWithoutAlt = images.some((image) => !image.alt);
    const hasFeaturedImage = !!form.featured_image.trim();
    const hasFeaturedAlt =
      hasFeaturedImage && !!form.meta.featured_image_alt.trim();

    const canonicalValid =
      !!form.meta.canonical_url.trim() &&
      isValidHttpUrl(form.meta.canonical_url);

    const hasInternalLink = internalLinks.length > 0;
    const hasExternalReference = externalLinks.length > 0;

    const densityHealthy =
      !focusKeyword || (keywordDensity >= 0.2 && keywordDensity <= 3);

    return [
      {
        id: "title",
        title: "عنوان مقاله مناسب است",
        description:
          "عنوان باید واضح، توصیفی و متناسب با موضوع واقعی مقاله باشد.",
        passed: titleLength >= 20 && titleLength <= 70,
        important: true,
        points: 7,
      },
      {
        id: "meta-title",
        title: "Meta Title مناسب است",
        description:
          "برای نمایش مناسب در نتایج جستجو، عنوان متا را کوتاه و دقیق نگه دارید.",
        passed: metaTitleLength >= 30 && metaTitleLength <= 60,
        important: true,
        points: 7,
      },
      {
        id: "description",
        title: "Meta Description مناسب است",
        description:
          "توضیح متا باید خلاصه، اختصاصی و مرتبط با محتوای صفحه باشد.",
        passed:
          metaDescriptionLength >= 120 &&
          metaDescriptionLength <= 160,
        important: true,
        points: 7,
      },
      {
        id: "focus-keyword",
        title: "کلمه کلیدی اصلی تعیین شده",
        description:
          "کلمه کلیدی باید موضوع اصلی مقاله را واقعاً نمایندگی کند.",
        passed: !!focusKeyword,
        important: true,
        points: 7,
      },
      {
        id: "keyword-title",
        title: "کلمه کلیدی در عنوان وجود دارد",
        description:
          "وجود عبارت هدف در عنوان می‌تواند ارتباط موضوعی را برای ویرایشگر واضح‌تر کند.",
        passed: titleHasKeyword,
        important: true,
        points: 5,
      },
      {
        id: "keyword-meta-title",
        title: "کلمه کلیدی در Meta Title وجود دارد",
        description: "عبارت هدف را در عنوان متا نیز بررسی کنید.",
        passed: metaTitleHasKeyword,
        important: true,
        points: 5,
      },
      {
        id: "keyword-description",
        title: "کلمه کلیدی در توضیح متا وجود دارد",
        description:
          "از تکرار مصنوعی عبارت جلوگیری کنید و فقط در صورت طبیعی بودن استفاده کنید.",
        passed: descriptionHasKeyword,
        important: false,
        points: 4,
      },
      {
        id: "keyword-slug",
        title: "کلمه کلیدی در Slug بررسی شده",
        description: "نامک باید کوتاه، خوانا و توصیفی باشد.",
        passed: slugHasKeyword,
        important: false,
        points: 4,
      },
      {
        id: "first-paragraph",
        title: "کلمه کلیدی در پاراگراف اول بررسی شده",
        description: "مقاله باید از همان ابتدا موضوع خود را روشن کند.",
        passed: firstParagraphHasKeyword,
        important: false,
        points: 4,
      },
      {
        id: "heading-keyword",
        title: "کلمه کلیدی در یکی از Headingها بررسی شده",
        description:
          "در صورت طبیعی بودن، موضوع اصلی را در ساختار تیترها نیز منعکس کنید.",
        passed: headingHasKeyword,
        important: false,
        points: 4,
      },
      {
        id: "content-length",
        title: "محتوا حجم کافی دارد",
        description:
          "حداقل 600 کلمه یک معیار تحریری برای بررسی عمق محتواست، نه قانون رتبه‌بندی گوگل.",
        passed: wordCount >= 600,
        important: false,
        points: 5,
      },
      {
        id: "h1",
        title: "ساختار H1 بررسی شده",
        description: "بهتر است صفحه یک H1 اصلی و مشخص داشته باشد.",
        passed: hasOneH1,
        important: true,
        points: 6,
      },
      {
        id: "h2",
        title: "ساختار H2 دارد",
        description:
          "برای مقالات متوسط و بلند، بخش‌بندی با H2 خوانایی را بهتر می‌کند.",
        passed: hasH2,
        important: false,
        points: 4,
      },
      {
        id: "hierarchy",
        title: "ترتیب Headingها منطقی است",
        description: "از پرش غیرضروری مانند H2 به H4 خودداری کنید.",
        passed: hierarchyValid,
        important: false,
        points: 4,
      },
      {
        id: "featured-image",
        title: "تصویر شاخص وجود دارد",
        description:
          "برای اشتراک‌گذاری و نمایش کارت مقاله تصویر مناسب تعیین کنید.",
        passed: hasFeaturedImage,
        important: true,
        points: 5,
      },
      {
        id: "featured-alt",
        title: "Alt تصویر شاخص وجود دارد",
        description:
          "متن جایگزین باید توصیفی و مرتبط با تصویر واقعی باشد.",
        passed: hasFeaturedAlt,
        important: true,
        points: 5,
      },
      {
        id: "content-image-alt",
        title: "تصاویر داخل محتوا Alt مناسب دارند",
        description: "تصاویر محتوایی بدون Alt را اصلاح کنید.",
        passed: !hasImageWithoutAlt,
        important: true,
        points: 4,
      },
      {
        id: "canonical",
        title: "Canonical معتبر است",
        description: "Canonical را با URL اصلی صفحه هماهنگ نگه دارید.",
        passed: canonicalValid,
        important: true,
        points: 6,
      },
      {
        id: "internal-link",
        title: "لینک داخلی وجود دارد",
        description:
          "در صورت وجود صفحات مرتبط، به آن‌ها لینک داخلی بدهید.",
        passed: hasInternalLink,
        important: false,
        points: 4,
      },
      {
        id: "external-reference",
        title: "لینک خارجی/مرجع بررسی شده",
        description:
          "در صورت نیاز به منبع، به منابع معتبر و مرتبط ارجاع دهید.",
        passed: hasExternalReference,
        important: false,
        points: 3,
      },
      {
        id: "density",
        title: "تکرار کلمه کلیدی طبیعی است",
        description:
          "از Keyword Stuffing خودداری کنید؛ کیفیت و طبیعی بودن متن مهم‌تر است.",
        passed: densityHealthy,
        important: true,
        points: 5,
      },
    ];
  }, [
    externalLinks,
    firstParagraph,
    focusKeyword,
    form,
    headings,
    images,
    internalLinks,
    keywordDensity,
    plainText,
  ]);

  const seoScore = useMemo(() => {
    const total = seoChecks.reduce((sum, check) => sum + check.points, 0);

    const earned = seoChecks.reduce(
      (sum, check) => sum + (check.passed ? check.points : 0),
      0,
    );

    return total ? Math.round((earned / total) * 100) : 0;
  }, [seoChecks]);

  /* ------------------------------ Auto SEO -------------------------------- */

  useEffect(() => {
    const wordCount = countWords(form.content);
    const readingTime = estimateReadingTime(form.content);

    setForm((prev) => {
      if (
        prev.meta.word_count === wordCount &&
        prev.meta.reading_time === readingTime
      ) {
        return prev;
      }

      return {
        ...prev,
        meta: {
          ...prev.meta,
          word_count: wordCount,
          reading_time: readingTime,
        },
      };
    });
  }, [form.content]);

  useEffect(() => {
    if (!slugManual && form.title.trim()) {
      const nextSlug = generateSlug(form.title);

      setForm((prev) =>
        prev.slug === nextSlug
          ? prev
          : {
            ...prev,
            slug: nextSlug,
          },
      );
    }
  }, [form.title, slugManual]);

  useEffect(() => {
    setForm((prev) => {
      const nextMeta = { ...prev.meta };

      if (!nextMeta.meta_title && prev.title) {
        nextMeta.meta_title = prev.title;
      }

      if (!nextMeta.meta_description && prev.excerpt) {
        nextMeta.meta_description = prev.excerpt;
      }

      if (!nextMeta.og.title && prev.title) {
        nextMeta.og.title = prev.title;
      }

      if (!nextMeta.og.description && prev.excerpt) {
        nextMeta.og.description = prev.excerpt;
      }

      if (!nextMeta.og.image && prev.featured_image) {
        nextMeta.og.image = prev.featured_image;
      }

      if (!nextMeta.twitter.title && prev.title) {
        nextMeta.twitter.title = prev.title;
      }

      if (!nextMeta.twitter.description && prev.excerpt) {
        nextMeta.twitter.description = prev.excerpt;
      }

      if (!nextMeta.twitter.image && prev.featured_image) {
        nextMeta.twitter.image = prev.featured_image;
      }

      if (!nextMeta.featured_image_alt && prev.title) {
        nextMeta.featured_image_alt = prev.title;
      }

      if (!nextMeta.breadcrumb_title && prev.title) {
        nextMeta.breadcrumb_title = prev.title;
      }

      return {
        ...prev,
        meta: nextMeta,
      };
    });
  }, [form.title, form.excerpt, form.featured_image]);

  useEffect(() => {
    setMeta("seo_score", seoScore);
  }, [seoScore, setMeta]);

  useEffect(() => {
    if (!form.meta.canonical_url && form.slug) {
      setMeta("canonical_url", getDefaultCanonical(form.slug));
    }
  }, [form.meta.canonical_url, form.slug, setMeta]);

  /* ------------------------------ Tags ------------------------------------ */

  const addTag = () => {
    const tag = tagInput.trim();
    if (!tag) return;

    const existing = form.meta.focus_keywords.map(normalizeText);

    if (!existing.includes(normalizeText(tag))) {
      setMeta("focus_keywords", [...form.meta.focus_keywords, tag]);
    }

    setTagInput("");
  };

  const removeKeyword = (keyword: string) => {
    setMeta(
      "focus_keywords",
      form.meta.focus_keywords.filter((item) => item !== keyword),
    );
  };

  /* ------------------------------ Links ----------------------------------- */

  const setEditorLink = useCallback(() => {
    if (!editor) return;

    const previousUrl = editor.getAttributes("link").href;
    const url = window.prompt("آدرس لینک را وارد کنید:", previousUrl || "");

    if (url === null) return;

    if (!url.trim()) {
      editor.chain().focus().extendMarkRange("link").unsetLink().run();
      return;
    }

    editor
      .chain()
      .focus()
      .extendMarkRange("link")
      .setLink({
        href: url.trim(),
      })
      .run();
  }, [editor]);

  const addEditorImage = useCallback(async () => {
    if (!editor) return;

    const url = window.prompt("آدرس تصویر را وارد کنید:");

    if (url?.trim()) {
      editor
        .chain()
        .focus()
        .setImage({
          src: url.trim(),
        })
        .run();
    }
  }, [editor]);

  // const handleEditorImageUpload = async (
  //   event: React.ChangeEvent<HTMLInputElement>,
  // ) => {
  //   const file = event.target.files?.[0];
  //   event.target.value = "";

  //   if (!file || !editor) return;

  //   setUploadingEditorImage(true);

  //   try {
  //     const result = await (api as Api).uploadImage(file);
  //     const url =
  //       typeof result === "string" ? result : result.url || result.path;

  //     if (!url) {
  //       throw new Error("URL تصویر از API دریافت نشد.");
  //     }

  //     editor
  //       .chain()
  //       .focus()
  //       .setImage({
  //         src: url,
  //       })
  //       .run();
  //   } catch (error) {
  //     console.error(error);
  //     window.alert("آپلود تصویر داخل محتوا انجام نشد.");
  //   } finally {
  //     setUploadingEditorImage(false);
  //   }
  // };

  const handleEditorImageUpload = async (
    event: React.ChangeEvent<HTMLInputElement>,
  ) => {
    const file = event.target.files?.[0];
    event.target.value = "";

    if (!file || !editor) return;

    setUploadingEditorImage(true);

    try {
      const url = URL.createObjectURL(file);

      editor
        .chain()
        .focus()
        .setImage({
          src: url,
        })
        .run();
    } catch (error) {
      console.error(error);
      window.alert("نمایش تصویر داخل محتوا انجام نشد.");
    } finally {
      setUploadingEditorImage(false);
    }
  };

  /* ------------------------------ Featured image -------------------------- */

  const handleFeaturedImageUpload = async (
    event: React.ChangeEvent<HTMLInputElement>,
  ) => {
    const file = event.target.files?.[0];
    event.target.value = "";

    if (!file) return;

    setUploadingImage(true);

    try {
      const url = URL.createObjectURL(file);

      setField("featured_image", url);
    } catch (error) {
      console.error(error);
      window.alert("نمایش تصویر شاخص انجام نشد.");
    } finally {
      setUploadingImage(false);
    }
  };

  /* ------------------------------ Submit ---------------------------------- */

  // const handleSubmit = async (event: React.FormEvent<HTMLFormElement>) => {
  //   event.preventDefault();

  //   if (!form.title.trim()) {
  //     window.alert("عنوان مقاله الزامی است.");
  //     return;
  //   }

  //   if (!form.slug.trim()) {
  //     window.alert("Slug مقاله الزامی است.");
  //     return;
  //   }

  //   if (!form.content.trim()) {
  //     window.alert("محتوای مقاله الزامی است.");
  //     return;
  //   }

  //   if (!isValidHttpUrl(form.meta.canonical_url)) {
  //     setActiveTab("seo");
  //     window.alert("Canonical URL معتبر نیست.");
  //     return;
  //   }

  //   if (
  //     form.visibility === "public" &&
  //     form.meta.robots.index === "index" &&
  //     seoScore < 50
  //   ) {
  //     const proceed = window.confirm(
  //       `امتیاز SEO مقاله ${seoScore} است. آیا با این وضعیت منتشر شود؟`,
  //     );

  //     if (!proceed) {
  //       setActiveTab("seo");
  //       return;
  //     }
  //   }

  //   setSaving(true);

  //   try {
  //     /**
  //      * The API payload deliberately keeps SEO-specific settings under meta.seo.
  //      * This makes the backend contract easier to migrate later to NestJS/Go.
  //      */
  //     const payload = {
  //       title: form.title.trim(),
  //       slug: form.slug.trim(),
  //       content: form.content,
  //       excerpt: form.excerpt.trim(),
  //       featured_image: form.featured_image || null,
  //       category_id: form.category_id || null,
  //       visibility: form.visibility,
  //       published_at: form.published_at || null,
  //       is_active: form.is_active,

  //       meta: {
  //         seo: {
  //           ...form.meta,
  //           seo_score: seoScore,
  //         },
  //       },
  //     };

  //     await (api as Api).createPost(payload);

  //     window.alert("مقاله با موفقیت ذخیره شد.");
  //   } catch (error) {
  //     console.error(error);
  //     window.alert("ذخیره مقاله انجام نشد.");
  //   } finally {
  //     setSaving(false);
  //   }
  // };
  const handleSubmit = async (
    event: React.FormEvent<HTMLFormElement>,
  ) => {
    event.preventDefault();

    if (!form.title.trim()) {
      window.alert("عنوان مقاله الزامی است.");
      return;
    }

    if (!form.slug.trim()) {
      window.alert("Slug مقاله الزامی است.");
      return;
    }

    if (!form.content.trim()) {
      window.alert("محتوای مقاله الزامی است.");
      return;
    }

    if (!isValidHttpUrl(form.meta.canonical_url)) {
      setActiveTab("seo");
      window.alert("Canonical URL معتبر نیست.");
      return;
    }

    if (
      form.visibility === "public" &&
      form.meta.robots.index === "index" &&
      seoScore < 50
    ) {
      const proceed = window.confirm(
        `امتیاز SEO مقاله ${seoScore} است. آیا با این وضعیت منتشر شود؟`,
      );

      if (!proceed) {
        setActiveTab("seo");
        return;
      }
    }

    setSaving(true);

    try {
      const payload = {
        title: form.title.trim(),
        slug: form.slug.trim(),
        content: form.content,
        excerpt: form.excerpt.trim(),
        featured_image: form.featured_image || null,
        category_id: form.category_id || null,
        visibility: form.visibility,
        published_at: form.published_at || null,
        is_active: form.is_active,

        meta: {
          seo: {
            ...form.meta,
            seo_score: seoScore,
          },
        },
      };

      console.log("Post draft:", payload);

      window.alert(
        "مقاله فعلاً به‌صورت محلی آماده شد و در کنسول ثبت شد.",
      );
    } catch (error) {
      console.error(error);
      window.alert("ذخیره مقاله انجام نشد.");
    } finally {
      setSaving(false);
    }
  };

  /* ------------------------------ Render ---------------------------------- */

  const tabs = [
    { id: "content", label: "محتوا" },
    { id: "seo", label: "تحلیل SEO" },
    { id: "social", label: "شبکه‌های اجتماعی" },
    { id: "settings", label: "تنظیمات" },
  ] as const;

  return (
    <div dir="rtl" className="min-h-screen bg-slate-100 text-slate-900">
      <header className="sticky top-0 z-30 border-b border-slate-200 bg-white/95 backdrop-blur">
        <div className="mx-auto flex h-16 max-w-7xl items-center justify-between px-4 sm:px-6 lg:px-8">
          <div>
            <div className="flex items-center gap-3">
              <h1 className="text-lg font-bold">
                ساخت مقاله جدید
              </h1>
              <span className="rounded-full bg-indigo-50 px-2.5 py-1 text-xs font-medium text-indigo-700">
                SEO Editor
              </span>
            </div>
            <p className="mt-0.5 text-xs text-slate-500">
              ویرایشگر حرفه‌ای محتوا و سئو
            </p>
          </div>

          <div className="flex items-center gap-2">
            <button
              type="button"
              onClick={() => setField("visibility", "draft")}
              className="rounded-lg px-4 py-2 text-sm font-medium text-slate-600 hover:bg-slate-100"
            >
              ذخیره پیش‌نویس
            </button>

            <button
              type="submit"
              form="create-post-form"
              disabled={
                saving ||
                !form.title.trim() ||
                !form.content.trim()
              }
              className="flex items-center gap-2 rounded-lg bg-indigo-600 px-5 py-2.5 text-sm font-medium text-white shadow-sm transition hover:bg-indigo-700 disabled:cursor-not-allowed disabled:opacity-50"
            >
              {saving && (
                <span className="h-4 w-4 animate-spin rounded-full border-2 border-white/40 border-t-white" />
              )}
              {saving ? "در حال ذخیره..." : "انتشار مقاله"}
            </button>
          </div>
        </div>
      </header>

      <form
        id="create-post-form"
        onSubmit={handleSubmit}
        className="mx-auto max-w-7xl px-4 py-8 sm:px-6 lg:px-8"
      >
        <div className="grid grid-cols-1 gap-8 lg:grid-cols-3">
          <main className="space-y-6 lg:col-span-2">
            <section className="space-y-5 rounded-2xl border border-slate-200 bg-white p-6 shadow-sm">
              <Field label="عنوان مقاله">
                <input
                  value={form.title}
                  onChange={(event) =>
                    setField("title", event.target.value)
                  }
                  placeholder="عنوان واضح و دقیق مقاله..."
                  className="w-full rounded-xl border border-slate-200 px-4 py-3 text-lg outline-none transition focus:border-indigo-400 focus:ring-2 focus:ring-indigo-500/20"
                  required
                />
              </Field>

              <Field
                label="نامک (Slug)"
                hint={
                  slugManual
                    ? "ویرایش دستی فعال است"
                    : "تولید خودکار"
                }
              >
                <div className="flex items-center gap-2">
                  <span className="text-sm text-slate-400">
                    /blog/
                  </span>

                  <input
                    value={form.slug}
                    onChange={(event) => {
                      setSlugManual(true);
                      setField(
                        "slug",
                        event.target.value
                          .toLowerCase()
                          .replace(/\s+/g, "-"),
                      );
                    }}
                    className="flex-1 rounded-lg border border-slate-200 px-3 py-2 text-sm outline-none focus:border-indigo-400 focus:ring-2 focus:ring-indigo-500/20"
                    dir="ltr"
                  />

                  <button
                    type="button"
                    onClick={() =>
                      setSlugManual((current) => !current)
                    }
                    className="rounded-lg bg-slate-100 px-3 py-2 text-xs text-slate-700 hover:bg-slate-200"
                  >
                    {slugManual
                      ? "تولید خودکار"
                      : "ویرایش دستی"}
                  </button>
                </div>

                {form.slug && (
                  <p
                    className="mt-2 truncate text-xs text-slate-400"
                    dir="ltr"
                  >
                    {getDefaultCanonical(form.slug)}
                  </p>
                )}
              </Field>
            </section>

            <section className="overflow-hidden rounded-2xl border border-slate-200 bg-white shadow-sm">
              <div className="flex overflow-x-auto border-b border-slate-200">
                {tabs.map((tab) => (
                  <button
                    key={tab.id}
                    type="button"
                    onClick={() => setActiveTab(tab.id)}
                    className={`min-w-fit flex-1 px-4 py-3.5 text-sm font-medium transition ${activeTab === tab.id
                      ? "border-b-2 border-indigo-600 bg-indigo-50/60 text-indigo-700"
                      : "text-slate-500 hover:bg-slate-50 hover:text-slate-700"
                      }`}
                  >
                    {tab.label}
                  </button>
                ))}
              </div>

              <div className="p-6">
                {activeTab === "content" && (
                  <div className="space-y-6">
                    <Field label="محتوای مقاله">
                      {editor && (
                        <div className="flex flex-wrap gap-1 rounded-t-xl border border-slate-200 bg-slate-50 p-2">
                          <ToolbarButton
                            title="Bold"
                            isActive={editor.isActive(
                              "bold",
                            )}
                            onClick={() =>
                              editor
                                .chain()
                                .focus()
                                .toggleBold()
                                .run()
                            }
                          >
                            <b>B</b>
                          </ToolbarButton>

                          <ToolbarButton
                            title="Italic"
                            isActive={editor.isActive(
                              "italic",
                            )}
                            onClick={() =>
                              editor
                                .chain()
                                .focus()
                                .toggleItalic()
                                .run()
                            }
                          >
                            <i>I</i>
                          </ToolbarButton>

                          <ToolbarButton
                            title="Underline"
                            isActive={editor.isActive(
                              "underline",
                            )}
                            onClick={() =>
                              editor
                                .chain()
                                .focus()
                                .toggleUnderline()
                                .run()
                            }
                          >
                            <u>U</u>
                          </ToolbarButton>

                          <ToolbarButton
                            title="Strike"
                            isActive={editor.isActive(
                              "strike",
                            )}
                            onClick={() =>
                              editor
                                .chain()
                                .focus()
                                .toggleStrike()
                                .run()
                            }
                          >
                            <s>S</s>
                          </ToolbarButton>

                          <span className="mx-1 h-6 w-px self-center bg-slate-300" />

                          <ToolbarButton
                            title="H1"
                            isActive={editor.isActive(
                              "heading",
                              { level: 1 },
                            )}
                            onClick={() =>
                              editor
                                .chain()
                                .focus()
                                .toggleHeading({
                                  level: 1,
                                })
                                .run()
                            }
                          >
                            H1
                          </ToolbarButton>

                          <ToolbarButton
                            title="H2"
                            isActive={editor.isActive(
                              "heading",
                              { level: 2 },
                            )}
                            onClick={() =>
                              editor
                                .chain()
                                .focus()
                                .toggleHeading({
                                  level: 2,
                                })
                                .run()
                            }
                          >
                            H2
                          </ToolbarButton>

                          <ToolbarButton
                            title="H3"
                            isActive={editor.isActive(
                              "heading",
                              { level: 3 },
                            )}
                            onClick={() =>
                              editor
                                .chain()
                                .focus()
                                .toggleHeading({
                                  level: 3,
                                })
                                .run()
                            }
                          >
                            H3
                          </ToolbarButton>

                          <span className="mx-1 h-6 w-px self-center bg-slate-300" />

                          <ToolbarButton
                            title="لیست"
                            isActive={editor.isActive(
                              "bulletList",
                            )}
                            onClick={() =>
                              editor
                                .chain()
                                .focus()
                                .toggleBulletList()
                                .run()
                            }
                          >
                            • لیست
                          </ToolbarButton>

                          <ToolbarButton
                            title="لیست شماره‌ای"
                            isActive={editor.isActive(
                              "orderedList",
                            )}
                            onClick={() =>
                              editor
                                .chain()
                                .focus()
                                .toggleOrderedList()
                                .run()
                            }
                          >
                            1. لیست
                          </ToolbarButton>

                          <ToolbarButton
                            title="Quote"
                            isActive={editor.isActive(
                              "blockquote",
                            )}
                            onClick={() =>
                              editor
                                .chain()
                                .focus()
                                .toggleBlockquote()
                                .run()
                            }
                          >
                            نقل‌قول
                          </ToolbarButton>

                          <ToolbarButton
                            title="Code"
                            isActive={editor.isActive(
                              "codeBlock",
                            )}
                            onClick={() =>
                              editor
                                .chain()
                                .focus()
                                .toggleCodeBlock()
                                .run()
                            }
                          >
                            {"</>"}
                          </ToolbarButton>

                          <span className="mx-1 h-6 w-px self-center bg-slate-300" />

                          <ToolbarButton
                            title="راست‌چین"
                            onClick={() =>
                              editor
                                .chain()
                                .focus()
                                .setTextAlign(
                                  "right",
                                )
                                .run()
                            }
                          >
                            راست
                          </ToolbarButton>

                          <ToolbarButton
                            title="وسط‌چین"
                            onClick={() =>
                              editor
                                .chain()
                                .focus()
                                .setTextAlign(
                                  "center",
                                )
                                .run()
                            }
                          >
                            وسط
                          </ToolbarButton>

                          <ToolbarButton
                            title="چپ‌چین"
                            onClick={() =>
                              editor
                                .chain()
                                .focus()
                                .setTextAlign(
                                  "left",
                                )
                                .run()
                            }
                          >
                            چپ
                          </ToolbarButton>

                          <span className="mx-1 h-6 w-px self-center bg-slate-300" />

                          <ToolbarButton
                            title="لینک"
                            isActive={editor.isActive(
                              "link",
                            )}
                            onClick={setEditorLink}
                          >
                            لینک
                          </ToolbarButton>

                          <ToolbarButton
                            title="تصویر از URL"
                            onClick={addEditorImage}
                          >
                            تصویر
                          </ToolbarButton>

                          <label
                            className={`cursor-pointer rounded-lg px-2.5 py-2 text-sm text-slate-600 hover:bg-slate-100 ${uploadingEditorImage
                              ? "pointer-events-none opacity-50"
                              : ""
                              }`}
                          >
                            {uploadingEditorImage
                              ? "آپلود..."
                              : "آپلود تصویر"}
                            <input
                              type="file"
                              accept="image/*"
                              className="hidden"
                              onChange={
                                handleEditorImageUpload
                              }
                            />
                          </label>
                        </div>
                      )}

                      <div className="overflow-hidden rounded-b-xl border border-t-0 border-slate-200 bg-white">
                        <EditorContent
                          editor={editor}
                        />
                      </div>

                      <div className="mt-2 flex flex-wrap gap-4 text-xs text-slate-500">
                        <span>
                          {form.meta.word_count} کلمه
                        </span>
                        <span>
                          {form.meta.reading_time}{" "}
                          دقیقه مطالعه
                        </span>
                        <span>
                          {headings.length} تیتر
                        </span>
                        <span>{links.length} لینک</span>
                        <span>
                          {images.length} تصویر
                        </span>
                      </div>
                    </Field>

                    <Field
                      label="خلاصه مقاله (Excerpt)"
                      hint="برای کارت مقاله و fallback توضیحات"
                    >
                      <textarea
                        value={form.excerpt}
                        onChange={(event) =>
                          setField(
                            "excerpt",
                            event.target.value,
                          )
                        }
                        rows={4}
                        placeholder="خلاصه‌ای دقیق و جذاب از مقاله..."
                        className="w-full resize-none rounded-xl border border-slate-200 px-4 py-3 outline-none focus:border-indigo-400 focus:ring-2 focus:ring-indigo-500/20"
                      />
                      <Counter
                        value={form.excerpt.length}
                        recommended="پیشنهاد: حدود 120 تا 160 کاراکتر"
                      />
                    </Field>
                  </div>
                )}

                {activeTab === "seo" && (
                  <div className="space-y-8">
                    <div className="rounded-2xl border border-slate-200 bg-slate-50 p-5">
                      <div className="flex flex-wrap items-center justify-between gap-4">
                        <div>
                          <p className="text-sm font-semibold text-slate-800">
                            تحلیل SEO
                          </p>
                          <p className="mt-1 text-xs text-slate-500">
                            این امتیاز یک چک‌لیست
                            داخلی برای کیفیت و کامل
                            بودن تنظیمات مقاله است.
                          </p>
                        </div>

                        <div className="flex items-center gap-3">
                          <div className="h-3 w-40 overflow-hidden rounded-full bg-slate-200">
                            <div
                              className={`h-full transition-all ${seoScore >= 85
                                ? "bg-emerald-500"
                                : seoScore >=
                                  70
                                  ? "bg-blue-500"
                                  : seoScore >=
                                    50
                                    ? "bg-amber-500"
                                    : "bg-red-500"
                                }`}
                              style={{
                                width: `${seoScore}%`,
                              }}
                            />
                          </div>
                          <div className="text-left">
                            <div
                              className={`text-2xl font-bold ${getStatusClass(
                                seoScore,
                              )}`}
                            >
                              {seoScore}
                            </div>
                            <div className="text-[11px] text-slate-500">
                              {getSeoStatus(
                                seoScore,
                              )}
                            </div>
                          </div>
                        </div>
                      </div>
                    </div>

                    <Section
                      title="SEO پایه"
                      description="تنظیمات اصلی که روی عنوان، snippet و canonical صفحه اثر دارند."
                    >
                      <Field
                        label="Meta Title"
                        hint={`${form.meta.meta_title.length}/60`}
                      >
                        <input
                          value={form.meta.meta_title}
                          maxLength={70}
                          onChange={(event) =>
                            setMeta(
                              "meta_title",
                              event.target.value,
                            )
                          }
                          placeholder="عنوانی که برای موتور جستجو مناسب است"
                          className="w-full rounded-lg border border-slate-200 px-3 py-2.5 text-sm outline-none focus:border-indigo-400 focus:ring-2 focus:ring-indigo-500/20"
                        />
                        <Counter
                          value={
                            form.meta.meta_title
                              .length
                          }
                          recommended="بازه پیشنهادی رابط کاربری: 30 تا 60"
                        />
                      </Field>

                      <Field
                        label="Meta Description"
                        hint={`${form.meta.meta_description.length}/160`}
                      >
                        <textarea
                          value={
                            form.meta
                              .meta_description
                          }
                          maxLength={170}
                          rows={4}
                          onChange={(event) =>
                            setMeta(
                              "meta_description",
                              event.target.value,
                            )
                          }
                          placeholder="خلاصه اختصاصی و جذاب صفحه برای نتایج جستجو..."
                          className="w-full resize-none rounded-lg border border-slate-200 px-3 py-2.5 text-sm outline-none focus:border-indigo-400 focus:ring-2 focus:ring-indigo-500/20"
                        />
                        <Counter
                          value={
                            form.meta
                              .meta_description
                              .length
                          }
                          recommended="بازه پیشنهادی رابط کاربری: 120 تا 160"
                        />
                      </Field>

                      <div className="grid grid-cols-1 gap-4 md:grid-cols-2">
                        <Field label="Focus Keyword">
                          <input
                            value={
                              form.meta
                                .focus_keyword
                            }
                            onChange={(event) =>
                              setMeta(
                                "focus_keyword",
                                event.target
                                  .value,
                              )
                            }
                            placeholder="مثلاً Laravel 13"
                            className="w-full rounded-lg border border-slate-200 px-3 py-2.5 text-sm outline-none focus:border-indigo-400 focus:ring-2 focus:ring-indigo-500/20"
                          />
                        </Field>

                        <Field label="Keyword Density">
                          <div className="rounded-lg border border-slate-200 bg-slate-50 px-3 py-2.5 text-sm">
                            {focusKeyword
                              ? `${keywordDensity.toFixed(2)}%`
                              : "—"}
                            <span className="mr-2 text-xs text-slate-400">
                              ({keywordCount} بار)
                            </span>
                          </div>
                        </Field>
                      </div>

                      <Field
                        label="Focus Keywords / Synonyms"
                        hint="Enter برای افزودن"
                      >
                        <div className="flex gap-2">
                          <input
                            value={tagInput}
                            onChange={(event) =>
                              setTagInput(
                                event.target
                                  .value,
                              )
                            }
                            onKeyDown={(event) => {
                              if (
                                event.key ===
                                "Enter"
                              ) {
                                event.preventDefault();
                                addTag();
                              }
                            }}
                            placeholder="عبارت مرتبط..."
                            className="flex-1 rounded-lg border border-slate-200 px-3 py-2.5 text-sm outline-none focus:border-indigo-400 focus:ring-2 focus:ring-indigo-500/20"
                          />
                          <button
                            type="button"
                            onClick={addTag}
                            className="rounded-lg bg-slate-100 px-4 text-sm hover:bg-slate-200"
                          >
                            افزودن
                          </button>
                        </div>

                        <div className="mt-3 flex flex-wrap gap-2">
                          {form.meta.focus_keywords.map(
                            (keyword) => (
                              <span
                                key={keyword}
                                className="inline-flex items-center gap-2 rounded-full bg-indigo-50 px-3 py-1.5 text-xs text-indigo-700"
                              >
                                {keyword}
                                <button
                                  type="button"
                                  onClick={() =>
                                    removeKeyword(
                                      keyword,
                                    )
                                  }
                                  className="font-bold"
                                >
                                  ×
                                </button>
                              </span>
                            ),
                          )}
                        </div>
                      </Field>

                      <Field
                        label="Canonical URL"
                        hint="URL نهایی و اصلی صفحه"
                      >
                        <input
                          type="url"
                          value={
                            form.meta.canonical_url
                          }
                          onChange={(event) =>
                            setMeta(
                              "canonical_url",
                              event.target.value,
                            )
                          }
                          placeholder={`${SITE_URL}/blog/example`}
                          className="w-full rounded-lg border border-slate-200 px-3 py-2.5 text-sm outline-none focus:border-indigo-400 focus:ring-2 focus:ring-indigo-500/20"
                          dir="ltr"
                        />
                      </Field>
                    </Section>

                    <Section
                      title="Robots"
                      description="کنترل index/follow و previewهای موتورهای جستجو."
                    >
                      <div className="grid grid-cols-1 gap-4 md:grid-cols-2">
                        <Field label="Index">
                          <select
                            value={
                              form.meta.robots
                                .index
                            }
                            onChange={(event) =>
                              setRobots(
                                "index",
                                event.target
                                  .value as RobotsIndex,
                              )
                            }
                            className="w-full rounded-lg border border-slate-200 px-3 py-2.5 text-sm"
                          >
                            <option value="index">
                              index
                            </option>
                            <option value="noindex">
                              noindex
                            </option>
                          </select>
                        </Field>

                        <Field label="Follow">
                          <select
                            value={
                              form.meta.robots
                                .follow
                            }
                            onChange={(event) =>
                              setRobots(
                                "follow",
                                event.target
                                  .value as RobotsFollow,
                              )
                            }
                            className="w-full rounded-lg border border-slate-200 px-3 py-2.5 text-sm"
                          >
                            <option value="follow">
                              follow
                            </option>
                            <option value="nofollow">
                              nofollow
                            </option>
                          </select>
                        </Field>

                        <Field label="Max Image Preview">
                          <select
                            value={
                              form.meta.robots
                                .max_image_preview
                            }
                            onChange={(event) =>
                              setRobots(
                                "max_image_preview",
                                event.target
                                  .value as MaxImagePreview,
                              )
                            }
                            className="w-full rounded-lg border border-slate-200 px-3 py-2.5 text-sm"
                          >
                            <option value="large">
                              large
                            </option>
                            <option value="standard">
                              standard
                            </option>
                            <option value="none">
                              none
                            </option>
                          </select>
                        </Field>

                        <Field label="Max Snippet">
                          <input
                            type="number"
                            value={
                              form.meta.robots
                                .max_snippet
                            }
                            onChange={(event) =>
                              setRobots(
                                "max_snippet",
                                Number(
                                  event.target
                                    .value,
                                ),
                              )
                            }
                            className="w-full rounded-lg border border-slate-200 px-3 py-2.5 text-sm"
                          />
                        </Field>
                      </div>
                    </Section>

                    <Section
                      title="SEO Content Analysis"
                      description="چک‌لیست مشابه ابزارهای حرفه‌ای ویرایش محتوا."
                    >
                      <div className="space-y-2">
                        {seoChecks.map((check) => (
                          <div
                            key={check.id}
                            className={`flex items-start gap-3 rounded-xl border p-3 ${check.passed
                              ? "border-emerald-100 bg-emerald-50/50"
                              : check.important
                                ? "border-red-100 bg-red-50/50"
                                : "border-amber-100 bg-amber-50/50"
                              }`}
                          >
                            <span
                              className={`mt-0.5 flex h-5 w-5 shrink-0 items-center justify-center rounded-full text-xs font-bold ${check.passed
                                ? "bg-emerald-100 text-emerald-700"
                                : check.important
                                  ? "bg-red-100 text-red-700"
                                  : "bg-amber-100 text-amber-700"
                                }`}
                            >
                              {check.passed
                                ? "✓"
                                : "!"}
                            </span>

                            <div className="min-w-0">
                              <p className="text-sm font-medium text-slate-800">
                                {check.title}
                              </p>
                              <p className="mt-1 text-xs leading-5 text-slate-500">
                                {
                                  check.description
                                }
                              </p>
                            </div>

                            <span className="mr-auto text-xs text-slate-400">
                              +{check.points}
                            </span>
                          </div>
                        ))}
                      </div>
                    </Section>

                    <Section
                      title="ساختار مقاله"
                      description="اطلاعاتی که از HTML فعلی Tiptap استخراج شده‌اند."
                    >
                      <div className="grid grid-cols-2 gap-3 md:grid-cols-4">
                        {[
                          [
                            "کلمات",
                            form.meta.word_count,
                          ],
                          [
                            "دقیقه",
                            form.meta.reading_time,
                          ],
                          [
                            "Heading",
                            headings.length,
                          ],
                          [
                            "لینک داخلی",
                            internalLinks.length,
                          ],
                          [
                            "لینک خارجی",
                            externalLinks.length,
                          ],
                          ["تصویر", images.length],
                          [
                            "H1",
                            headings.filter(
                              (h) =>
                                h.level === 1,
                            ).length,
                          ],
                          [
                            "H2",
                            headings.filter(
                              (h) =>
                                h.level === 2,
                            ).length,
                          ],
                        ].map(([label, value]) => (
                          <div
                            key={String(label)}
                            className="rounded-xl border border-slate-200 bg-slate-50 p-4"
                          >
                            <p className="text-xs text-slate-500">
                              {label}
                            </p>
                            <p className="mt-1 text-lg font-bold text-slate-800">
                              {value}
                            </p>
                          </div>
                        ))}
                      </div>
                    </Section>
                  </div>
                )}

                {activeTab === "social" && (
                  <div className="space-y-8">
                    <Section
                      title="Open Graph"
                      description="اطلاعاتی که هنگام اشتراک صفحه در شبکه‌های اجتماعی استفاده می‌شوند."
                    >
                      <div className="grid grid-cols-1 gap-4 md:grid-cols-2">
                        <Field label="OG Title">
                          <input
                            value={
                              form.meta.og.title
                            }
                            onChange={(event) =>
                              setSocial(
                                "og",
                                "title",
                                event.target
                                  .value,
                              )
                            }
                            className="w-full rounded-lg border border-slate-200 px-3 py-2.5 text-sm"
                          />
                        </Field>

                        <Field label="OG Type">
                          <select
                            value={
                              form.meta.og.type
                            }
                            onChange={(event) =>
                              setForm((prev) => ({
                                ...prev,
                                meta: {
                                  ...prev.meta,
                                  og: {
                                    ...prev
                                      .meta
                                      .og,
                                    type: event
                                      .target
                                      .value as
                                      | "article"
                                      | "website",
                                  },
                                },
                              }))
                            }
                            className="w-full rounded-lg border border-slate-200 px-3 py-2.5 text-sm"
                          >
                            <option value="article">
                              article
                            </option>
                            <option value="website">
                              website
                            </option>
                          </select>
                        </Field>
                      </div>

                      <Field label="OG Description">
                        <textarea
                          value={
                            form.meta.og.description
                          }
                          rows={3}
                          onChange={(event) =>
                            setSocial(
                              "og",
                              "description",
                              event.target.value,
                            )
                          }
                          className="w-full resize-none rounded-lg border border-slate-200 px-3 py-2.5 text-sm"
                        />
                      </Field>

                      <div className="grid grid-cols-1 gap-4 md:grid-cols-2">
                        <Field label="OG Image URL">
                          <input
                            type="url"
                            value={
                              form.meta.og.image
                            }
                            onChange={(event) =>
                              setSocial(
                                "og",
                                "image",
                                event.target
                                  .value,
                              )
                            }
                            className="w-full rounded-lg border border-slate-200 px-3 py-2.5 text-sm"
                            dir="ltr"
                          />
                        </Field>

                        <Field label="OG Image Alt">
                          <input
                            value={
                              form.meta.og
                                .image_alt
                            }
                            onChange={(event) =>
                              setSocial(
                                "og",
                                "image_alt",
                                event.target
                                  .value,
                              )
                            }
                            className="w-full rounded-lg border border-slate-200 px-3 py-2.5 text-sm"
                          />
                        </Field>
                      </div>
                    </Section>

                    <Section title="Twitter / X Card">
                      <div className="grid grid-cols-1 gap-4 md:grid-cols-2">
                        <Field label="Card">
                          <select
                            value={
                              form.meta.twitter
                                .card
                            }
                            onChange={(event) =>
                              setForm((prev) => ({
                                ...prev,
                                meta: {
                                  ...prev.meta,
                                  twitter: {
                                    ...prev
                                      .meta
                                      .twitter,
                                    card: event
                                      .target
                                      .value as
                                      | "summary"
                                      | "summary_large_image",
                                  },
                                },
                              }))
                            }
                            className="w-full rounded-lg border border-slate-200 px-3 py-2.5 text-sm"
                          >
                            <option value="summary_large_image">
                              summary_large_image
                            </option>
                            <option value="summary">
                              summary
                            </option>
                          </select>
                        </Field>

                        <Field label="Twitter Title">
                          <input
                            value={
                              form.meta.twitter
                                .title
                            }
                            onChange={(event) =>
                              setSocial(
                                "twitter",
                                "title",
                                event.target
                                  .value,
                              )
                            }
                            className="w-full rounded-lg border border-slate-200 px-3 py-2.5 text-sm"
                          />
                        </Field>
                      </div>

                      <Field label="Twitter Description">
                        <textarea
                          value={
                            form.meta.twitter
                              .description
                          }
                          rows={3}
                          onChange={(event) =>
                            setSocial(
                              "twitter",
                              "description",
                              event.target.value,
                            )
                          }
                          className="w-full resize-none rounded-lg border border-slate-200 px-3 py-2.5 text-sm"
                        />
                      </Field>

                      <div className="grid grid-cols-1 gap-4 md:grid-cols-2">
                        <Field label="Twitter Image URL">
                          <input
                            type="url"
                            value={
                              form.meta.twitter
                                .image
                            }
                            onChange={(event) =>
                              setSocial(
                                "twitter",
                                "image",
                                event.target
                                  .value,
                              )
                            }
                            className="w-full rounded-lg border border-slate-200 px-3 py-2.5 text-sm"
                            dir="ltr"
                          />
                        </Field>

                        <Field label="Twitter Image Alt">
                          <input
                            value={
                              form.meta.twitter
                                .image_alt
                            }
                            onChange={(event) =>
                              setSocial(
                                "twitter",
                                "image_alt",
                                event.target
                                  .value,
                              )
                            }
                            className="w-full rounded-lg border border-slate-200 px-3 py-2.5 text-sm"
                          />
                        </Field>
                      </div>

                      <div className="rounded-xl border border-slate-200 bg-slate-50 p-4">
                        <p className="mb-3 text-xs font-medium text-slate-500">
                          Preview
                        </p>
                        <div className="overflow-hidden rounded-xl border border-slate-200 bg-white">
                          {form.meta.twitter
                            .image && (
                              <img
                                src={
                                  form.meta
                                    .twitter
                                    .image
                                }
                                alt={
                                  form.meta
                                    .twitter
                                    .image_alt ||
                                  form.title
                                }
                                className="h-48 w-full object-cover"
                              />
                            )}
                          <div className="p-4">
                            <p className="font-semibold text-slate-800">
                              {form.meta.twitter
                                .title ||
                                form.title ||
                                "عنوان مقاله"}
                            </p>
                            <p className="mt-1 line-clamp-2 text-sm text-slate-500">
                              {form.meta.twitter
                                .description ||
                                form.excerpt ||
                                "توضیحات مقاله"}
                            </p>
                          </div>
                        </div>
                      </div>
                    </Section>
                  </div>
                )}

                {activeTab === "settings" && (
                  <div className="space-y-8">
                    <Section
                      title="تصویر شاخص"
                      description="تصویر اصلی مقاله و اطلاعات دسترس‌پذیری آن."
                    >
                      <div className="grid grid-cols-1 gap-4 md:grid-cols-2">
                        <Field label="Featured Image URL">
                          <input
                            type="url"
                            value={
                              form.featured_image
                            }
                            onChange={(event) =>
                              setField(
                                "featured_image",
                                event.target
                                  .value,
                              )
                            }
                            className="w-full rounded-lg border border-slate-200 px-3 py-2.5 text-sm"
                            dir="ltr"
                          />
                        </Field>

                        <Field label="آپلود تصویر">
                          <label className="flex cursor-pointer items-center justify-center rounded-lg border border-dashed border-slate-300 px-4 py-2.5 text-sm text-slate-600 hover:bg-slate-50">
                            {uploadingImage
                              ? "در حال آپلود..."
                              : "انتخاب تصویر"}
                            <input
                              type="file"
                              accept="image/*"
                              className="hidden"
                              onChange={
                                handleFeaturedImageUpload
                              }
                            />
                          </label>
                        </Field>
                      </div>

                      <Field label="Featured Image Alt">
                        <input
                          value={
                            form.meta
                              .featured_image_alt
                          }
                          onChange={(event) =>
                            setMeta(
                              "featured_image_alt",
                              event.target.value,
                            )
                          }
                          placeholder="مثلاً: آموزش Laravel 13"
                          className="w-full rounded-lg border border-slate-200 px-3 py-2.5 text-sm"
                        />
                      </Field>

                      <Field label="Caption">
                        <input
                          value={
                            form.meta
                              .featured_image_caption
                          }
                          onChange={(event) =>
                            setMeta(
                              "featured_image_caption",
                              event.target.value,
                            )
                          }
                          className="w-full rounded-lg border border-slate-200 px-3 py-2.5 text-sm"
                        />
                      </Field>

                      {form.featured_image && (
                        <img
                          src={form.featured_image}
                          alt={
                            form.meta
                              .featured_image_alt ||
                            form.title ||
                            "Featured image"
                          }
                          className="h-64 w-full rounded-xl border border-slate-200 object-cover"
                        />
                      )}
                    </Section>

                    <Section title="Schema.org">
                      <div className="grid grid-cols-1 gap-4 md:grid-cols-2">
                        <Field label="Schema Type">
                          <select
                            value={
                              form.meta
                                .schema_type
                            }
                            onChange={(event) =>
                              setMeta(
                                "schema_type",
                                event.target
                                  .value as SchemaType,
                              )
                            }
                            className="w-full rounded-lg border border-slate-200 px-3 py-2.5 text-sm"
                          >
                            <option value="BlogPosting">
                              BlogPosting
                            </option>
                            <option value="Article">
                              Article
                            </option>
                            <option value="TechArticle">
                              TechArticle
                            </option>
                            <option value="NewsArticle">
                              NewsArticle
                            </option>
                          </select>
                        </Field>

                        <Field label="Breadcrumb Title">
                          <input
                            value={
                              form.meta
                                .breadcrumb_title
                            }
                            onChange={(event) =>
                              setMeta(
                                "breadcrumb_title",
                                event.target
                                  .value,
                              )
                            }
                            className="w-full rounded-lg border border-slate-200 px-3 py-2.5 text-sm"
                          />
                        </Field>
                      </div>

                      <div className="grid grid-cols-1 gap-4 md:grid-cols-2">
                        <Field label="Author Name">
                          <input
                            value={
                              form.meta
                                .author_name
                            }
                            onChange={(event) =>
                              setMeta(
                                "author_name",
                                event.target
                                  .value,
                              )
                            }
                            className="w-full rounded-lg border border-slate-200 px-3 py-2.5 text-sm"
                          />
                        </Field>

                        <Field label="Author URL">
                          <input
                            type="url"
                            value={
                              form.meta.author_url
                            }
                            onChange={(event) =>
                              setMeta(
                                "author_url",
                                event.target
                                  .value,
                              )
                            }
                            className="w-full rounded-lg border border-slate-200 px-3 py-2.5 text-sm"
                            dir="ltr"
                          />
                        </Field>
                      </div>
                    </Section>

                    <Section
                      title="Sitemap"
                      description="تنظیمات editorial برای مدیریت sitemap."
                    >
                      <div className="grid grid-cols-1 gap-4 md:grid-cols-2">
                        <Field label="Priority">
                          <input
                            type="number"
                            min={0}
                            max={1}
                            step={0.1}
                            value={
                              form.meta
                                .sitemap_priority
                            }
                            onChange={(event) =>
                              setMeta(
                                "sitemap_priority",
                                clamp(
                                  Number(
                                    event
                                      .target
                                      .value,
                                  ),
                                  0,
                                  1,
                                ),
                              )
                            }
                            className="w-full rounded-lg border border-slate-200 px-3 py-2.5 text-sm"
                          />
                        </Field>

                        <Field label="Change Frequency">
                          <select
                            value={
                              form.meta
                                .sitemap_change_frequency
                            }
                            onChange={(event) =>
                              setMeta(
                                "sitemap_change_frequency",
                                event.target
                                  .value as SeoMeta["sitemap_change_frequency"],
                              )
                            }
                            className="w-full rounded-lg border border-slate-200 px-3 py-2.5 text-sm"
                          >
                            <option value="always">
                              always
                            </option>
                            <option value="hourly">
                              hourly
                            </option>
                            <option value="daily">
                              daily
                            </option>
                            <option value="weekly">
                              weekly
                            </option>
                            <option value="monthly">
                              monthly
                            </option>
                            <option value="yearly">
                              yearly
                            </option>
                            <option value="never">
                              never
                            </option>
                          </select>
                        </Field>
                      </div>
                    </Section>

                    <Section title="Meta Keywords">
                      <Field
                        label="Meta Keywords"
                        hint="اختیاری / legacy"
                      >
                        <input
                          value={
                            form.meta.meta_keywords
                          }
                          onChange={(event) =>
                            setMeta(
                              "meta_keywords",
                              event.target.value,
                            )
                          }
                          placeholder="Laravel, PHP, Backend"
                          className="w-full rounded-lg border border-slate-200 px-3 py-2.5 text-sm"
                        />
                        <p className="mt-1 text-xs leading-5 text-slate-400">
                          این فیلد برای سازگاری با CMS
                          نگه داشته شده و نباید معیار
                          اصلی SEO شما باشد.
                        </p>
                      </Field>
                    </Section>
                  </div>
                )}
              </div>
            </section>
          </main>

          <aside className="space-y-6">
            <section className="rounded-2xl border border-slate-200 bg-white p-5 shadow-sm">
              <div className="mb-4 flex items-center justify-between">
                <h3 className="font-semibold text-slate-800">
                  وضعیت SEO
                </h3>
                <span
                  className={`text-xl font-bold ${getStatusClass(
                    seoScore,
                  )}`}
                >
                  {seoScore}
                </span>
              </div>

              <div className="h-2 overflow-hidden rounded-full bg-slate-200">
                <div
                  className={`h-full ${seoScore >= 85
                    ? "bg-emerald-500"
                    : seoScore >= 70
                      ? "bg-blue-500"
                      : seoScore >= 50
                        ? "bg-amber-500"
                        : "bg-red-500"
                    }`}
                  style={{
                    width: `${seoScore}%`,
                  }}
                />
              </div>

              <div className="mt-4 space-y-2 text-xs">
                <div className="flex justify-between">
                  <span className="text-slate-500">
                    مشکلات مهم
                  </span>
                  <span className="font-medium text-red-600">
                    {
                      seoChecks.filter(
                        (check) =>
                          check.important &&
                          !check.passed,
                      ).length
                    }
                  </span>
                </div>

                <div className="flex justify-between">
                  <span className="text-slate-500">
                    پیشنهادها
                  </span>
                  <span className="font-medium text-amber-600">
                    {
                      seoChecks.filter(
                        (check) =>
                          !check.important &&
                          !check.passed,
                      ).length
                    }
                  </span>
                </div>

                <div className="flex justify-between">
                  <span className="text-slate-500">
                    موارد موفق
                  </span>
                  <span className="font-medium text-emerald-600">
                    {
                      seoChecks.filter(
                        (check) => check.passed,
                      ).length
                    }
                  </span>
                </div>
              </div>
            </section>

            <section className="rounded-2xl border border-slate-200 bg-white p-5 shadow-sm">
              <h3 className="mb-4 font-semibold text-slate-800">
                انتشار
              </h3>

              <div className="space-y-4">
                <Field label="وضعیت">
                  <select
                    value={form.visibility}
                    onChange={(event) =>
                      setField(
                        "visibility",
                        event.target
                          .value as PostFormData["visibility"],
                      )
                    }
                    className="w-full rounded-lg border border-slate-200 px-3 py-2.5 text-sm"
                  >
                    <option value="draft">پیش‌نویس</option>
                    <option value="public">عمومی</option>
                    <option value="private">خصوصی</option>
                  </select>
                </Field>

                <Field label="تاریخ انتشار">
                  <input
                    type="datetime-local"
                    value={form.published_at}
                    onChange={(event) =>
                      setField(
                        "published_at",
                        event.target.value,
                      )
                    }
                    className="w-full rounded-lg border border-slate-200 px-3 py-2.5 text-sm"
                  />
                </Field>

                <div className="flex items-center justify-between">
                  <span className="text-sm text-slate-700">
                    فعال باشد
                  </span>
                  <button
                    type="button"
                    onClick={() =>
                      setField(
                        "is_active",
                        !form.is_active,
                      )
                    }
                    className={`relative h-6 w-11 rounded-full transition ${form.is_active
                      ? "bg-indigo-600"
                      : "bg-slate-300"
                      }`}
                    aria-label="فعال بودن مقاله"
                  >
                    <span
                      className={`absolute top-0.5 h-5 w-5 rounded-full bg-white shadow transition ${form.is_active
                        ? "right-0.5"
                        : "right-5"
                        }`}
                    />
                  </button>
                </div>
              </div>
            </section>

            <section className="rounded-2xl border border-slate-200 bg-white p-5 shadow-sm">
              <h3 className="mb-4 font-semibold text-slate-800">
                پیش‌نمایش گوگل
              </h3>

              <div className="space-y-1">
                <p className="line-clamp-2 text-lg leading-snug text-blue-700">
                  {form.meta.meta_title ||
                    form.title ||
                    "عنوان مقاله"}
                </p>

                <p
                  className="truncate text-sm text-emerald-700"
                  dir="ltr"
                >
                  {form.meta.canonical_url ||
                    getDefaultCanonical(
                      form.slug || "article-slug",
                    )}
                </p>

                <p className="line-clamp-3 text-sm leading-6 text-slate-600">
                  {form.meta.meta_description ||
                    form.excerpt ||
                    "توضیحات متا اینجا نمایش داده می‌شود..."}
                </p>
              </div>
            </section>

            <section className="rounded-2xl border border-slate-200 bg-white p-5 shadow-sm">
              <h3 className="mb-4 font-semibold text-slate-800">
                پیش‌نمایش محتوا
              </h3>

              <div className="overflow-hidden rounded-xl border border-slate-200 bg-white">
                {(form.meta.og.image ||
                  form.featured_image) && (
                    <img
                      src={
                        form.meta.og.image ||
                        form.featured_image
                      }
                      alt={
                        form.meta.og.image_alt ||
                        form.meta.featured_image_alt ||
                        form.title
                      }
                      className="h-40 w-full object-cover"
                    />
                  )}

                <div className="p-4">
                  <p className="font-semibold text-slate-800">
                    {form.meta.og.title ||
                      form.title ||
                      "عنوان مقاله"}
                  </p>
                  <p className="mt-1 line-clamp-3 text-xs leading-5 text-slate-500">
                    {form.meta.og.description ||
                      form.excerpt ||
                      "توضیحات مقاله"}
                  </p>
                </div>
              </div>
            </section>

            <section className="rounded-2xl border border-slate-200 bg-white p-5 shadow-sm">
              <h3 className="mb-4 font-semibold text-slate-800">
                آمار مقاله
              </h3>

              <div className="space-y-3 text-sm">
                <div className="flex justify-between">
                  <span className="text-slate-500">
                    تعداد کلمات
                  </span>
                  <b>{form.meta.word_count}</b>
                </div>

                <div className="flex justify-between">
                  <span className="text-slate-500">
                    زمان مطالعه
                  </span>
                  <b>{form.meta.reading_time} دقیقه</b>
                </div>

                <div className="flex justify-between">
                  <span className="text-slate-500">
                    لینک داخلی
                  </span>
                  <b>{internalLinks.length}</b>
                </div>

                <div className="flex justify-between">
                  <span className="text-slate-500">
                    لینک خارجی
                  </span>
                  <b>{externalLinks.length}</b>
                </div>

                <div className="flex justify-between">
                  <span className="text-slate-500">
                    تصاویر
                  </span>
                  <b>{images.length}</b>
                </div>
              </div>
            </section>
          </aside>
        </div>
      </form>
    </div>
  );
}
