import React, { useState, useMemo } from "react";

// ==================== Types (مطابق مدل Laravel شما) ====================
interface Post {
    id: number;
    user_id: number;
    category_id: number;
    title: string;
    slug: string;
    content: string;
    visibility: "public" | "private" | "draft";
    excerpt: string | null;
    featured_image: string;
    published_at: string | null;
    is_active: boolean;
    meta: Record<string, any> | null;
    created_at: string;
    updated_at: string;
    // روابط (برای نمایش)
    author: {
        id: number;
        name: string;
        avatar: string;
    };
    category: {
        id: number;
        name: string;
        slug: string;
    };
}

// ==================== Mock Data ====================
const MOCK_POSTS: Post[] = [
    {
        id: 1,
        user_id: 1,
        category_id: 1,
        title: "آشنایی با معماری REST API در لاراول",
        slug: "laravel-rest-api-architecture",
        content: "متن کامل مقاله...",
        visibility: "public",
        excerpt:
            "در این مقاله به صورت کامل معماری REST API در لاراول را بررسی می‌کنیم و بهترین روش‌های طراحی API تمیز را یاد می‌گیریم.",
        featured_image:
            "https://images.unsplash.com/photo-1555066931-4365d14bab8c?w=800&q=80",
        published_at: "2026-08-15T10:00:00",
        is_active: true,
        meta: { reading_time: 8, tags: ["laravel", "api", "backend"] },
        created_at: "2026-08-10T09:00:00",
        updated_at: "2026-08-15T10:00:00",
        author: {
            id: 1,
            name: "علی رضایی",
            avatar: "https://i.pravatar.cc/150?img=11",
        },
        category: { id: 1, name: "برنامه‌نویسی", slug: "programming" },
    },
    {
        id: 2,
        user_id: 2,
        category_id: 2,
        title: "طراحی UI مدرن با Tailwind CSS و React",
        slug: "modern-ui-tailwind-react",
        content: "متن کامل مقاله...",
        visibility: "public",
        excerpt:
            "چگونه با ترکیب Tailwind و React رابط‌های کاربری زیبا، سریع و کاملاً ریسپانسیو بسازیم.",
        featured_image:
            "https://images.unsplash.com/photo-1618477388954-7852f72348ae?w=800&q=80",
        published_at: "2026-08-20T14:30:00",
        is_active: true,
        meta: { reading_time: 6, tags: ["react", "tailwind", "frontend"] },
        created_at: "2026-08-18T11:00:00",
        updated_at: "2026-08-20T14:30:00",
        author: {
            id: 2,
            name: "سارا محمدی",
            avatar: "https://i.pravatar.cc/150?img=5",
        },
        category: { id: 2, name: "فرانت‌اند", slug: "frontend" },
    },
    {
        id: 3,
        user_id: 1,
        category_id: 1,
        title: "بهترین روش‌های مدیریت State در React",
        slug: "react-state-management-best-practices",
        content: "متن کامل مقاله...",
        visibility: "public",
        excerpt:
            "از useState ساده تا Context و کتابخانه‌های پیشرفته مثل Zustand و Redux Toolkit — کدام را انتخاب کنیم؟",
        featured_image:
            "https://images.unsplash.com/photo-1633356122544-f134324a6cee?w=800&q=80",
        published_at: "2026-08-25T09:15:00",
        is_active: true,
        meta: { reading_time: 10, tags: ["react", "state", "hooks"] },
        created_at: "2026-08-22T08:00:00",
        updated_at: "2026-08-25T09:15:00",
        author: {
            id: 1,
            name: "علی رضایی",
            avatar: "https://i.pravatar.cc/150?img=11",
        },
        category: { id: 1, name: "برنامه‌نویسی", slug: "programming" },
    },
    {
        id: 4,
        user_id: 3,
        category_id: 3,
        title: "امنیت در APIهای لاراول: از Sanctum تا Rate Limiting",
        slug: "laravel-api-security",
        content: "متن کامل مقاله...",
        visibility: "public",
        excerpt:
            "چگونه API خود را در برابر حملات رایج محافظت کنیم و بهترین روش‌های احراز هویت را پیاده‌سازی کنیم.",
        featured_image:
            "https://images.unsplash.com/photo-1563986768609-322da13575f3?w=800&q=80",
        published_at: "2026-09-01T16:45:00",
        is_active: true,
        meta: { reading_time: 12, tags: ["laravel", "security", "sanctum"] },
        created_at: "2026-08-28T13:00:00",
        updated_at: "2026-09-01T16:45:00",
        author: {
            id: 3,
            name: "محمد کریمی",
            avatar: "https://i.pravatar.cc/150?img=33",
        },
        category: { id: 3, name: "امنیت", slug: "security" },
    },
    {
        id: 5,
        user_id: 2,
        category_id: 2,
        title: "ساخت کامپوننت‌های قابل استفاده مجدد در React",
        slug: "reusable-react-components",
        content: "متن کامل مقاله...",
        visibility: "public",
        excerpt:
            "اصول طراحی کامپوننت‌های تمیز، قابل نگهداری و قابل استفاده مجدد که سرعت توسعه شما را چند برابر می‌کند.",
        featured_image:
            "https://images.unsplash.com/photo-1517694712202-14dd9538aa97?w=800&q=80",
        published_at: "2026-09-03T11:20:00",
        is_active: true,
        meta: { reading_time: 7, tags: ["react", "components", "clean-code"] },
        created_at: "2026-09-01T10:00:00",
        updated_at: "2026-09-03T11:20:00",
        author: {
            id: 2,
            name: "سارا محمدی",
            avatar: "https://i.pravatar.cc/150?img=5",
        },
        category: { id: 2, name: "فرانت‌اند", slug: "frontend" },
    },
    {
        id: 6,
        user_id: 1,
        category_id: 4,
        title: "بهینه‌سازی عملکرد در اپلیکیشن‌های React",
        slug: "react-performance-optimization",
        content: "متن کامل مقاله...",
        visibility: "public",
        excerpt:
            "تکنیک‌های پیشرفته مثل memo، useMemo، useCallback، lazy loading و code splitting برای ساخت اپلیکیشن‌های فوق‌العاده سریع.",
        featured_image:
            "https://images.unsplash.com/photo-1460925895917-afdab827c52f?w=800&q=80",
        published_at: "2026-09-05T08:00:00",
        is_active: true,
        meta: {
            reading_time: 9,
            tags: ["react", "performance", "optimization"],
        },
        created_at: "2026-09-04T07:30:00",
        updated_at: "2026-09-05T08:00:00",
        author: {
            id: 1,
            name: "علی رضایی",
            avatar: "https://i.pravatar.cc/150?img=11",
        },
        category: { id: 4, name: "بهینه‌سازی", slug: "optimization" },
    },
];

