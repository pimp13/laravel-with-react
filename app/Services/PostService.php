<?php

namespace App\Services;

use App\Models\Post;
use Illuminate\Http\UploadedFile;
use Illuminate\Support\Facades\DB;

class PostService
{
    private function buildMeta(array $data): ?array
    {
        $meta = $data['meta'] ?? [];
        if (!empty($data['tag'])) {
            $meta['tag'] = $data['tag'];
        }
        unset($data['tag']);
        return !empty($meta) ? $meta : null;
    }

    public function create(array $data, UploadedFile|null $featuredImage = null): Post
    {
        return DB::transaction(function () use ($data, $featuredImage) {
            $data['slug'] = Post::generateUniqueSlug($data['slug'] ?? null, $data['title']);

            if ($featuredImage) {
                $data['featured_image'] = $featuredImage->store(
                    'images' . DIRECTORY_SEPARATOR . 'posts',
                    'public',
                );
            }

            $data['meta'] = $this->buildMeta($data);

            return Post::create($data);
        });
    }
}
