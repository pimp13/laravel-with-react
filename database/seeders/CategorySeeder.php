<?php

namespace Database\Seeders;

use App\Models\Category;
use Illuminate\Database\Seeder;
use Illuminate\Support\Str;

class CategorySeeder extends Seeder
{
    public function run(): void
    {
        // پاک کردن داده‌های قبلی (اختیاری)
        Category::query()->delete();

        // ==================== دسته‌های اصلی (Root) ====================
        $rootTitles = [
            'الکترونیک',
            'پوشاک و مد',
            'لوازم خانگی',
            'کالای دیجیتال',
            'آرایشی و بهداشتی',
            'ورزش و سفر',
            'کتاب و لوازم تحریر',
            'ابزار و یراق',
            'کودک و نوزاد',
            'خودرو و موتورسیکلت',
            'سوپرمارکت',
            'خانه و آشپزخانه',
            'طلا و جواهر',
            'حیوانات خانگی',
            'هنر و صنایع دستی',
        ];

        $roots = [];

        foreach ($rootTitles as $title) {
            $roots[] = Category::create([
                'parent_id' => null,
                'title'     => $title,
                'slug'      => Str::slug($title),
                'is_active' => true,
                'meta'      => [
                    'description' => "دسته‌بندی {$title}",
                    'icon'        => 'folder',
                ],
            ]);
        }

        // ==================== زیرمجموعه‌ها (سطح ۱ و ۲) ====================
        $childTitles = [
            // الکترونیک
            'موبایل',
            'لپ‌تاپ',
            'تبلت',
            'هدفون و هندزفری',
            'ساعت هوشمند',
            // پوشاک
            'لباس مردانه',
            'لباس زنانه',
            'کفش',
            'کیف',
            'اکسسوری',
            // لوازم خانگی
            'یخچال',
            'ماشین لباسشویی',
            'جاروبرقی',
            'تلویزیون',
            'اجاق گاز',
            // کالای دیجیتال
            'دوربین',
            'کنسول بازی',
            'اسپیکر',
            'هارد و حافظه',
            'مانیتور',
            // آرایشی
            'آرایش صورت',
            'مراقبت پوست',
            'عطر',
            'مراقبت مو',
            'بهداشت شخصی',
            // ورزش
            'لباس ورزشی',
            'کفش ورزشی',
            'تجهیزات بدنسازی',
            'کمپینگ',
            'دوچرخه',
            // کتاب
            'کتاب چاپی',
            'کتاب الکترونیکی',
            'لوازم تحریر',
            'دفتر و کاغذ',
            // ابزار
            'ابزار دستی',
            'ابزار برقی',
            'یراق‌آلات',
            'نقاشی ساختمان',
            // کودک
            'پوشاک کودک',
            'اسباب‌بازی',
            'بهداشت کودک',
            'کالای نوزاد',
            // خودرو
            'لوازم یدکی',
            'لوازم جانبی خودرو',
            'روغن و فیلتر',
            // سوپرمارکت
            'مواد غذایی',
            'نوشیدنی',
            'شوینده',
            'تنقلات',
            // خانه
            'دکوراسیون',
            'مبلمان',
            'فرش و موکت',
            'آشپزخانه',
            // طلا
            'گردنبند',
            'انگشتر',
            'دستبند',
            'ساعت طلا',
            // حیوانات
            'غذای حیوانات',
            'لوازم نگهداری',
            'اسباب‌بازی حیوانات',
            // هنر
            'نقاشی',
            'مجسمه‌سازی',
            'صنایع دستی',
            'لوازم هنری',
        ];

        $created = 0;
        $target = 100; // می‌خوای حدود ۱۰۰ رکورد داشته باشی

        foreach ($childTitles as $index => $title) {
            if ($created >= $target - count($roots)) {
                break;
            }

            // انتخاب تصادفی یکی از ریشه‌ها به عنوان parent
            $parent = $roots[array_rand($roots)];

            Category::create([
                'parent_id' => $parent->id,
                'title'     => $title,
                'slug'      => Str::slug($title) . '-' . ($index + 1),
                'is_active' => (bool) rand(0, 1),
                'meta'      => json_encode([
                    'description' => "زیرمجموعه {$title} از دسته {$parent->title}",
                    'icon'        => 'tag',
                ]),
            ]);

            $created++;
        }

        // اگر هنوز به ۱۰۰ نرسیده، چند تا سطح ۲ هم اضافه می‌کنیم
        $level1Categories = Category::whereNotNull('parent_id')->get();

        while ($created < $target - count($roots) && $level1Categories->isNotEmpty()) {
            $parent = $level1Categories->random();

            Category::create([
                'parent_id' => $parent->id,
                'title'     => $parent->title . ' - جزئیات ' . ($created + 1),
                'slug'      => Str::slug($parent->title) . '-detail-' . ($created + 1),
                'is_active' => true,
                'meta'      => json_encode([
                    'description' => "سطح سوم از {$parent->title}",
                    'icon'        => 'circle',
                ]),
            ]);

            $created++;
        }

        $this->command->info('✅ تعداد کل دسته‌بندی‌های ایجاد شده: ' . Category::count());
    }
}
