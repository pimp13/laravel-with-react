<?php

namespace App\Http\Controllers\Api;

use App\Helpers\ApiResponse;
use App\Http\Controllers\Controller;
use App\Http\Requests\Post\CreatePostRequest;
use App\Http\Requests\Post\UpdatePostRequest;
use App\Http\Resources\PostResource;
use App\Models\Post;
use App\Services\PostService;
use Illuminate\Http\JsonResponse;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\Auth;
use Illuminate\Support\Facades\DB;
use Illuminate\Support\Facades\Storage;
use Inertia\Inertia;
use Inertia\Response;
use OpenApi\Attributes as OA;

class PostController extends Controller
{
    public function __construct(
        private readonly PostService $postService,
    ) {}

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
        $posts = Post::with(['category', 'author'])->orderByDesc('created_at')->get();
        return ApiResponse::success(data: PostResource::collection($posts));
    }


    /**
     * Store a newly created resource in storage.
     */
    #[OA\Post(
        path: '/api/v1/posts',
        tags: ['Posts'],
        responses: [
            new OA\Response(
                response: 200,
                description: 'Posts created successfully'
            )
        ]
    )]
    public function store(CreatePostRequest $request): JsonResponse
    {
        $data = $request->validated();
        $data['user_id'] = Auth::user()->id;
        $result = $this->postService->create($data, $request->file('featured_image'));

        return ApiResponse::success($result, 'پست شما باموفقیت ثبت شد');
    }

    /**
     * Display the specified resource.
     */
    #[OA\Get(
        path: '/api/v1/posts/{id}',
        tags: ['Posts'],
        parameters: [
            new OA\Parameter(
                name: 'id',
                description: 'Post ID',
                in: 'path',
                required: true,
                schema: new OA\Schema(
                    type: 'integer'
                )
            )
        ],
        responses: [
            new OA\Response(
                response: 200,
                description: 'Post retrieved successfully'
            )
        ]
    )]
    public function show(Post $post): JsonResponse
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
    public function update(UpdatePostRequest $request, Post $post): JsonResponse
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

    public function uploadImage(Request $request): JsonResponse
    {
        $request->validate([
            'image' => [
                'required',
                'image',
                'mimes:jpeg,jpg,png,webp,gif',
                'max:5120',
            ],
        ]);

        $file = $request->file('image');

        $filename = str()->uuid() . '.' . $file->getClientOriginalExtension();

        $path = $file->storeAs(
            'posts/images',
            $filename,
            'public'
        );

        return ApiResponse::success(
            message: 'تصویر با موفقیت آپلود شد.',
            data: [
                'path' => $path,
                'url' => asset('storage' . DIRECTORY_SEPARATOR . $path)
            ],
        );
    }


    public function updateStatus(Request $request, Post $post): JsonResponse
    {
        $bodyData = $request->validate([
            'is_active' => 'required|boolean'
        ]);

        $post->update([
            'is_active' => $bodyData['is_active'],
        ]);

        return ApiResponse::success(data: [
            'id' => (int) $post->id,
            'is_active' => (bool) $post->is_active
        ], message: 'وضعیت پست با موفقیت تغییر کرد');
    }


    public function detailsPage(Post $post): Response
    {
        $post->load(['category', 'author']);
        $payload = [
            'post' => $post,
        ];
        return Inertia::render('panel/posts/details', $payload);
    }
}
