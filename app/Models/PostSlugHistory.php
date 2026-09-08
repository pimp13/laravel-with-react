<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Attributes\Fillable;
use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\Relations\BelongsTo;

/**
 * @property int $id
 * @property int $post_id
 * @property string $slug
 * @property Post $post
 */
#[Fillable([
    'post_id',
    'slug',
])]
class PostSlugHistory extends Model
{
    public function post(): BelongsTo
    {
        return $this->belongsTo(
            Post::class,
            'post_id'
        );
    }
}
