<?php

namespace Database\Seeders;

use App\Enums\Visibility;
use App\Models\Category;
use App\Models\Post;
use App\Models\User;
use Illuminate\Database\Seeder;
use Illuminate\Support\Str;
use Carbon\Carbon;

class PostSeeder extends Seeder
{
    public function run(): void
    {
        // پاک کردن پست‌های قبلی (اختیاری)
        Post::query()->delete();

        // ==================== کاربران (نویسنده) ====================
        $authors = User::all();

        if ($authors->isEmpty()) {
            $authors = collect([
                User::create([
                    'name' => 'علی رضایی',
                    'email' => 'ali@example.com',
                    'password' => bcrypt('password'),
                ]),
                User::create([
                    'name' => 'سارا محمدی',
                    'email' => 'sara@example.com',
                    'password' => bcrypt('password'),
                ]),
                User::create([
                    'name' => 'محمد کریمی',
                    'email' => 'mohammad@example.com',
                    'password' => bcrypt('password'),
                ]),
            ]);
        }

        // ==================== دسته‌بندی‌های وبلاگ ====================
        $blogCategories = [
            'برنامه‌نویسی' => 'programming',
            'فرانت‌اند' => 'frontend',
            'بک‌اند' => 'backend',
            'امنیت' => 'security',
            'بهینه‌سازی' => 'optimization',
            'دیتابیس' => 'database',
            'DevOps' => 'devops',
        ];

        $categories = [];

        foreach ($blogCategories as $title => $slug) {
            $categories[] = Category::firstOrCreate(
                ['slug' => $slug],
                [
                    'parent_id' => null,
                    'title'     => $title,
                    'is_active' => true,
                    'meta'      => [
                        'description' => "دسته‌بندی مقالات {$title}",
                        'icon'        => 'article',
                    ],
                ]
            );
        }

        // ==================== پست‌های نمونه ====================
        $posts = [
            [
                'title' => 'آشنایی با معماری REST API در لاراول',
                'slug' => 'laravel-rest-api-architecture',
                'content' => $this->generateContent('آشنایی با معماری REST API در لاراول'),
                'visibility' => Visibility::General,
                'excerpt' => 'در این مقاله به صورت کامل معماری REST API در لاراول را بررسی می‌کنیم و بهترین روش‌های طراحی API تمیز را یاد می‌گیریم.',
                'featured_image' => 'https://images.unsplash.com/photo-1555066931-4365d14bab8c?w=800&q=80',
                'published_at' => Carbon::parse('2026-08-15 10:00:00'),
                'is_active' => true,
                'meta' => [
                    'reading_time' => 8,
                    'tags' => ['laravel', 'api', 'backend'],
                ],
                'category' => 'برنامه‌نویسی',
                'author_index' => 0,
            ],
            [
                'title' => 'طراحی UI مدرن با Tailwind CSS و React',
                'slug' => 'modern-ui-tailwind-react',
                'content' => $this->generateContent('طراحی UI مدرن با Tailwind CSS و React'),
                'visibility' => Visibility::General,
                'excerpt' => 'چگونه با ترکیب Tailwind و React رابط‌های کاربری زیبا، سریع و کاملاً ریسپانسیو بسازیم.',
                'featured_image' => 'https://images.unsplash.com/photo-1618477388954-7852f72348ae?w=800&q=80',
                'published_at' => Carbon::parse('2026-08-20 14:30:00'),
                'is_active' => true,
                'meta' => [
                    'reading_time' => 6,
                    'tags' => ['react', 'tailwind', 'frontend'],
                ],
                'category' => 'فرانت‌اند',
                'author_index' => 1,
            ],
            [
                'title' => 'بهترین روش‌های مدیریت State در React',
                'slug' => 'react-state-management-best-practices',
                'content' => $this->generateContent('بهترین روش‌های مدیریت State در React'),
                'visibility' => Visibility::General,
                'excerpt' => 'از useState ساده تا Context و کتابخانه‌های پیشرفته مثل Zustand و Redux Toolkit — کدام را انتخاب کنیم؟',
                'featured_image' => 'https://images.unsplash.com/photo-1633356122544-f134324a6cee?w=800&q=80',
                'published_at' => Carbon::parse('2026-08-25 09:15:00'),
                'is_active' => true,
                'meta' => [
                    'reading_time' => 10,
                    'tags' => ['react', 'state', 'hooks'],
                ],
                'category' => 'فرانت‌اند',
                'author_index' => 0,
            ],
            [
                'title' => 'امنیت در APIهای لاراول: از Sanctum تا Rate Limiting',
                'slug' => 'laravel-api-security',
                'content' => $this->generateContent('امنیت در APIهای لاراول'),
                'visibility' => Visibility::General,
                'excerpt' => 'چگونه API خود را در برابر حملات رایج محافظت کنیم و بهترین روش‌های احراز هویت را پیاده‌سازی کنیم.',
                'featured_image' => 'https://images.unsplash.com/photo-1563986768609-322da13575f3?w=800&q=80',
                'published_at' => Carbon::parse('2026-09-01 16:45:00'),
                'is_active' => true,
                'meta' => [
                    'reading_time' => 12,
                    'tags' => ['laravel', 'security', 'sanctum'],
                ],
                'category' => 'امنیت',
                'author_index' => 2,
            ],
            [
                'title' => 'ساخت کامپوننت‌های قابل استفاده مجدد در React',
                'slug' => 'reusable-react-components',
                'content' => $this->generateContent('ساخت کامپوننت‌های قابل استفاده مجدد در React'),
                'visibility' => Visibility::General,
                'excerpt' => 'اصول طراحی کامپوننت‌های تمیز، قابل نگهداری و قابل استفاده مجدد که سرعت توسعه شما را چند برابر می‌کند.',
                'featured_image' => 'https://images.unsplash.com/photo-1517694712202-14dd9538aa97?w=800&q=80',
                'published_at' => Carbon::parse('2026-09-03 11:20:00'),
                'is_active' => true,
                'meta' => [
                    'reading_time' => 7,
                    'tags' => ['react', 'components', 'clean-code'],
                ],
                'category' => 'فرانت‌اند',
                'author_index' => 1,
            ],
            [
                'title' => 'بهینه‌سازی عملکرد در اپلیکیشن‌های React',
                'slug' => 'react-performance-optimization',
                'content' => $this->generateContent('بهینه‌سازی عملکرد در اپلیکیشن‌های React'),
                'visibility' => Visibility::General,
                'excerpt' => 'تکنیک‌های پیشرفته مثل memo، useMemo، useCallback، lazy loading و code splitting برای ساخت اپلیکیشن‌های فوق‌العاده سریع.',
                'featured_image' => 'https://images.unsplash.com/photo-1460925895917-afdab827c52f?w=800&q=80',
                'published_at' => Carbon::parse('2026-09-05 08:00:00'),
                'is_active' => true,
                'meta' => [
                    'reading_time' => 9,
                    'tags' => ['react', 'performance', 'optimization'],
                ],
                'category' => 'بهینه‌سازی',
                'author_index' => 0,
            ],
            [
                'title' => 'Eloquent در لاراول: از پایه‌ها تا تکنیک‌های پیشرفته',
                'slug' => 'laravel-eloquent-advanced',
                'content' => $this->generateContent('Eloquent در لاراول'),
                'visibility' => Visibility::General,
                'excerpt' => 'رابطه‌ها، Query Scopes، Eager Loading و تکنیک‌هایی که باعث می‌شود کد دیتابیس شما تمیز و بهینه باشد.',
                'featured_image' => 'https://images.unsplash.com/photo-1544383835-bda2bc66a55d?w=800&q=80',
                'published_at' => Carbon::parse('2026-09-06 13:00:00'),
                'is_active' => true,
                'meta' => [
                    'reading_time' => 11,
                    'tags' => ['laravel', 'eloquent', 'database'],
                ],
                'category' => 'بک‌اند',
                'author_index' => 2,
            ],
            [
                'title' => 'Docker برای توسعه‌دهندگان لاراول',
                'slug' => 'docker-for-laravel-developers',
                'content' => $this->generateContent('Docker برای توسعه‌دهندگان لاراول'),
                'visibility' => Visibility::General,
                'excerpt' => 'چگونه محیط توسعه لاراول خود را با Docker استاندارد و قابل حمل کنیم.',
                'featured_image' => 'https://images.unsplash.com/photo-1605745341112-85968b19335b?w=800&q=80',
                'published_at' => Carbon::parse('2026-09-07 10:30:00'),
                'is_active' => true,
                'meta' => [
                    'reading_time' => 8,
                    'tags' => ['docker', 'laravel', 'devops'],
                ],
                'category' => 'DevOps',
                'author_index' => 0,
            ],
        ];

        // ==================== ایجاد پست‌ها ====================
        foreach ($posts as $postData) {
            $category = collect($categories)->firstWhere('title', $postData['category']);
            $author = $authors[$postData['author_index'] % $authors->count()];

            Post::create([
                'user_id'        => $author->id,
                'category_id'    => $category->id,
                'title'          => $postData['title'],
                'slug'           => $postData['slug'],
                'content'        => $postData['content'],
                'visibility'     => $postData['visibility'],
                'excerpt'        => $postData['excerpt'],
                'featured_image' => $postData['featured_image'],
                'published_at'   => $postData['published_at'],
                'is_active'      => $postData['is_active'],
                'meta'           => $postData['meta'],
            ]);
        }

        $this->command->info('✅ تعداد پست‌های ایجاد شده: ' . Post::count());
    }

