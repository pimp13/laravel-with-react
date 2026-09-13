import React, { useState } from "react";
import {
  Search,
  ShoppingCart,
  User,
  Heart,
  Menu,
  X,
  ChevronLeft,
  ChevronRight,
  Star,
  Truck,
  Shield,
  RotateCcw,
  Headphones,
  ArrowLeft,
} from "lucide-react";

/* -------------------------------------------------------------------------- */
/* Mock Data                                                                  */
/* -------------------------------------------------------------------------- */

const CATEGORIES = [
  {
    id: 1,
    name: "الکترونیک",
    image: "https://placehold.co/400",
    count: 128,
  },
  {
    id: 2,
    name: "مد و پوشاک",
    image: "https://placehold.co/400",
    count: 86,
  },
  {
    id: 3,
    name: "خانه و آشپزخانه",
    image: "https://placehold.co/400",
    count: 64,
  },
  {
    id: 4,
    name: "زیبایی و سلامت",
    image: "https://placehold.co/400",
    count: 52,
  },
  {
    id: 5,
    name: "ورزش و سفر",
    image: "https://placehold.co/400",
    count: 41,
  },
  {
    id: 6,
    name: "کتاب و لوازم تحریر",
    image: "https://placehold.co/400",
    count: 37,
  },
];

const PRODUCTS = [
  {
    id: 1,
    title: "هدفون بی‌سیم نویزکنسلینگ",
    price: 2490000,
    oldPrice: 3190000,
    rating: 4.8,
    reviews: 124,
    image: "https://placehold.co/400",
    badge: "فروش ویژه",
    badgeColor: "bg-rose-500",
  },
  {
    id: 2,
    title: "ساعت هوشمند سری Pro",
    price: 4850000,
    oldPrice: null,
    rating: 4.6,
    reviews: 89,
    image: "https://placehold.co/400",
    badge: "جدید",
    badgeColor: "bg-emerald-500",
  },
  {
    id: 3,
    title: "کوله پشتی لپ‌تاپ ضدآب",
    price: 890000,
    oldPrice: 1200000,
    rating: 4.7,
    reviews: 56,
    image: "https://placehold.co/400",
    badge: "پرفروش",
    badgeColor: "bg-amber-500",
  },
  {
    id: 4,
    title: "کیبورد مکانیکی RGB",
    price: 1650000,
    oldPrice: null,
    rating: 4.9,
    reviews: 203,
    image: "https://placehold.co/400",
    badge: null,
    badgeColor: "",
  },
  {
    id: 5,
    title: "دوربین اکشن 4K ضدآب",
    price: 3200000,
    oldPrice: 3800000,
    rating: 4.5,
    reviews: 67,
    image: "https://placehold.co/400",
    badge: "تخفیف",
    badgeColor: "bg-rose-500",
  },
  {
    id: 6,
    title: "اسپیکر بلوتوث پرتابل",
    price: 1250000,
    oldPrice: null,
    rating: 4.4,
    reviews: 41,
    image: "https://placehold.co/400",
    badge: "جدید",
    badgeColor: "bg-emerald-500",
  },
  {
    id: 7,
    title: "ماوس گیمینگ بی‌سیم",
    price: 780000,
    oldPrice: 950000,
    rating: 4.7,
    reviews: 112,
    image: "https://placehold.co/400",
    badge: null,
    badgeColor: "",
  },
  {
    id: 8,
    title: "لوازم جانبی موبایل پک کامل",
    price: 450000,
    oldPrice: 620000,
    rating: 4.3,
    reviews: 78,
    image: "https://placehold.co/400",
    badge: "فروش ویژه",
    badgeColor: "bg-rose-500",
  },
];

const BENEFITS = [
  {
    icon: Truck,
    title: "ارسال سریع",
    desc: "تحویل رایگان بالای ۵۰۰ هزار تومان",
  },
  { icon: Shield, title: "ضمانت اصالت", desc: "تضمین اصل بودن تمام کالاها" },
  {
    icon: RotateCcw,
    title: "۷ روز بازگشت",
    desc: "امکان مرجوعی بدون قید و شرط",
  },
  {
    icon: Headphones,
    title: "پشتیبانی ۲۴/۷",
    desc: "پاسخگویی سریع در تمام ساعات",
  },
];

/* -------------------------------------------------------------------------- */
/* Helpers                                                                    */
/* -------------------------------------------------------------------------- */

function formatPrice(price: number) {
  return new Intl.NumberFormat("fa-IR").format(price) + " تومان";
}

/* -------------------------------------------------------------------------- */
/* Small Components                                                           */
/* -------------------------------------------------------------------------- */

