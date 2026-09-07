<?php

namespace App\Models;

use App\Enums\Visibility;
use Carbon\Carbon;
use Illuminate\Database\Eloquent\Attributes\Fillable;
use Illuminate\Database\Eloquent\Attributes\Scope;
use Illuminate\Database\Eloquent\Builder;
use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\Relations\BelongsTo;

/**
 * @property int $id
 * @property int $user_id
 * @property int $category_id
 * @property int $title
 * @property string $slug
 * @property string $content
 * @property enum-string $visibility
 * @property string|null $excerpt
 * @property string $featured_image
 * @property Carbon|null $published_at
 * @property bool $is_active
 * @property array|null $meta
 * @property Carbon|null $created_at
 * @property Carbon|null $updated_at
 */
#[Fillable([
    'title',
    'slug',
    'content',
    'meta',
    'is_active',
    'user_id',
    'category_id',
    'visibility',
    'excerpt',
    'published_at',
    'featured_image',
])]
class Post extends Model
{
    protected $casts = [
        'meta' => 'object',
        'is_active' => 'boolean',
        'visibility' => Visibility::class,
    ];

    protected $attributes = [
        'visibility' => 'general',
        'is_active' => true,
        'published_at' => null,
    ];

    public function category(): BelongsTo
    {
        return $this->belongsTo(Category::class, 'category_id');
    }

    public function author(): BelongsTo
    {
        return $this->belongsTo(User::class, 'user_id');
    }

    /**
     * Scope برای پست‌های منتشر شده
     */
    #[Scope]
    public function published(Builder $query)
    {
        return $query->where('is_active', true)
            ->whereNotNull('published_at')
            ->where('published_at', '<=', now());
    }

    /**
     * Scope برای پست‌های عمومی
     */
    #[Scope]
    public function public(Builder $query)
    {
        return $query->where('visibility', 'general');
    }

    /**
     * Scope برای پست‌های خصوصی
     */
    #[Scope]
    public function private(Builder $query)
    {
        return $query->where('visibility', 'private');
    }

    /**
     * Scope برای پست‌های محدود
     */
    #[Scope]
    public function limited(Builder $query)
    {
        return $query->where('visibility', 'limited');
    }

    /**
     * Scope برای پست‌های یک نویسنده
     */
    #[Scope]
    public function byAuthor(Builder $query, int $userId)
    {
        return $query->where('user_id', $userId);
    }

    /**
     * Scope برای پست‌های یک دسته‌بندی
     */
    #[Scope]
    public function scopeByCategory(Builder $query, int $categoryId)
    {
        return $query->where('category_id', $categoryId);
    }

    /**
     * Scope برای جستجو در عنوان و محتوا
     */
    #[Scope]
    public function scopeSearch(Builder $query, string $searchTerm)
    {
        return $query->where(function ($q) use ($searchTerm) {
            $q->where('title', 'LIKE', "%{$searchTerm}%")
                ->orWhere('content', 'LIKE', "%{$searchTerm}%")
                ->orWhere('excerpt', 'LIKE', "%{$searchTerm}%");
        });
    }

    /**
     * Scope برای پست‌های اخیر
     */
    #[Scope]
    public function scopeRecent(Builder $query, int $limit = 10)
    {
        return $query->published()
            ->orderBy('published_at', 'desc')
            ->limit($limit);
    }
}
