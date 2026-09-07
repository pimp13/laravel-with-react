<?php

namespace App\Models;

use Carbon\Carbon;
use Illuminate\Database\Eloquent\Attributes\Fillable;
use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\Relations\BelongsTo;
use Illuminate\Database\Eloquent\Relations\HasMany;
use Illuminate\Support\Str;

/**
 * @property int $id
 * @property int $parent_id
 * @property string $title
 * @property string $slug
 * @property bool $is_active
 * @property array $meta
 * @property Carbon|null $created_at
 * @property Carbon|null $updated_at
 */
#[Fillable([
    'title',
    'slug',
    'meta',
    'is_active',
    'parent_id',
])]
class Category extends Model
{
    protected $casts = [
        'meta' => 'array',
        'is_active' => 'boolean',
    ];

    public function parent(): BelongsTo
    {
        return $this->belongsTo(Category::class, 'parent_id');
    }

    public function children(): HasMany
    {
        return $this->HasMany(Category::class, 'parent_id');
    }

    public function childrenRecursive(): HasMany
    {
        return $this->children()->with('childrenRecursive');
    }

    public function isRoot(): bool
    {
        return is_null($this->parent_id);
    }

    public function posts(): HasMany
    {
        return $this->hasMany(Post::class, 'category_id');
    }

    public static function generateUniqueSlug(?string $slug, string $title, ?int $ignoreId = null): string
    {
        $baseSlug = $slug ? Str::slug($slug) : Str::slug($title);
        if (empty($baseSlug)) {
            $baseSlug = Str::slug($title) ?: 'item';
        }

        $uniqueSlug = $baseSlug;
        $counter = 1;
        while (
            static::where('slug', $uniqueSlug)
            ->when($ignoreId, fn($q) => $q->where('id', '!=', $ignoreId))
            ->exists()
        ) {
            $uniqueSlug = $baseSlug . '-' . $counter;
            $counter++;
        }
        return $uniqueSlug;
    }
}
