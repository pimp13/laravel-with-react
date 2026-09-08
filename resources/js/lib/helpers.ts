export interface HeadingInfo {
  level: number;
  text: string;
}

export interface LinkInfo {
  href: string;
  text: string;
}

export interface ImageInfo {
  src: string;
  alt: string;
}

// const SITE_URL =
//   process.env.NEXT_PUBLIC_SITE_URL?.replace(/\/+$/, "") ||
//   "https://example.com";
export const SITE_URL = "https://example.com";

export const BLOG_PATH = "/blog";

export const normalizeText = (value: string) =>
  value
    .toLocaleLowerCase("fa-IR")
    .replace(/ي/g, "ی")
    .replace(/ك/g, "ک")
    .replace(/\u200c/g, " ")
    .replace(/\s+/g, " ")
    .trim();

export const stripHtml = (html: string) => {
  if (!html) return "";

  return html
    .replace(/<script[\s\S]*?<\/script>/gi, " ")
    .replace(/<style[\s\S]*?<\/style>/gi, " ")
    .replace(/<[^>]*>/g, " ")
    .replace(/&nbsp;/gi, " ")
    .replace(/&amp;/gi, "&")
    .replace(/&quot;/gi, '"')
    .replace(/&#39;/gi, "'")
    .replace(/\s+/g, " ")
    .trim();
};

export const countWords = (text: string) => {
  const clean = stripHtml(text);
  if (!clean) return 0;
  return clean.split(/\s+/).filter(Boolean).length;
};

export const estimateReadingTime = (html: string) =>
  Math.max(1, Math.ceil(countWords(html) / 200));

export const countOccurrences = (text: string, keyword: string) => {
  const normalizedText = normalizeText(text);
  const normalizedKeyword = normalizeText(keyword);

  if (!normalizedText || !normalizedKeyword) return 0;

  return normalizedText.split(normalizedKeyword).length - 1;
};

export const generateSlug = (title: string) =>
  title
    .trim()
    .toLocaleLowerCase("fa-IR")
    .replace(/[^\p{L}\p{N}\s-]/gu, "")
    .replace(/\s+/g, "-")
    .replace(/-+/g, "-")
    .replace(/^-|-$/g, "");

export const extractHeadings = (html: string): HeadingInfo[] =>
  [...html.matchAll(/<h([1-6])[^>]*>([\s\S]*?)<\/h\1>/gi)].map((match) => ({
    level: Number(match[1]),
    text: stripHtml(match[2]),
  }));

export const extractLinks = (html: string): LinkInfo[] =>
  [
    ...html.matchAll(/<a[^>]+href=["']([^"']+)["'][^>]*>([\s\S]*?)<\/a>/gi),
  ].map((match) => ({
    href: match[1],
    text: stripHtml(match[2]),
  }));

export const extractImages = (html: string): ImageInfo[] =>
  [...html.matchAll(/<img[^>]*src=["']([^"']+)["'][^>]*>/gi)].map(
    (match) => ({
      src: match[1],
      alt: match[0].match(/alt=["']([^"']*)["']/i)?.[1]?.trim() || "",
    }),
  );

export const isInternalUrl = (href: string) => {
  if (href.startsWith("/") && !href.startsWith("//")) return true;

  try {
    return new URL(href).origin === new URL(SITE_URL).origin;
  } catch {
    return false;
  }
};

export const isValidHttpUrl = (value: string) => {
  if (!value.trim()) return true;

  try {
    const url = new URL(value);
    return url.protocol === "http:" || url.protocol === "https:";
  } catch {
    return false;
  }
};

export const clamp = (value: number, min: number, max: number) =>
  Math.min(max, Math.max(min, value));

export const getDefaultCanonical = (slug: string) =>
  slug ? `${SITE_URL}${BLOG_PATH}/${slug}` : "";

export const getSeoStatus = (score: number) => {
  if (score >= 85) return "عالی";
  if (score >= 70) return "خوب";
  if (score >= 50) return "نیازمند بهبود";
  return "ضعیف";
};

export const getStatusClass = (score: number) => {
  if (score >= 85) return "text-emerald-600";
  if (score >= 70) return "text-blue-600";
  if (score >= 50) return "text-amber-600";
  return "text-red-600";
};
