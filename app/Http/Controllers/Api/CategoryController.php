<?php

namespace App\Http\Controllers\Api;

use App\Http\Controllers\Controller;
use App\Http\Requests\CategoryRequest;
use App\Models\Category;
use Illuminate\Http\Request;
use Inertia\Inertia;
use Inertia\Response;

class CategoryController extends Controller
{
    /**
     * Display a listing of the resource.
     */
    public function index()
    {
        $categories = Category::orderByDesc('id')
            ->where('parent_id', null)
            ->with('childrenRecursive')
            ->get()
            ->makeHidden(['updated_at']);

        return response()->json([
            'success' => true,
            'data' => $categories
        ]);
    }

    /**
     * Store a newly created resource in storage.
     */
    public function store(CategoryRequest $request)
    {
        $bodyData = [
            'title' => $request->title,
            'is_active' => $request->is_active,
            'parent_id' => $request->parent_id,
            'slug' => $request->slug,
        ];
        $bodyData['meta'] = $request->description ? ['description' => $request->description] : null;
        $category = Category::create($bodyData);

        return Inertia::flash('message', 'دسته بندی با موفقیت ثبت و ساخته شد')->back();
    }

    /**
     * Display the specified resource.
     */
    public function show(Category $category)
    {
        //
    }

    /**
     * Update the specified resource in storage.
     */
    public function update(Request $request, string $id)
    {
        //
    }

    /**
     * Remove the specified resource from storage.
     */
    public function destroy(Category $category)
    {
        $category->delete();
        return Inertia::flash('message', 'دسته بندی باموفقیت حذف شد')->back();
    }

    public function showPage(): Response
    {
        $categories = Category::whereNull('parent_id')
            ->with('childrenRecursive')
            ->withCount('posts')
            ->orderByDesc('posts_count')
            ->orderByDesc('created_at')
            ->get();
        return Inertia::render('panel/category/index', [
            'categories' => $categories
        ]);
    }


    public function toggleActive(Category $category)
    {
        $category->update([
            'is_active' => !$category->is_active
        ]);

        return back();
    }
}
