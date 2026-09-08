<?php

namespace App\Models;

use App\Enums\Visibility;
use Carbon\Carbon;
use Illuminate\Database\Eloquent\Attributes\Fillable;
use Illuminate\Database\Eloquent\Attributes\Scope;
use Illuminate\Database\Eloquent\Builder;
use Illuminate\Database\Eloquent\Casts\Attribute;
use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\Relations\BelongsTo;
use Illuminate\Support\Str;

/**
 * @property int $id
 * @property int|null $user_id
 * @property int|null $category_id
 * @property string $title
 * @property string $slug
 * @property string $content
 * @property Visibility $visibility
 * @property string|null $excerpt
 * @property string|null $featured_image
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
        'meta' => 'array',
        'is_active' => 'boolean',
        'visibility' => Visibility::class,
        'published_at' => 'datetime',
    ];

    protected $attributes = [
        'visibility' => Visibility::General->value,
        'is_active' => true,
    ];

    protected $appends = [
        'featured_image_url',
    ];

    protected function featuredImageUrl(): Attribute
    {
        return Attribute::make(
            get: fn(): ?string => $this->featured_image
                ? asset(
                    'storage' .
                        DIRECTORY_SEPARATOR .
                        $this->featured_image
                )
                : null,
        );
    }

    public function category(): BelongsTo
    {
        return $this->belongsTo(
            Category::class,
            'category_id'
        );
    }

    public function author(): BelongsTo
    {
        return $this->belongsTo(
            User::class,
            'user_id'
        );
    }

    public static function generateUniqueSlug(
        ?string $slug,
        string $title,
        ?int $ignoreId = null
    ): string {
        $baseSlug = Str::slug($slug ?: $title);

        if ($baseSlug === '') {
            $baseSlug = 'post';
        }

        $uniqueSlug = $baseSlug;
        $counter = 1;

        while (
            static::query()
            ->where('slug', $uniqueSlug)
            ->when(
                $ignoreId !== null,
                fn(Builder $query) =>
                $query->whereKeyNot($ignoreId)
            )
            ->exists()
        ) {
            $uniqueSlug = "{$baseSlug}-{$counter}";
            $counter++;
        }

        return $uniqueSlug;
    }

    #[Scope]
    protected function published(Builder $query): void
    {
        $query
            ->where('is_active', true)
            ->whereNotNull('published_at')
            ->where('published_at', '<=', now());
    }

    #[Scope]
    protected function public(Builder $query): void
    {
        $query->where(
            'visibility',
            Visibility::General
        );
    }

    #[Scope]
    protected function private(Builder $query): void
    {
        $query->where(
            'visibility',
            Visibility::Private
        );
    }

    #[Scope]
    protected function limited(Builder $query): void
    {
        $query->where(
            'visibility',
            Visibility::Limited
        );
    }

    #[Scope]
    protected function byAuthor(
        Builder $query,
        int $userId
    ): void {
        $query->where('user_id', $userId);
    }

    #[Scope]
    protected function byCategory(
        Builder $query,
        int $categoryId
    ): void {
        $query->where('category_id', $categoryId);
    }

    #[Scope]
    protected function search(
        Builder $query,
        string $searchTerm
    ): void {
        $searchTerm = trim($searchTerm);

        if ($searchTerm === '') {
            return;
        }

        $query->where(function (Builder $query) use ($searchTerm) {
            $query
                ->where('title', 'ILIKE', "%{$searchTerm}%")
                ->orWhere('content', 'ILIKE', "%{$searchTerm}%")
                ->orWhere('excerpt', 'ILIKE', "%{$searchTerm}%");
        });
    }

    #[Scope]
    protected function recent(
        Builder $query,
        int $limit = 10
    ): void {
        $query
            ->published()
            ->latest('published_at')
            ->limit($limit);
    }
}
