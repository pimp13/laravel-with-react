<?php

namespace App\Models;

use Carbon\Carbon;
use Illuminate\Database\Eloquent\Attributes\Fillable;
use Illuminate\Database\Eloquent\Model;


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
    ];
}
