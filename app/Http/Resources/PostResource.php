<?php

namespace App\Http\Resources;

use Illuminate\Http\Request;
use Illuminate\Http\Resources\Json\JsonResource;

class PostResource extends JsonResource
{
    /**
     * Transform the resource into an array.
     *
     * @return array<string, mixed>
     */
    public function toArray(Request $request): array
    {
        $seo = data_get($this->meta, 'seo', []);

        return [
            'id' => $this->id,

            'title' => $this->title,

            'slug' => $this->slug,

            'excerpt' => $this->excerpt,

            'featured_image' => $this->featured_image,

            'category_id' => $this->category_id,

            'category_title' => $this->category?->title,

            'visibility' => $this->visibility,

            'published_at' => $this->published_at?->toISOString(),

            'is_active' => (bool) $this->is_active,

            'author_name' => $this->author?->name
                ?? data_get($seo, 'author_name'),

            'word_count' => (int) data_get(
                $seo,
                'word_count',
                0
            ),

            'reading_time' => (int) data_get(
                $seo,
                'reading_time',
                0
            ),

            'seo_score' => (int) data_get(
                $seo,
                'seo_score',
                0
            ),

            'created_at' => $this->created_at?->toISOString(),

            'updated_at' => $this->updated_at?->toISOString(),
        ];
    }
}