// ==================== Helpers ====================
const formatDate = (dateString: string | null) => {
    if (!dateString) return "پیش‌نویس";
    return new Date(dateString).toLocaleDateString("fa-IR", {
        year: "numeric",
        month: "long",
        day: "numeric",
    });
};

// ==================== Components ====================

const SearchBar = ({
    value,
    onChange,
}: {
    value: string;
    onChange: (v: string) => void;
}) => (
    <div className="relative max-w-2xl mx-auto">
        <div className="absolute inset-y-0 right-0 flex items-center pr-4 pointer-events-none">
            <svg
                className="w-5 h-5 text-slate-400"
                fill="none"
                stroke="currentColor"
                viewBox="0 0 24 24"
            >
                <path
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    strokeWidth={2}
                    d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z"
                />
            </svg>
        </div>
        <input
            type="text"
            value={value}
            onChange={(e) => onChange(e.target.value)}
            placeholder="جستجو در عنوان، خلاصه یا دسته‌بندی..."
            className="w-full pr-12 pl-5 py-4 bg-white/80 backdrop-blur-sm border border-slate-200 rounded-2xl shadow-sm focus:outline-none focus:ring-2 focus:ring-indigo-500/30 focus:border-indigo-400 transition-all text-slate-800 placeholder:text-slate-400 text-right"
        />
    </div>
);

const CategoryBadge = ({ name }: { name: string }) => (
    <span className="inline-flex items-center px-3 py-1 rounded-full text-xs font-medium bg-indigo-50 text-indigo-700 border border-indigo-100">
        {name}
    </span>
);

