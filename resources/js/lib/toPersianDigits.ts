type PersianDigitOptions = {
  /** آیا اعداد منفی هم پشتیبانی شود؟ (پیش‌فرض: true) */
  keepSign?: boolean;
  /** آیا نقطه اعشار به `/` تبدیل شود؟ (پیش‌فرض: false) */
  convertDecimal?: boolean;
};

/**
 * تبدیل حرفه‌ای اعداد انگلیسی به فارسی
 */
export function toPersianDigits(
  value: string | number | null | undefined,
  options: PersianDigitOptions = {},
): string {
  if (value === null || value === undefined || value === "") return "";

  const { keepSign = true, convertDecimal = false } = options;

  const persianDigits = ["۰", "۱", "۲", "۳", "۴", "۵", "۶", "۷", "۸", "۹"];

  let result = String(value);

  // تبدیل اعداد
  result = result.replace(/\d/g, (d) => persianDigits[Number(d)]);

  // تبدیل نقطه اعشار (اختیاری)
  if (convertDecimal) {
    result = result.replace(/\./g, "/");
  }

  // اگر علامت منفی نباید نمایش داده شود
  if (!keepSign) {
    result = result.replace(/^-/, "");
  }

  return result;
}