    /**
     * تولید محتوای نمونه برای پست
     */
    private function generateContent(string $title): string
    {
        return "
        <h2>مقدمه</h2>
        <p>در این مقاله قصد داریم به موضوع <strong>{$title}</strong> به صورت کامل و کاربردی بپردازیم.</p>

        <h2>چرا این موضوع مهم است؟</h2>
        <p>در دنیای امروز توسعه نرم‌افزار، داشتن دانش عمیق در این حوزه می‌تواند تفاوت بزرگی در کیفیت و سرعت توسعه پروژه‌ها ایجاد کند.</p>

        <h2>مفاهیم کلیدی</h2>
        <ul>
            <li>مفهوم اول و اهمیت آن</li>
            <li>مفهوم دوم و کاربردهای عملی</li>
            <li>بهترین روش‌های پیاده‌سازی</li>
            <li>اشتباهات رایج و نحوه جلوگیری از آن‌ها</li>
        </ul>

        <h2>مثال عملی</h2>
        <p>در ادامه یک مثال واقعی و کاربردی را با هم بررسی می‌کنیم تا مفاهیم به صورت عملی در ذهن شما جا بیفتد.</p>

        <pre><code>// نمونه کد
// این بخش بعداً با کد واقعی جایگزین می‌شود
</code></pre>

        <h2>جمع‌بندی</h2>
        <p>امیدواریم این مقاله برای شما مفید بوده باشد. اگر سوالی داشتید، در بخش نظرات با ما در میان بگذارید.</p>
        ";
    }
}