const PostCard = ({ post }: { post: Post }) => {
    return (
        <article className="group bg-white rounded-3xl overflow-hidden shadow-sm hover:shadow-xl border border-slate-100 transition-all duration-300 hover:-translate-y-1">
            {/* Image */}
            <div className="relative h-52 overflow-hidden">
                <img
                    src={post.featured_image}
                    alt={post.title}
                    className="w-full h-full object-cover transition-transform duration-500 group-hover:scale-105"
                />
                <div className="absolute inset-0 bg-gradient-to-t from-black/40 via-transparent to-transparent opacity-0 group-hover:opacity-100 transition-opacity" />
                <div className="absolute top-4 right-4">
                    <CategoryBadge name={post.category.name} />
                </div>
            </div>

            {/* Content */}
            <div className="p-6 flex flex-col gap-4">
                <div className="flex items-center justify-between text-sm text-slate-500">
                    <span>{formatDate(post.published_at)}</span>
                    <span className="flex items-center gap-1">
                        <svg
                            className="w-4 h-4"
                            fill="none"
                            stroke="currentColor"
                            viewBox="0 0 24 24"
                        >
                            <path
                                strokeLinecap="round"
                                strokeLinejoin="round"
                                strokeWidth={2}
                                d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z"
                            />
                        </svg>
                        {post.meta?.reading_time || 5} دقیقه
                    </span>
                </div>

                <h2 className="text-xl font-bold text-slate-800 leading-snug group-hover:text-indigo-600 transition-colors line-clamp-2">
                    {post.title}
                </h2>

                <p className="text-slate-600 text-sm leading-relaxed line-clamp-3">
                    {post.excerpt}
                </p>

                {/* Author */}
                <div className="flex items-center justify-between pt-2 border-t border-slate-100">
                    <div className="flex items-center gap-3">
                        <img
                            src={post.author.avatar}
                            alt={post.author.name}
                            className="w-9 h-9 rounded-full object-cover ring-2 ring-white shadow"
                        />
                        <div>
                            <p className="text-sm font-medium text-slate-800">
                                {post.author.name}
                            </p>
                            <p className="text-xs text-slate-500">نویسنده</p>
                        </div>
                    </div>

                    <button className="opacity-0 group-hover:opacity-100 transition-opacity flex items-center gap-1 text-indigo-600 text-sm font-medium hover:gap-2">
                        ادامه مطلب
                        <svg
                            className="w-4 h-4 rotate-180"
                            fill="none"
                            stroke="currentColor"
                            viewBox="0 0 24 24"
                        >
                            <path
                                strokeLinecap="round"
                                strokeLinejoin="round"
                                strokeWidth={2}
                                d="M17 8l4 4m0 0l-4 4m4-4H3"
                            />
                        </svg>
                    </button>
                </div>
            </div>
        </article>
    );
};

const EmptyState = () => (
    <div className="col-span-full flex flex-col items-center justify-center py-20 text-center">
        <div className="w-20 h-20 bg-slate-100 rounded-full flex items-center justify-center mb-6">
            <svg
                className="w-10 h-10 text-slate-400"
                fill="none"
                stroke="currentColor"
                viewBox="0 0 24 24"
            >
                <path
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    strokeWidth={1.5}
                    d="M9.172 16.172a4 4 0 015.656 0M9 10h.01M15 10h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z"
                />
            </svg>
        </div>
        <h3 className="text-xl font-semibold text-slate-700 mb-2">
            نتیجه‌ای پیدا نشد
        </h3>
        <p className="text-slate-500 max-w-md">
            متأسفانه پستی با این جستجو پیدا نشد. کلمات کلیدی دیگری را امتحان
            کنید.
        </p>
    </div>
);

