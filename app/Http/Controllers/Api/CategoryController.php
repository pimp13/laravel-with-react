<?php

namespace App\Http\Controllers\Api;

use App\Http\Controllers\Controller;
use App\Http\Requests\CategoryRequest;
use App\Models\Category;
use Illuminate\Http\Request;

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

        return response()->json([
            'success' => true,
            'message' => 'category is created successfully',
            'data' => $category,
        ]);
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
    public function destroy(string $id)
    {
        //
    }
}