function ProductCard({ product }: { product: (typeof PRODUCTS)[0] }) {
  return (
    <article className="group relative flex flex-col overflow-hidden rounded-2xl border border-slate-200 bg-white transition hover:shadow-lg">
      {/* Image */}
      <div className="relative aspect-square overflow-hidden bg-slate-50">
        <img
          src={product.image}
          alt={product.title}
          className="h-full w-full object-cover transition duration-500 group-hover:scale-105"
        />
        {product.badge && (
          <span
            className={`absolute right-3 top-3 rounded-full px-2.5 py-1 text-xs font-medium text-white ${product.badgeColor}`}
          >
            {product.badge}
          </span>
        )}
        <button
          type="button"
          className="absolute left-3 top-3 flex h-9 w-9 items-center justify-center rounded-full bg-white/90 text-slate-600 opacity-0 shadow transition group-hover:opacity-100 hover:text-rose-500"
        >
          <Heart className="h-4 w-4" />
        </button>
      </div>

      {/* Body */}
      <div className="flex flex-1 flex-col p-4">
        <h3 className="line-clamp-2 text-sm font-medium text-slate-800 leading-6">
          {product.title}
        </h3>

        <div className="mt-2 flex items-center gap-1.5">
          <div className="flex items-center gap-0.5">
            <Star className="h-3.5 w-3.5 fill-amber-400 text-amber-400" />
            <span className="text-xs font-medium text-slate-700">
              {product.rating}
            </span>
          </div>
          <span className="text-xs text-slate-400">({product.reviews})</span>
        </div>

        <div className="mt-auto pt-3">
          <div className="flex items-baseline gap-2">
            <span className="text-base font-bold text-slate-900">
              {formatPrice(product.price)}
            </span>
            {product.oldPrice && (
              <span className="text-xs text-slate-400 line-through">
                {formatPrice(product.oldPrice)}
              </span>
            )}
          </div>
          <button
            type="button"
            className="mt-3 w-full rounded-xl bg-slate-900 py-2.5 text-sm font-medium text-white transition hover:bg-slate-800"
          >
            افزودن به سبد
          </button>
        </div>
      </div>
    </article>
  );
}

/* -------------------------------------------------------------------------- */
/* Main Page                                                                  */
/* -------------------------------------------------------------------------- */

