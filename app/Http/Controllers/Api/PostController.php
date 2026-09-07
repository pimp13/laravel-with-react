<?php

namespace App\Http\Controllers\Api;

use App\Http\Controllers\Controller;
use App\Http\Requests\Post\CreatePostRequest;
use App\Http\Requests\Post\UpdatePostRequest;
use App\Models\Post;
use Illuminate\Database\Eloquent\ModelNotFoundException;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\DB;
use Illuminate\Support\Facades\Storage;
use OpenApi\Attributes as OA;

class PostController extends Controller
{
    /**
     * Display a listing of the resource.
     */
    #[OA\Get(
        path: '/api/v1/posts',
        tags: ['Posts'],
        responses: [
            new OA\Response(
                response: 200,
                description: 'Posts retrieved successfully'
            )
        ]
    )]
    public function index()
    {
        $posts = Post::with(['category', 'author'])->get();
        return response()->json([
            'success' => true,
            'data' => $posts
        ]);
    }

    /**
     * Store a newly created resource in storage.
     */
    public function store(CreatePostRequest $request)
    {
        $bodyData = [
            'title' => $request->title,
            'slug' => Post::generateUniqueSlug(
                $request->slug,
                $request->title
            ),
            'content' => $request->input('content'),
            'is_active' => $request->boolean('is_active'),
            'user_id' => $request->user_id,
            'category_id' => $request->category_id,
            'visibility' => $request->visibility,
            'excerpt' => $request->excerpt,
            'published_at' => $request->published_at,
        ];

        $bodyData['meta'] = array_filter([
            'tag' => $request->tag,
            ...($request->meta ?? []),
        ]) ?: null;
        // $bodyData['meta'] = $request->meta ?: (
        //     $request->tag
        //     ? ['tag' => $request->tag]
        //     : null
        // );

        if ($request->hasFile('featured_image')) {
            $bodyData['featured_image'] = $request
                ->file('featured_image')
                ->store('images', 'public');
        } else {
            $bodyData['featured_image'] = 'https://placehold.co/600x400';
        }

        $post = Post::create($bodyData);

        return response()->json([
            'success' => true,
            'message' => 'a new post created successfully',
            'data' => $post
        ]);
    }

    /**
     * Display the specified resource.
     */
    public function show(Post $post)
    {
        $post->load(['category', 'author']);
        return response()->json([
            'success' => true,
            'data' => $post
        ]);
    }

    /**
     * Update the specified resource in storage.
     */
    public function update(UpdatePostRequest $request, Post $post)
    {

        $bodyData = [
            'title' => $request->title,
            'slug' => Post::generateUniqueSlug(
                $request->slug,
                $request->title,
                $post->id
            ),
            'content' => $request->input('content'),
            'is_active' => $request->boolean('is_active'),
            'user_id' => $request->user_id,
            'category_id' => $request->category_id,
            'visibility' => $request->visibility,
            'excerpt' => $request->excerpt,
            'published_at' => $request->published_at,
        ];
        $bodyData['meta'] = array_filter([
            'tag' => $request->tag,
            ...($request->meta ?? []),
        ]) ?: null;

        if ($request->hasFile('featured_image')) {
            $newImage = $request
                ->file('featured_image')
                ->store('images', 'public');
            if (
                $post->featured_image &&
                !str_starts_with($post->featured_image, 'http://') &&
                !str_starts_with($post->featured_image, 'https://')
            ) {
                Storage::disk('public')->delete($post->featured_image);
            }
            $bodyData['featured_image'] = $newImage;
        }

        DB::transaction(function () use ($post, $bodyData) {
            $post->update($bodyData);
        });

        $post->refresh();

        return response()->json([
            'success' => true,
            'message' => 'updated suucessfully',
            'data' => $post
        ]);
    }

    /**
     * Remove the specified resource from storage.
     */
    public function destroy(string $id)
    {
        //
    }
}