// ==================== Main Page ====================
export default function BlogPostsPage() {
    const [searchQuery, setSearchQuery] = useState("");
    const [selectedCategory, setSelectedCategory] = useState<string>("all");

    // استخراج دسته‌بندی‌های یکتا
    const categories = useMemo(() => {
        const cats = Array.from(
            new Map(
                MOCK_POSTS.map((p) => [p.category.id, p.category]),
            ).values(),
        );
        return cats;
    }, []);

    // فیلتر پست‌ها
    const filteredPosts = useMemo(() => {
        return MOCK_POSTS.filter((post) => {
            const matchesSearch =
                searchQuery === "" ||
                post.title.toLowerCase().includes(searchQuery.toLowerCase()) ||
                (post.excerpt || "")
                    .toLowerCase()
                    .includes(searchQuery.toLowerCase()) ||
                post.category.name
                    .toLowerCase()
                    .includes(searchQuery.toLowerCase()) ||
                post.author.name
                    .toLowerCase()
                    .includes(searchQuery.toLowerCase());

            const matchesCategory =
                selectedCategory === "all" ||
                post.category.slug === selectedCategory;

            return matchesSearch && matchesCategory && post.is_active;
        });
    }, [searchQuery, selectedCategory]);

    return (
        <div
            className="min-h-screen bg-gradient-to-br from-slate-50 via-indigo-50/30 to-slate-50"
            dir="rtl"
        >
            {/* Header */}
            <header className="relative overflow-hidden">
                <div className="absolute inset-0 bg-gradient-to-l from-indigo-600 via-indigo-500 to-violet-500 opacity-95" />
                <div className="absolute inset-0 bg-[url('https://www.transparenttextures.com/patterns/cubes.png')] opacity-10" />

                <div className="relative max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-16 md:py-24">
                    <div className="text-center space-y-6">
                        <h1 className="text-4xl md:text-5xl lg:text-6xl font-extrabold text-white tracking-tight">
                            وبلاگ ما
                        </h1>
                        <p className="text-lg md:text-xl text-indigo-100 max-w-2xl mx-auto leading-relaxed">
                            آخرین مقالات و آموزش‌های تخصصی در حوزه برنامه‌نویسی،
                            طراحی و تکنولوژی
                        </p>

                        {/* Search */}
                        <div className="pt-6">
                            <SearchBar
                                value={searchQuery}
                                onChange={setSearchQuery}
                            />
                        </div>
                    </div>
                </div>

                {/* Wave divider */}
                <div className="absolute bottom-0 left-0 right-0">
                    <svg
                        viewBox="0 0 1440 80"
                        fill="none"
                        xmlns="http://www.w3.org/2000/svg"
                        className="w-full"
                    >
                        <path
                            d="M0 40C240 80 480 0 720 40C960 80 1200 0 1440 40V80H0V40Z"
                            fill="#f8fafc"
                        />
                    </svg>
                </div>
            </header>

            {/* Main Content */}
            <main className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 pb-20 mt-10">
                {/* Category Filters */}
                <div className="flex flex-wrap items-center justify-center gap-3 mb-12">
                    <button
                        onClick={() => setSelectedCategory("all")}
                        className={`px-5 py-2.5 rounded-full text-sm font-medium transition-all ${
                            selectedCategory === "all"
                                ? "bg-indigo-600 text-white shadow-lg shadow-indigo-200"
                                : "bg-white text-slate-600 hover:bg-slate-50 border border-slate-200"
                        }`}
                    >
                        همه مقالات
                    </button>
                    {categories.map((cat) => (
                        <button
                            key={cat.id}
                            onClick={() => setSelectedCategory(cat.slug)}
                            className={`px-5 py-2.5 rounded-full text-sm font-medium transition-all ${
                                selectedCategory === cat.slug
                                    ? "bg-indigo-600 text-white shadow-lg shadow-indigo-200"
                                    : "bg-white text-slate-600 hover:bg-slate-50 border border-slate-200"
                            }`}
                        >
                            {cat.name}
                        </button>
                    ))}
                </div>

                {/* Results count */}
                <div className="mb-8 text-center">
                    <p className="text-slate-500 text-sm">
                        {filteredPosts.length} مقاله پیدا شد
                    </p>
                </div>

                {/* Posts Grid */}
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
                    {filteredPosts.length > 0 ? (
                        filteredPosts.map((post) => (
                            <PostCard key={post.id} post={post} />
                        ))
                    ) : (
                        <EmptyState />
                    )}
                </div>
            </main>

            {/* Footer */}
            <footer className="border-t border-slate-200 bg-white/50 backdrop-blur-sm">
                <div className="max-w-7xl mx-auto px-4 py-10 text-center text-slate-500 text-sm">
                    © ۱۴۰۵ — ساخته شده با ❤️ و React + Tailwind
                </div>
            </footer>
        </div>
    );
}