export default function StoreHomePage() {
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);
  const [searchQuery, setSearchQuery] = useState("");

  return (
    <div dir="rtl" className="min-h-screen bg-slate-50 text-slate-900">
      {/* ===================== TOP BAR ===================== */}
      <div className="bg-slate-900 text-white">
        <div className="mx-auto flex h-9 max-w-7xl items-center justify-between px-4 text-xs sm:px-6">
          <p>ارسال رایگان برای سفارش‌های بالای ۵۰۰ هزار تومان 🚚</p>
          <div className="hidden items-center gap-4 sm:flex">
            <a href="#" className="hover:text-slate-300">
              پیگیری سفارش
            </a>
            <a href="#" className="hover:text-slate-300">
              باشگاه مشتریان
            </a>
          </div>
        </div>
      </div>

      {/* ===================== HEADER ===================== */}
      <header className="sticky top-0 z-50 border-b border-slate-200 bg-white/95 backdrop-blur">
        <div className="mx-auto flex h-16 max-w-7xl items-center gap-4 px-4 sm:px-6 lg:h-20">
          {/* Mobile menu */}
          <button
            type="button"
            className="lg:hidden rounded-lg p-2 text-slate-600 hover:bg-slate-100"
            onClick={() => setMobileMenuOpen(true)}
          >
            <Menu className="h-5 w-5" />
          </button>

          {/* Logo */}
          <a href="/" className="flex shrink-0 items-center gap-2">
            <div className="flex h-9 w-9 items-center justify-center rounded-xl bg-slate-900 text-sm font-bold text-white">
              S
            </div>
            <span className="hidden text-lg font-bold sm:block">استور من</span>
          </a>

          {/* Search */}
          <div className="relative mx-auto hidden max-w-xl flex-1 md:block">
            <Search className="pointer-events-none absolute right-3 top-1/2 h-4 w-4 -translate-y-1/2 text-slate-400" />
            <input
              type="search"
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              placeholder="جستجوی محصول، برند و دسته..."
              className="w-full rounded-xl border border-slate-200 bg-slate-50 py-2.5 pr-10 pl-4 text-sm outline-none transition focus:border-slate-400 focus:bg-white focus:ring-2 focus:ring-slate-200"
            />
          </div>

          {/* Actions */}
          <div className="mr-auto flex items-center gap-1 sm:gap-2">
            <button
              type="button"
              className="rounded-lg p-2.5 text-slate-600 hover:bg-slate-100 md:hidden"
            >
              <Search className="h-5 w-5" />
            </button>
            <a
              href="/account"
              className="hidden items-center gap-2 rounded-lg px-3 py-2 text-sm text-slate-600 hover:bg-slate-100 sm:flex"
            >
              <User className="h-5 w-5" />
              <span className="hidden lg:inline">حساب کاربری</span>
            </a>
            <a
              href="/wishlist"
              className="rounded-lg p-2.5 text-slate-600 hover:bg-slate-100"
            >
              <Heart className="h-5 w-5" />
            </a>
            <a
              href="/cart"
              className="relative rounded-lg p-2.5 text-slate-600 hover:bg-slate-100"
            >
              <ShoppingCart className="h-5 w-5" />
              <span className="absolute -left-0.5 -top-0.5 flex h-4.5 w-4.5 items-center justify-center rounded-full bg-rose-500 text-[10px] font-bold text-white">
                3
              </span>
            </a>
          </div>
        </div>

        {/* Nav */}
        <nav className="hidden border-t border-slate-100 lg:block">
          <div className="mx-auto flex max-w-7xl items-center gap-1 px-6">
            {[
              "همه محصولات",
              "شگفت‌انگیزها",
              "برندها",
              "جدیدترین‌ها",
              "پرفروش‌ها",
              "تخفیف‌دارها",
            ].map((item) => (
              <a
                key={item}
                href="#"
                className="px-4 py-3 text-sm font-medium text-slate-600 transition hover:text-slate-900"
              >
                {item}
              </a>
            ))}
          </div>
        </nav>
      </header>

      {/* Mobile drawer */}
      {mobileMenuOpen && (
        <div className="fixed inset-0 z-[60] lg:hidden">
          <div
            className="absolute inset-0 bg-black/40"
            onClick={() => setMobileMenuOpen(false)}
          />
          <div className="absolute bottom-0 right-0 top-0 w-72 bg-white p-5 shadow-xl">
            <div className="mb-6 flex items-center justify-between">
              <span className="font-bold">منو</span>
              <button type="button" onClick={() => setMobileMenuOpen(false)}>
                <X className="h-5 w-5" />
              </button>
            </div>
            <div className="space-y-1">
              {[
                "همه محصولات",
                "شگفت‌انگیزها",
                "برندها",
                "جدیدترین‌ها",
                "پرفروش‌ها",
              ].map((item) => (
                <a
                  key={item}
                  href="#"
                  className="block rounded-lg px-3 py-2.5 text-sm text-slate-700 hover:bg-slate-50"
                >
                  {item}
                </a>
              ))}
            </div>
          </div>
        </div>
      )}

      <main>
        {/* ===================== HERO ===================== */}
        <section className="relative overflow-hidden bg-slate-900">
          <div className="absolute inset-0">
            <img
              src="https://images.unsplash.com/photo-1441986300917-64674bd600d8?w=1600&h=700&fit=crop"
              alt=""
              className="h-full w-full object-cover opacity-40"
            />
            <div className="absolute inset-0 bg-gradient-to-l from-slate-900/80 via-slate-900/50 to-transparent" />
          </div>

          <div className="relative mx-auto flex min-h-[420px] max-w-7xl flex-col justify-center px-4 py-16 sm:px-6 lg:min-h-[520px]">
            <div className="max-w-lg">
              <span className="mb-4 inline-block rounded-full bg-white/10 px-3 py-1 text-xs font-medium text-white backdrop-blur">
                مجموعه پاییز ۱۴۰۵
              </span>
              <h1 className="text-3xl font-bold leading-tight text-white sm:text-4xl lg:text-5xl">
                خرید هوشمند،
                <br />
                تجربه بهتر
              </h1>
              <p className="mt-4 text-base leading-7 text-slate-300">
                جدیدترین محصولات اصل با ضمانت، ارسال سریع و پشتیبانی واقعی. همین
                حالا تخفیف‌های ویژه را ببینید.
              </p>
              <div className="mt-8 flex flex-wrap gap-3">
                <a
                  href="#products"
                  className="inline-flex items-center gap-2 rounded-xl bg-white px-6 py-3 text-sm font-semibold text-slate-900 transition hover:bg-slate-100"
                >
                  مشاهده محصولات
                  <ArrowLeft className="h-4 w-4" />
                </a>
                <a
                  href="#categories"
                  className="inline-flex items-center rounded-xl border border-white/30 px-6 py-3 text-sm font-medium text-white transition hover:bg-white/10"
                >
                  دسته‌بندی‌ها
                </a>
              </div>
            </div>
          </div>
        </section>

        {/* ===================== BENEFITS ===================== */}
        <section className="border-b border-slate-200 bg-white">
          <div className="mx-auto grid max-w-7xl grid-cols-2 gap-4 px-4 py-8 sm:grid-cols-4 sm:px-6">
            {BENEFITS.map((item) => (
              <div key={item.title} className="flex items-start gap-3">
                <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-xl bg-slate-100 text-slate-700">
                  <item.icon className="h-5 w-5" />
                </div>
                <div>
                  <p className="text-sm font-semibold text-slate-800">
                    {item.title}
                  </p>
                  <p className="mt-0.5 text-xs text-slate-500">{item.desc}</p>
                </div>
              </div>
            ))}
          </div>
        </section>

        {/* ===================== CATEGORIES ===================== */}
        <section
          id="categories"
          className="mx-auto max-w-7xl px-4 py-14 sm:px-6"
        >
          <div className="mb-8 flex items-end justify-between">
            <div>
              <h2 className="text-xl font-bold text-slate-900 sm:text-2xl">
                دسته‌بندی‌ها
              </h2>
              <p className="mt-1 text-sm text-slate-500">
                انتخاب سریع بر اساس نیاز شما
              </p>
            </div>
            <a
              href="#"
              className="hidden items-center gap-1 text-sm font-medium text-slate-600 hover:text-slate-900 sm:flex"
            >
              همه دسته‌ها
              <ChevronLeft className="h-4 w-4" />
            </a>
          </div>

          <div className="grid grid-cols-2 gap-4 sm:grid-cols-3 lg:grid-cols-6">
            {CATEGORIES.map((cat) => (
              <a
                key={cat.id}
                href="#"
                className="group overflow-hidden rounded-2xl border border-slate-200 bg-white transition hover:shadow-md"
              >
                <div className="aspect-[4/3] overflow-hidden">
                  <img
                    src={cat.image}
                    alt={cat.name}
                    className="h-full w-full object-cover transition duration-500 group-hover:scale-105"
                  />
                </div>
                <div className="p-3 text-center">
                  <p className="text-sm font-semibold text-slate-800">
                    {cat.name}
                  </p>
                  <p className="mt-0.5 text-xs text-slate-400">
                    {cat.count} کالا
                  </p>
                </div>
              </a>
            ))}
          </div>
        </section>

        {/* ===================== PROMO BANNERS ===================== */}
        <section className="mx-auto max-w-7xl px-4 sm:px-6">
          <div className="grid gap-4 md:grid-cols-2">
            <a
              href="#"
              className="relative overflow-hidden rounded-2xl bg-gradient-to-l from-indigo-600 to-violet-600 p-8 text-white"
            >
              <div className="relative z-10 max-w-xs">
                <p className="text-sm font-medium text-white/80">
                  پیشنهاد ویژه
                </p>
                <h3 className="mt-2 text-2xl font-bold">تا ۴۰٪ تخفیف</h3>
                <p className="mt-2 text-sm text-white/80">
                  روی منتخب محصولات الکترونیک
                </p>
                <span className="mt-5 inline-flex items-center gap-1 rounded-lg bg-white/20 px-4 py-2 text-sm font-medium backdrop-blur transition hover:bg-white/30">
                  خرید کنید
                  <ChevronLeft className="h-4 w-4" />
                </span>
              </div>
            </a>

            <a
              href="#"
              className="relative overflow-hidden rounded-2xl bg-gradient-to-l from-slate-800 to-slate-900 p-8 text-white"
            >
              <div className="relative z-10 max-w-xs">
                <p className="text-sm font-medium text-white/80">مجموعه جدید</p>
                <h3 className="mt-2 text-2xl font-bold">پاییز و زمستان</h3>
                <p className="mt-2 text-sm text-white/80">
                  جدیدترین مدل‌های پوشاک و اکسسوری
                </p>
                <span className="mt-5 inline-flex items-center gap-1 rounded-lg bg-white/20 px-4 py-2 text-sm font-medium backdrop-blur transition hover:bg-white/30">
                  مشاهده کنید
                  <ChevronLeft className="h-4 w-4" />
                </span>
              </div>
            </a>
          </div>
        </section>

        {/* ===================== PRODUCTS ===================== */}
        <section id="products" className="mx-auto max-w-7xl px-4 py-14 sm:px-6">
          <div className="mb-8 flex items-end justify-between">
            <div>
              <h2 className="text-xl font-bold text-slate-900 sm:text-2xl">
                محصولات منتخب
              </h2>
              <p className="mt-1 text-sm text-slate-500">
                پرفروش‌ترین و محبوب‌ترین کالاها
              </p>
            </div>
            <a
              href="#"
              className="hidden items-center gap-1 text-sm font-medium text-slate-600 hover:text-slate-900 sm:flex"
            >
              مشاهده همه
              <ChevronLeft className="h-4 w-4" />
            </a>
          </div>

          <div className="grid grid-cols-2 gap-4 sm:grid-cols-3 lg:grid-cols-4">
            {PRODUCTS.map((product) => (
              <ProductCard key={product.id} product={product} />
            ))}
          </div>
        </section>

        {/* ===================== NEWSLETTER ===================== */}
        <section className="border-y border-slate-200 bg-white">
          <div className="mx-auto max-w-7xl px-4 py-14 sm:px-6">
            <div className="mx-auto max-w-xl text-center">
              <h2 className="text-xl font-bold text-slate-900 sm:text-2xl">
                از تخفیف‌ها باخبر شوید
              </h2>
              <p className="mt-2 text-sm text-slate-500">
                ایمیل‌تان را وارد کنید تا از پیشنهادهای ویژه و محصولات جدید مطلع
                شوید.
              </p>
              <form
                className="mt-6 flex flex-col gap-3 sm:flex-row"
                onSubmit={(e) => e.preventDefault()}
              >
                <input
                  type="email"
                  placeholder="ایمیل شما"
                  className="flex-1 rounded-xl border border-slate-200 px-4 py-3 text-sm outline-none focus:border-slate-400 focus:ring-2 focus:ring-slate-200"
                  dir="ltr"
                />
                <button
                  type="submit"
                  className="rounded-xl bg-slate-900 px-6 py-3 text-sm font-semibold text-white transition hover:bg-slate-800"
                >
                  عضویت
                </button>
              </form>
            </div>
          </div>
        </section>
      </main>

      {/* ===================== FOOTER ===================== */}
      <footer className="bg-slate-900 text-slate-300">
        <div className="mx-auto max-w-7xl px-4 py-12 sm:px-6">
          <div className="grid gap-8 sm:grid-cols-2 lg:grid-cols-4">
            <div>
              <div className="flex items-center gap-2 text-white">
                <div className="flex h-8 w-8 items-center justify-center rounded-lg bg-white text-sm font-bold text-slate-900">
                  S
                </div>
                <span className="font-bold">استور من</span>
              </div>
              <p className="mt-4 text-sm leading-6 text-slate-400">
                فروشگاه آنلاین با تمرکز روی کیفیت، اصالت کالا و تجربه خرید آسان.
              </p>
            </div>

            <div>
              <h4 className="text-sm font-semibold text-white">دسترسی سریع</h4>
              <ul className="mt-4 space-y-2 text-sm">
                {[
                  "درباره ما",
                  "تماس با ما",
                  "سوالات متداول",
                  "قوانین و مقررات",
                ].map((item) => (
                  <li key={item}>
                    <a href="#" className="hover:text-white">
                      {item}
                    </a>
                  </li>
                ))}
              </ul>
            </div>

            <div>
              <h4 className="text-sm font-semibold text-white">
                خدمات مشتریان
              </h4>
              <ul className="mt-4 space-y-2 text-sm">
                {[
                  "پیگیری سفارش",
                  "راهنمای خرید",
                  "بازگشت کالا",
                  "ضمانت‌ها",
                ].map((item) => (
                  <li key={item}>
                    <a href="#" className="hover:text-white">
                      {item}
                    </a>
                  </li>
                ))}
              </ul>
            </div>

            <div>
              <h4 className="text-sm font-semibold text-white">تماس با ما</h4>
              <ul className="mt-4 space-y-2 text-sm text-slate-400">
                <li>۰۲۱-۱۲۳۴۵۶۷۸</li>
                <li>support@mystore.com</li>
                <li>تهران، خیابان مثال، پلاک ۱۲</li>
              </ul>
            </div>
          </div>

          <div className="mt-10 flex flex-col items-center justify-between gap-4 border-t border-slate-800 pt-6 sm:flex-row">
            <p className="text-xs text-slate-500">
              © ۱۴۰۵ استور من. تمامی حقوق محفوظ است.
            </p>
            <div className="flex gap-4 text-xs text-slate-500">
              <a href="#" className="hover:text-white">
                حریم خصوصی
              </a>
              <a href="#" className="hover:text-white">
                شرایط استفاده
              </a>
            </div>
          </div>
        </div>
      </footer>
    </div>
  );
}
